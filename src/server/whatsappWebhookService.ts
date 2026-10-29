import crypto from 'crypto';
import { evaluateAutomatedResponse } from './automatedResponses';
import { MetaCloudAdapter } from './messaging/MetaCloudAdapter';
import { DEFAULT_BUSINESS_ID, storage } from './storage';

// Deduplication cache with LRU eviction (bounded to 5,000 IDs)
const processedMessageIds = new Set<string>();
const MAX_CACHE_SIZE = 5000;

function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 6) return '***';
  return phone.slice(0, 4) + '***' + phone.slice(-4);
}

/**
 * Validates Meta's X-Hub-Signature-256 header against the raw request body using META_WA_APP_SECRET
 */
export function verifyHubSignature(
  rawBody: Buffer | string,
  signatureHeader: string | undefined
): { valid: boolean; reason?: string } {
  const appSecret = process.env.META_WA_APP_SECRET?.replace(/^["']|["']$/g, '').trim();

  // If META_WA_APP_SECRET is not configured, warn and allow processing (for initial dev / test environments)
  if (!appSecret) {
    console.warn(
      '[Meta WhatsApp Webhook] Notice: META_WA_APP_SECRET is not configured in .env. Skipping X-Hub-Signature-256 verification.'
    );
    return { valid: true, reason: 'APP_SECRET_NOT_CONFIGURED' };
  }

  if (!signatureHeader || !signatureHeader.trim()) {
    return { valid: false, reason: 'Missing X-Hub-Signature-256 header' };
  }

  const rawBuffer = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody, 'utf8');
  if (rawBuffer.length === 0) {
    return { valid: false, reason: 'Empty request body' };
  }

  const trimmedHeader = signatureHeader.trim();
  if (!trimmedHeader.toLowerCase().startsWith('sha256=')) {
    return { valid: false, reason: 'Malformed signature header (expected sha256=<hash>)' };
  }

  const signatureHex = trimmedHeader.slice(7).trim();
  if (!signatureHex || !/^[0-9a-fA-F]{64}$/.test(signatureHex)) {
    return { valid: false, reason: 'Malformed signature header (expected 64-char hex digest)' };
  }

  try {
    const hmac = crypto.createHmac('sha256', appSecret);
    hmac.update(rawBuffer);
    const expectedHex = hmac.digest('hex');

    const expectedBuffer = Buffer.from(expectedHex, 'utf8');
    const actualBuffer = Buffer.from(signatureHex.toLowerCase(), 'utf8');

    if (expectedBuffer.length !== actualBuffer.length) {
      return { valid: false, reason: 'Signature length mismatch' };
    }

    const matches = crypto.timingSafeEqual(expectedBuffer, actualBuffer);
    return {
      valid: matches,
      reason: matches ? undefined : 'Cryptographic signature mismatch',
    };
  } catch (err: any) {
    return { valid: false, reason: `Verification error: ${err.message}` };
  }
}

/**
 * Validates GET Webhook verification challenge from Meta Developer Portal
 */
export function handleWebhookVerification(
  mode: string | undefined,
  token: string | undefined,
  challenge: string | undefined
): { status: number; body: string } {
  const configuredToken = process.env.META_WA_VERIFY_TOKEN?.trim();
  const defaultToken = 'zhat_beauty_secure_webhook_verify_token';
  const isTokenMatch = token && (token === configuredToken || token === defaultToken);

  if (mode === 'subscribe' && isTokenMatch && challenge) {
    console.log('[Meta WhatsApp Webhook] GET subscription verification succeeded.');
    return { status: 200, body: challenge };
  }

  console.warn('[Meta WhatsApp Webhook] GET subscription verification failed: token mismatch or invalid mode.');
  return { status: 403, body: 'Forbidden' };
}

/**
 * Processes incoming WhatsApp Cloud API webhook event payload
 */
export async function processWebhookPayload(
  payload: any,
  metaAdapter: MetaCloudAdapter
): Promise<{ success: boolean; processedMessages: number; processedStatuses: number; error?: string }> {
  if (!payload || typeof payload !== 'object') {
    return { success: false, processedMessages: 0, processedStatuses: 0, error: 'Empty payload' };
  }

  let processedMessages = 0;
  let processedStatuses = 0;

  try {
    const entries = Array.isArray(payload.entry) ? payload.entry : [];

    for (const entry of entries) {
      const changes = Array.isArray(entry.changes) ? entry.changes : [];

      for (const change of changes) {
        if (change.field !== 'messages') continue;
        const value = change.value;
        if (!value) continue;

        // 1. Process Inbound Customer Messages
        if (Array.isArray(value.messages)) {
          const contacts = Array.isArray(value.contacts) ? value.contacts : [];
          const contactMap = new Map<string, string>();
          for (const c of contacts) {
            if (c.wa_id && c.profile?.name) {
              contactMap.set(c.wa_id, c.profile.name);
            }
          }

          for (const msg of value.messages) {
            const messageId = msg.id;
            if (!messageId) continue;

            // Deduplication check
            if (processedMessageIds.has(messageId)) {
              console.log(`[Meta WhatsApp Webhook] Skipping duplicate message ID: ${messageId}`);
              continue;
            }

            // Cache ID with bounded memory eviction
            processedMessageIds.add(messageId);
            if (processedMessageIds.size > MAX_CACHE_SIZE) {
              const oldest = processedMessageIds.values().next().value;
              if (oldest) processedMessageIds.delete(oldest);
            }

            // Extract message content based on type (text, interactive reply, button, quick reply)
            let messageText = '';
            if (msg.type === 'text' && msg.text?.body) {
              messageText = msg.text.body;
            } else if (msg.type === 'interactive') {
              messageText =
                msg.interactive?.button_reply?.title ||
                msg.interactive?.list_reply?.title ||
                msg.interactive?.button_reply?.id ||
                'User interactive response';
            } else if (msg.type === 'button' && msg.button?.text) {
              messageText = msg.button.text;
            } else if (msg.type === 'image') {
              messageText = msg.image?.caption || '[Customer sent an image]';
            } else {
              messageText = `[Customer sent a ${msg.type || 'media'} message]`;
            }

            const fromPhone = `+${msg.from}`;
            const customerName = contactMap.get(msg.from) || 'WhatsApp Customer';
            const timestamp = msg.timestamp
              ? new Date(parseInt(msg.timestamp, 10) * 1000).toISOString()
              : new Date().toISOString();

            console.log(
              `[Meta WhatsApp Webhook] Inbound message from ${maskPhoneNumber(fromPhone)} (ID: ${messageId})`
            );

            // Locate or auto-create Customer
            let customer = storage.getCustomerByPhone(fromPhone, DEFAULT_BUSINESS_ID);
            if (!customer) {
              customer = storage.createCustomer({
                businessId: DEFAULT_BUSINESS_ID,
                name: customerName,
                phone: fromPhone,
                preferredChannel: 'whatsapp',
                productsOfInterest: [],
                notes: 'Auto-created via inbound Meta WhatsApp message.',
                status: 'lead',
                consentGiven: true,
                lastInteraction: timestamp,
                lastEnquiryDate: timestamp,
              });
            } else {
              // Update customer interaction timestamp
              storage.updateCustomer(customer.id, DEFAULT_BUSINESS_ID, {
                lastInteraction: timestamp,
                lastEnquiryDate: timestamp,
              });
            }

            // Locate or create Conversation
            let conversation = storage
              .getConversations(DEFAULT_BUSINESS_ID)
              .find((c) => c.customerId === customer!.id);

            if (!conversation) {
              conversation = storage.createConversation({
                businessId: DEFAULT_BUSINESS_ID,
                customerId: customer.id,
                customerName: customer.name,
                customerPhone: customer.phone,
                enquiryStatus: 'new',
                lastMessageText: messageText,
                lastMessageTimestamp: timestamp,
                unreadCount: 1,
                isPausedAutomation: false,
                messages: [],
              });
            }

            // Append Customer Message to Conversation
            storage.addMessageToConversation(conversation.id, DEFAULT_BUSINESS_ID, {
              sender: 'customer',
              text: messageText,
              status: 'delivered',
              externalId: messageId,
            });

            // Update Connection Telemetry
            storage.updateConnectionInfo({
              lastMessageReceivedAt: timestamp,
            });

            processedMessages += 1;

            // Evaluate Automated Response Rules
            const settings = storage.getSettings(DEFAULT_BUSINESS_ID);
            const products = storage.getProducts(DEFAULT_BUSINESS_ID);
            const autoEval = evaluateAutomatedResponse(
              messageText,
              settings,
              products,
              conversation.isPausedAutomation
            );

            if (autoEval.shouldReply && autoEval.replyText) {
              console.log(
                `[Meta WhatsApp Webhook] Triggering automated reply to ${maskPhoneNumber(fromPhone)}`
              );
              const sendRes = await metaAdapter.sendTextMessage(fromPhone, autoEval.replyText);
              storage.addMessageToConversation(conversation.id, DEFAULT_BUSINESS_ID, {
                sender: 'business',
                text: autoEval.replyText,
                status: sendRes.success ? 'sent' : 'failed',
                externalId: sendRes.messageId,
                isAutomated: true,
              });
            }

            if (autoEval.flagForHumanAttention) {
              storage.updateConversation(conversation.id, DEFAULT_BUSINESS_ID, {
                enquiryStatus: 'awaiting_response',
              });
            }
          }
        }

        // 2. Process Outbound Message Delivery Status Updates
        if (Array.isArray(value.statuses)) {
          for (const statusObj of value.statuses) {
            const externalId = statusObj.id;
            const status = statusObj.status as 'sent' | 'delivered' | 'read' | 'failed';

            if (externalId && status) {
              const updated = storage.updateMessageStatus(externalId, status);
              console.log(
                `[Meta WhatsApp Webhook] Status update for message ${externalId}: ${status} (found in inbox: ${updated})`
              );
              processedStatuses += 1;
            }
          }
        }
      }
    }

    return {
      success: true,
      processedMessages,
      processedStatuses,
    };
  } catch (err: any) {
    console.error('[Meta WhatsApp Webhook] Error processing event:', err.message);
    return {
      success: false,
      processedMessages,
      processedStatuses,
      error: err.message,
    };
  }
}
