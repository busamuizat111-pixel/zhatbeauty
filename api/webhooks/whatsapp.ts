import type { IncomingMessage, ServerResponse } from 'http';
import { parse as parseUrl } from 'url';
import crypto from 'crypto';

/**
 * Vercel Serverless Function Configuration
 * Disable automatic bodyParser so we can capture the pristine raw request stream
 * required for cryptographic HMAC SHA-256 verification (X-Hub-Signature-256).
 */
export const config = {
  api: {
    bodyParser: false,
  },
};

// Deduplication cache with bounded memory eviction (5,000 entries)
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
  rawBuffer: Buffer,
  signatureHeader: string | undefined
): { valid: boolean; reason?: string } {
  const appSecret = process.env.META_WA_APP_SECRET?.trim();

  // If META_WA_APP_SECRET is not yet configured, log notice and permit in development
  if (!appSecret) {
    console.warn(
      '[Meta WhatsApp Webhook] Notice: META_WA_APP_SECRET is not configured. Skipping X-Hub-Signature-256 verification.'
    );
    return { valid: true, reason: 'APP_SECRET_NOT_CONFIGURED' };
  }

  if (!signatureHeader) {
    return { valid: false, reason: 'Missing X-Hub-Signature-256 header' };
  }

  const [algo, signature] = signatureHeader.split('=');
  if (algo !== 'sha256' || !signature) {
    return { valid: false, reason: 'Malformed signature header (expected sha256=<hash>)' };
  }

  try {
    const hmac = crypto.createHmac('sha256', appSecret);
    hmac.update(rawBuffer);
    const expected = hmac.digest('hex');

    const expectedBuffer = Buffer.from(expected, 'hex');
    const actualBuffer = Buffer.from(signature, 'hex');

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
 * Runs instantaneously with zero database or MongoDB overhead.
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

  console.warn(
    '[Meta WhatsApp Webhook] GET subscription verification failed: token mismatch or invalid mode.'
  );
  return { status: 403, body: 'Forbidden' };
}

/**
 * Dispatches text message via official Meta Graph API v21.0
 */
async function sendMetaCloudTextMessage(
  toPhone: string,
  text: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const accessToken = process.env.META_WA_ACCESS_TOKEN?.trim();
  const phoneNumberId = process.env.META_WA_PHONE_NUMBER_ID?.trim();

  if (!accessToken || !phoneNumberId || accessToken.startsWith('EAA...')) {
    return { success: false, error: 'Credentials not configured' };
  }

  const normalizedTo = toPhone.replace(/^\+/, '').replace(/\D/g, '');

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

    const data = (await res.json()) as any;
    if (!res.ok) {
      throw new Error(data.error?.message || `HTTP ${res.status}`);
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  } catch (err: any) {
    console.error('[Meta WhatsApp Webhook] Failed to send automated reply:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Formulate automatic contextual reply for incoming customer inquiries
 */
function getAutomatedReply(messageText: string): string | null {
  const text = messageText.toLowerCase().trim();

  // Bank details request
  if (
    text.includes('account') ||
    text.includes('bank') ||
    text.includes('transfer') ||
    text.includes('pay') ||
    text.includes('payment')
  ) {
    return (
      'Thank you for your interest in Zhat Beauty! ✨\n\n' +
      'Here are our official payment details:\n' +
      '🏦 Bank: Access Bank\n' +
      '🔢 Account Number: 0123456789\n' +
      '👤 Account Name: Zhat Beauty Enterprises\n\n' +
      'Please send your payment receipt here once completed so our team can process your order promptly.'
    );
  }

  // Greeting
  if (
    text === 'hi' ||
    text === 'hello' ||
    text.startsWith('good morning') ||
    text.startsWith('good afternoon') ||
    text.startsWith('good day') ||
    text.startsWith('salam') ||
    text.includes('available') ||
    text.includes('price')
  ) {
    return (
      'Hello and welcome to Zhat Beauty! 🌸\n\n' +
      'Thank you for contacting us. We have received your message and an agent will be with you shortly.\n\n' +
      'You can also explore our available collection and current offers on our website: https://zhatbeauty.vercel.app'
    );
  }

  return null;
}

/**
 * Safely extracts raw buffer from incoming request
 */
async function getRawBodyBuffer(req: any): Promise<Buffer> {
  if (req.rawBody) {
    return Buffer.isBuffer(req.rawBody) ? req.rawBody : Buffer.from(req.rawBody);
  }
  if (req.body) {
    if (Buffer.isBuffer(req.body)) return req.body;
    if (typeof req.body === 'string') return Buffer.from(req.body, 'utf8');
    if (typeof req.body === 'object') return Buffer.from(JSON.stringify(req.body), 'utf8');
  }

  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', (err: any) => reject(err));
  });
}

/**
 * Canonical Vercel Serverless Function Handler
 * Route: /api/webhooks/whatsapp
 * Self-contained: No external uncompiled TypeScript module resolution errors.
 */
export default async function handler(req: any, res: any) {
  const parsedUrl = parseUrl(req.url || '', true);
  const method = req.method?.toUpperCase();

  // -------------------------------------------------------------
  // GET: Meta Webhook Subscription Verification
  // -------------------------------------------------------------
  if (method === 'GET') {
    const query = req.query || parsedUrl.query || {};
    const mode = (query['hub.mode'] || '') as string;
    const token = (query['hub.verify_token'] || '') as string;
    const challenge = (query['hub.challenge'] || '') as string;

    const verification = handleWebhookVerification(mode, token, challenge);
    res.setHeader('Content-Type', 'text/plain');
    res.statusCode = verification.status;
    return res.end(verification.body);
  }

  // -------------------------------------------------------------
  // POST: Inbound Messages & Delivery Status Updates
  // -------------------------------------------------------------
  if (method === 'POST') {
    try {
      // 1. Read raw request buffer for cryptographic HMAC verification
      const rawBuffer = await getRawBodyBuffer(req);

      // 2. Validate X-Hub-Signature-256 using META_WA_APP_SECRET
      const signatureHeader = (req.headers['x-hub-signature-256'] || '') as string;
      const signatureCheck = verifyHubSignature(rawBuffer, signatureHeader);

      if (!signatureCheck.valid) {
        console.warn(
          `[Meta WhatsApp Webhook - Vercel] Request rejected: ${signatureCheck.reason}`
        );
        res.statusCode = 403;
        res.setHeader('Content-Type', 'application/json');
        return res.end(
          JSON.stringify({ error: 'Invalid signature', reason: signatureCheck.reason })
        );
      }

      // 3. Immediately respond with 200 OK to satisfy Meta's 20-second timeout
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end('EVENT_RECEIVED');

      // 4. Parse JSON payload and process asynchronously
      const rawText = rawBuffer.toString('utf8');
      if (!rawText.trim()) return;

      const payload = JSON.parse(rawText);
      const entries = Array.isArray(payload?.entry) ? payload.entry : [];

      for (const entry of entries) {
        const changes = Array.isArray(entry?.changes) ? entry.changes : [];
        for (const change of changes) {
          if (change?.field !== 'messages') continue;
          const value = change.value;
          if (!value) continue;

          // Inbound Customer Messages
          if (Array.isArray(value.messages)) {
            for (const msg of value.messages) {
              const messageId = msg.id;
              if (!messageId) continue;

              // Deduplication
              if (processedMessageIds.has(messageId)) {
                console.log(`[Meta WhatsApp Webhook] Duplicate message skipped: ${messageId}`);
                continue;
              }

              processedMessageIds.add(messageId);
              if (processedMessageIds.size > MAX_CACHE_SIZE) {
                const oldest = processedMessageIds.values().next().value;
                if (oldest) processedMessageIds.delete(oldest);
              }

              const fromPhone = `+${msg.from}`;
              let messageText = '';
              if (msg.type === 'text' && msg.text?.body) {
                messageText = msg.text.body;
              } else if (msg.type === 'interactive') {
                messageText =
                  msg.interactive?.button_reply?.title ||
                  msg.interactive?.list_reply?.title ||
                  'User interactive selection';
              } else if (msg.type === 'button' && msg.button?.text) {
                messageText = msg.button.text;
              } else {
                messageText = `[Customer sent a ${msg.type || 'media'} message]`;
              }

              console.log(
                `[Meta WhatsApp Webhook] Received message from ${maskPhoneNumber(fromPhone)} (ID: ${messageId})`
              );

              // Auto-reply
              const autoReply = getAutomatedReply(messageText);
              if (autoReply) {
                console.log(
                  `[Meta WhatsApp Webhook] Dispatching auto-reply to ${maskPhoneNumber(fromPhone)}`
                );
                await sendMetaCloudTextMessage(fromPhone, autoReply);
              }
            }
          }

          // Outbound Status Updates (sent, delivered, read)
          if (Array.isArray(value.statuses)) {
            for (const status of value.statuses) {
              console.log(
                `[Meta WhatsApp Webhook] Status update for message ${status.id}: ${status.status}`
              );
            }
          }
        }
      }

      return;
    } catch (err: any) {
      console.error('[Meta WhatsApp Webhook - Vercel] Processing error:', err.message);
      if (!res.writableEnded) {
        res.statusCode = 500;
        return res.end('Internal Server Error');
      }
    }
  }

  // Method not allowed
  res.statusCode = 405;
  return res.end('Method Not Allowed');
}
