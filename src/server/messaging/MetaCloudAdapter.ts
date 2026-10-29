import { ConnectionState, WhatsAppConnectionInfo } from '../../types';
import { ConnectResult, IMessagingAdapter, InboundMessageEvent, SendMessageResult } from './types';

/**
 * Provider B: Meta WhatsApp Cloud API Adapter
 *
 * Official Meta Cloud API integration using Graph API v19.0
 * Uses official WhatsApp Business Account webhooks and credentials.
 */
export class MetaCloudAdapter implements IMessagingAdapter {
  readonly providerName = 'meta_cloud';

  private accessToken?: string;
  private phoneNumberId?: string;
  private businessAccountId?: string;
  private verifyToken?: string;

  // Deduplication cache to prevent webhook retry duplicates
  private processedMessageIds: Set<string> = new Set();
  private maxCacheSize = 1000;

  // Status tracking
  private currentStatus: ConnectionState = 'disconnected';
  private lastConnectedAt?: string;
  private lastMessageReceivedAt?: string;
  private lastMessageSentAt?: string;
  private errorDetails?: string;

  constructor() {
    this.accessToken = process.env.META_WA_ACCESS_TOKEN;
    this.phoneNumberId = process.env.META_WA_PHONE_NUMBER_ID;
    this.businessAccountId = process.env.META_WA_BUSINESS_ACCOUNT_ID;
    this.verifyToken = process.env.META_WA_VERIFY_TOKEN;

    if (this.accessToken && this.phoneNumberId) {
      this.currentStatus = 'connected';
      this.lastConnectedAt = new Date().toISOString();
    } else {
      this.currentStatus = 'disconnected';
    }
  }

  async connect(): Promise<ConnectResult> {
    if (!this.accessToken || !this.phoneNumberId) {
      this.currentStatus = 'error';
      this.errorDetails =
        'Missing required credentials: META_WA_ACCESS_TOKEN and META_WA_PHONE_NUMBER_ID must be set.';
      return {
        status: 'error',
        message: this.errorDetails,
      };
    }

    try {
      this.currentStatus = 'connecting';
      // Verify token with Meta Graph API
      const res = await fetch(
        `https://graph.facebook.com/v19.0/${this.phoneNumberId}?fields=verified_name,code_verification_status,display_phone_number`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || `Meta API verification failed with HTTP ${res.status}`
        );
      }

      const data = await res.json();
      this.currentStatus = 'connected';
      this.lastConnectedAt = new Date().toISOString();
      this.errorDetails = undefined;

      return {
        status: 'connected',
        phoneNumber: data.display_phone_number,
        message: `Successfully connected to Meta WhatsApp Cloud API (${data.verified_name || 'Verified Business'})`,
      };
    } catch (err: any) {
      this.currentStatus = 'error';
      this.errorDetails = err.message;
      return {
        status: 'error',
        message: err.message,
      };
    }
  }

  async getConnectionStatus(): Promise<WhatsAppConnectionInfo> {
    return this.getConnectionInformation();
  }

  async disconnect(): Promise<void> {
    this.currentStatus = 'disconnected';
    this.errorDetails = undefined;
  }

  async sendTextMessage(toPhone: string, text: string): Promise<SendMessageResult> {
    const timestamp = new Date().toISOString();
    this.lastMessageSentAt = timestamp;

    if (!this.accessToken || !this.phoneNumberId) {
      return {
        success: false,
        messageId: '',
        timestamp,
        error: 'Cannot send message: Meta credentials are not configured.',
      };
    }

    // Normalize phone number: Meta requires international format without '+' (e.g. 2348031234567)
    const normalizedTo = toPhone.replace(/^\+/, '').replace(/\D/g, '');

    try {
      const res = await fetch(
        `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.accessToken}`,
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: normalizedTo,
            type: 'text',
            text: { body: text },
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || `Failed to send text (HTTP ${res.status})`);
      }

      const messageId = data.messages?.[0]?.id || `meta-${Date.now()}`;
      return {
        success: true,
        messageId,
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

  /**
   * Validates Meta Webhook challenge during setup
   */
  verifyWebhookChallenge(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === this.verifyToken) {
      return challenge;
    }
    return null;
  }

  async receiveMessage(payload: any): Promise<InboundMessageEvent | null> {
    try {
      // Parse standard Meta WhatsApp Webhook payload format
      const entry = payload?.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;
      const message = value?.messages?.[0];

      if (!message || message.type !== 'text') {
        return null;
      }

      const messageId = message.id;

      // Duplicate protection: ignore if we already handled this message ID
      if (this.processedMessageIds.has(messageId)) {
        return null;
      }

      // Add to deduplication cache with bounds
      this.processedMessageIds.add(messageId);
      if (this.processedMessageIds.size > this.maxCacheSize) {
        const first = this.processedMessageIds.values().next().value;
        if (first) this.processedMessageIds.delete(first);
      }

      const contact = value.contacts?.[0];
      const fromPhone = `+${message.from}`;
      const fromName = contact?.profile?.name || 'WhatsApp Customer';
      const text = message.text?.body || '';
      const timestamp = new Date(parseInt(message.timestamp, 10) * 1000).toISOString();

      this.lastMessageReceivedAt = timestamp;

      return {
        messageId,
        fromPhone,
        fromName,
        text,
        timestamp,
        rawPayload: payload,
      };
    } catch {
      return null;
    }
  }

  getConnectionInformation(): WhatsAppConnectionInfo {
    return {
      provider: 'meta_cloud',
      status: this.currentStatus,
      phoneNumber: this.phoneNumberId ? `Phone ID: ${this.phoneNumberId}` : undefined,
      businessAccountId: this.businessAccountId,
      lastConnectedAt: this.lastConnectedAt,
      lastMessageReceivedAt: this.lastMessageReceivedAt,
      lastMessageSentAt: this.lastMessageSentAt,
      errorDetails: this.errorDetails,
    };
  }
}
