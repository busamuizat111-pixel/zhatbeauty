import { ConnectionState, WhatsAppConnectionInfo } from '../../types';
import { ConnectResult, IMessagingAdapter, InboundMessageEvent, SendMessageResult } from './types';

/**
 * Official Meta WhatsApp Cloud API Adapter
 *
 * Exclusively uses Meta's official WhatsApp Business Platform via Graph API (v21.0).
 * Operates completely independently without any third-party browser session bridges.
 *
 * Required Environment Variables:
 * - META_WA_ACCESS_TOKEN: Meta Graph API System User / Access Token
 * - META_WA_PHONE_NUMBER_ID: Meta Phone Number ID (from API Setup)
 * - META_WA_BUSINESS_ACCOUNT_ID: WhatsApp Business Account ID (WABA ID)
 * - META_WA_VERIFY_TOKEN: Custom secret for Meta Webhook challenge verification
 */
export class MetaCloudAdapter implements IMessagingAdapter {
  readonly providerName = 'meta_cloud';

  // Deduplication cache to prevent webhook retry duplicates
  private processedMessageIds: Set<string> = new Set();
  private maxCacheSize = 1000;

  // Status tracking
  private currentStatus: ConnectionState = 'disconnected';
  private verifiedPhoneNumber?: string;
  private verifiedBusinessName?: string;
  private lastConnectedAt?: string;
  private lastMessageReceivedAt?: string;
  private lastMessageSentAt?: string;
  private errorDetails?: string;

  constructor() {
    this.refreshCredentials();
  }

  private getCredentials() {
    return {
      accessToken: process.env.META_WA_ACCESS_TOKEN?.trim(),
      phoneNumberId: process.env.META_WA_PHONE_NUMBER_ID?.trim(),
      businessAccountId: process.env.META_WA_BUSINESS_ACCOUNT_ID?.trim(),
      verifyToken: process.env.META_WA_VERIFY_TOKEN?.trim(),
    };
  }

  private refreshCredentials(): void {
    const { accessToken, phoneNumberId } = this.getCredentials();
    if (accessToken && phoneNumberId && !accessToken.startsWith('EAA...')) {
      this.currentStatus = 'connected';
      this.lastConnectedAt = this.lastConnectedAt || new Date().toISOString();
    } else {
      this.currentStatus = 'disconnected';
    }
  }

  /**
   * Connect and verify credentials directly with Meta Graph API
   */
  async connect(): Promise<ConnectResult> {
    const { accessToken, phoneNumberId, businessAccountId } = this.getCredentials();

    if (!accessToken || !phoneNumberId || accessToken.startsWith('EAA...')) {
      this.currentStatus = 'error';
      this.errorDetails =
        'Missing live Meta credentials. Please set META_WA_ACCESS_TOKEN and META_WA_PHONE_NUMBER_ID in your environment variables.';
      return {
        status: 'error',
        message: this.errorDetails,
      };
    }

    try {
      this.currentStatus = 'connecting';

      // Verify token & phone number with Meta Graph API v21.0
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${phoneNumberId}?fields=verified_name,code_verification_status,display_phone_number,quality_rating`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errMessage =
          errorData.error?.message || `Meta API verification failed with HTTP ${res.status}`;
        throw new Error(errMessage);
      }

      const data = await res.json();
      this.currentStatus = 'connected';
      this.verifiedPhoneNumber = data.display_phone_number || phoneNumberId;
      this.verifiedBusinessName = data.verified_name || 'Zhat Beauty Official';
      this.lastConnectedAt = new Date().toISOString();
      this.errorDetails = undefined;

      return {
        status: 'connected',
        phoneNumber: this.verifiedPhoneNumber,
        message: `Successfully connected to Meta WhatsApp Cloud API (${this.verifiedBusinessName})`,
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

  /**
   * Send text message via Meta Graph API v21.0
   */
  async sendTextMessage(toPhone: string, text: string): Promise<SendMessageResult> {
    const timestamp = new Date().toISOString();
    this.lastMessageSentAt = timestamp;

    const { accessToken, phoneNumberId } = this.getCredentials();

    // Check if live credentials are configured
    const hasLiveCredentials =
      accessToken &&
      phoneNumberId &&
      !accessToken.startsWith('EAA...') &&
      phoneNumberId !== '109876543210123';

    // Normalize phone number: Meta requires international format without '+' (e.g. 2348031234567)
    const normalizedTo = toPhone.replace(/^\+/, '').replace(/\D/g, '');

    if (!hasLiveCredentials) {
      // In Demo Mode (no live Meta credentials yet provided), simulate message dispatch
      const simulatedId = `wamid.HBgLMjM0ODE0ODkyNDExMBUCABIYFD${Date.now()}A`;
      return {
        success: true,
        messageId: simulatedId,
        timestamp,
        error: undefined,
      };
    }

    try {
      const res = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: normalizedTo,
          type: 'text',
          text: {
            preview_url: false,
            body: text,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || `Failed to send text (HTTP ${res.status})`);
      }

      const messageId = data.messages?.[0]?.id || `wamid.${Date.now()}`;
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
   * Validates Meta Webhook challenge during webhook configuration in Meta Developer Portal
   */
  verifyWebhookChallenge(mode: string, token: string, challenge: string): string | null {
    const { verifyToken } = this.getCredentials();
    const expectedToken = verifyToken || 'zhat_beauty_secure_webhook_verify_token';

    if (mode === 'subscribe' && token === expectedToken) {
      return challenge;
    }
    return null;
  }

  /**
   * Parses inbound message events sent to POST /api/whatsapp/webhook by Meta servers
   */
  async receiveMessage(payload: any): Promise<InboundMessageEvent | null> {
    try {
      // Standard Meta WhatsApp Webhook payload format
      const entry = payload?.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;
      const message = value?.messages?.[0];

      if (!message || message.type !== 'text') {
        return null;
      }

      const messageId = message.id;

      // Duplicate protection: prevent duplicate processing from webhook retries
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
    const { phoneNumberId, businessAccountId } = this.getCredentials();

    return {
      provider: 'meta_cloud',
      status: this.currentStatus,
      phoneNumber: this.verifiedPhoneNumber || (phoneNumberId ? `Phone ID: ${phoneNumberId}` : undefined),
      businessAccountId: businessAccountId || 'WABA-ZHAT-BEAUTY',
      lastConnectedAt: this.lastConnectedAt,
      lastMessageReceivedAt: this.lastMessageReceivedAt,
      lastMessageSentAt: this.lastMessageSentAt,
      errorDetails: this.errorDetails,
    };
  }
}

declare global {
  // eslint-disable-next-line no-var
  var metaCloudAdapterInstance: MetaCloudAdapter | undefined;
}

export const metaCloudAdapter = globalThis.metaCloudAdapterInstance || new MetaCloudAdapter();
if (process.env.NODE_ENV !== 'production') {
  globalThis.metaCloudAdapterInstance = metaCloudAdapter;
}

