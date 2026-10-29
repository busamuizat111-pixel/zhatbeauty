import { ConnectionState, WhatsAppConnectionInfo } from '../../types';
import { ConnectResult, IMessagingAdapter, InboundMessageEvent, SendMessageResult } from './types';

/**
 * Provider A: Unofficial WhatsApp Web Adapter
 *
 * ARCHITECTURAL NOTICE:
 * This adapter communicates with a dedicated, persistent Node.js service (services/whatsapp-web-service)
 * running Puppeteer and whatsapp-web.js with LocalAuth session caching.
 *
 * CRITICAL WARNINGS:
 * 1. whatsapp-web.js is an unofficial reverse-engineered library.
 * 2. It may break without notice when WhatsApp changes its web client.
 * 3. Meta actively monitors and may restrict or ban numbers that use automated browser sessions.
 * 4. Never run Puppeteer directly inside serverless functions or Next.js edge routes.
 */
export class WhatsAppWebAdapter implements IMessagingAdapter {
  readonly providerName = 'whatsapp_web';
  private serviceUrl: string;
  private serviceApiKey: string;
  private isDemoMode: boolean;

  // Cached state
  private currentStatus: ConnectionState = 'disconnected';
  private qrCode?: string;
  private phoneNumber?: string;
  private lastConnectedAt?: string;
  private lastMessageReceivedAt?: string;
  private lastMessageSentAt?: string;
  private errorDetails?: string;

  constructor(options?: { serviceUrl?: string; serviceApiKey?: string; isDemoMode?: boolean }) {
    this.serviceUrl = options?.serviceUrl || process.env.WA_WEB_SERVICE_URL || 'http://localhost:3001';
    this.serviceApiKey = options?.serviceApiKey || process.env.WA_WEB_SERVICE_KEY || 'demo-service-key';
    this.isDemoMode = options?.isDemoMode ?? (!process.env.WA_WEB_SERVICE_URL);

    // If in demo mode, set up a realistic connected state for demonstration
    if (this.isDemoMode) {
      this.currentStatus = 'connected';
      this.phoneNumber = '+2348039876543';
      this.lastConnectedAt = new Date().toISOString();
      this.lastMessageReceivedAt = new Date(Date.now() - 1000 * 60 * 15).toISOString();
      this.lastMessageSentAt = new Date(Date.now() - 1000 * 60 * 5).toISOString();
    }
  }

  async connect(): Promise<ConnectResult> {
    if (this.isDemoMode) {
      // In demo mode: simulate QR code generation for demonstration
      this.currentStatus = 'connected';
      this.phoneNumber = '+2348039876543';
      this.lastConnectedAt = new Date().toISOString();
      return {
        status: 'connected',
        phoneNumber: '+2348039876543',
        message: 'DEMO MODE: Simulated WhatsApp Web pairing active. No live messages will be sent to real devices.',
      };
    }

    try {
      this.currentStatus = 'connecting';
      const res = await fetch(`${this.serviceUrl}/session/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.serviceApiKey}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Microservice responded with status ${res.status}`);
      }

      const data = await res.json();
      this.currentStatus = data.status || 'connecting';
      this.qrCode = data.qrCode;
      this.phoneNumber = data.phoneNumber;
      if (this.currentStatus === 'connected') {
        this.lastConnectedAt = new Date().toISOString();
      }

      return {
        status: this.currentStatus,
        qrCode: this.qrCode,
        phoneNumber: this.phoneNumber,
        message: data.message,
      };
    } catch (err: any) {
      this.currentStatus = 'error';
      this.errorDetails = `Failed to connect to persistent WhatsApp Web service at ${this.serviceUrl}: ${err.message}`;
      return {
        status: 'error',
        message: this.errorDetails,
      };
    }
  }

  async getConnectionStatus(): Promise<WhatsAppConnectionInfo> {
    if (!this.isDemoMode) {
      try {
        const res = await fetch(`${this.serviceUrl}/session/status`, {
          headers: { Authorization: `Bearer ${this.serviceApiKey}` },
        });
        if (res.ok) {
          const data = await res.json();
          this.currentStatus = data.status;
          this.qrCode = data.qrCode;
          this.phoneNumber = data.phoneNumber;
          this.errorDetails = data.error;
        }
      } catch (err: any) {
        this.currentStatus = 'error';
        this.errorDetails = `WhatsApp Web microservice unreachable: ${err.message}`;
      }
    }

    return this.getConnectionInformation();
  }

  async disconnect(): Promise<void> {
    if (!this.isDemoMode) {
      try {
        await fetch(`${this.serviceUrl}/session/disconnect`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${this.serviceApiKey}` },
        });
      } catch {
        // Log silently
      }
    }
    this.currentStatus = 'disconnected';
    this.qrCode = undefined;
    this.errorDetails = undefined;
  }

  async sendTextMessage(toPhone: string, text: string): Promise<SendMessageResult> {
    const timestamp = new Date().toISOString();
    this.lastMessageSentAt = timestamp;

    if (this.isDemoMode) {
      return {
        success: true,
        messageId: `demo-msg-${Date.now()}`,
        timestamp,
      };
    }

    try {
      const res = await fetch(`${this.serviceUrl}/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.serviceApiKey}`,
        },
        body: JSON.stringify({ to: toPhone, message: text }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to send text (HTTP ${res.status})`);
      }

      const data = await res.json();
      return {
        success: true,
        messageId: data.messageId || `wweb-${Date.now()}`,
        timestamp,
      };
    } catch (err: any) {
      return {
        success: false,
        messageId: '',
        timestamp,
        error: err.message,
      };
    }
  }

  async receiveMessage(payload: any): Promise<InboundMessageEvent | null> {
    if (!payload || !payload.body) return null;
    this.lastMessageReceivedAt = new Date().toISOString();

    return {
      messageId: payload.id?._serialized || payload.id || `in-${Date.now()}`,
      fromPhone: payload.from?.replace('@c.us', '') || payload.sender || '',
      fromName: payload._data?.notifyName || payload.senderName || 'WhatsApp Customer',
      text: payload.body,
      timestamp: new Date((payload.timestamp || Date.now() / 1000) * 1000).toISOString(),
      rawPayload: payload,
    };
  }

  getConnectionInformation(): WhatsAppConnectionInfo {
    return {
      provider: 'whatsapp_web',
      status: this.currentStatus,
      qrCode: this.qrCode,
      phoneNumber: this.phoneNumber,
      lastConnectedAt: this.lastConnectedAt,
      lastMessageReceivedAt: this.lastMessageReceivedAt,
      lastMessageSentAt: this.lastMessageSentAt,
      errorDetails: this.errorDetails,
    };
  }
}
