import crypto from 'crypto';

/**
 * Deduplication cache with bounded memory eviction (5,000 entries)
 */
const processedMessageIds = new Set<string>();
const MAX_CACHE_SIZE = 5000;

export interface SecretDiagnostics {
  configured: boolean;
  rawLength: number;
  trimmedLength: number;
  hasWrappingQuotes: boolean;
  hasWhitespace: boolean;
}

/**
 * Safely inspects secret metadata without ever logging or exposing the secret value.
 */
export function inspectSecret(envVarName: string): SecretDiagnostics {
  const raw = process.env[envVarName];
  if (!raw) {
    return {
      configured: false,
      rawLength: 0,
      trimmedLength: 0,
      hasWrappingQuotes: false,
      hasWhitespace: false,
    };
  }
  const hasWhitespace = /^\s|\s$/.test(raw);
  const trimmed = raw.trim();
  const hasWrappingQuotes = /^["'].*["']$/.test(trimmed);
  const unquoted = trimmed.replace(/^["']|["']$/g, '').trim();

  return {
    configured: true,
    rawLength: raw.length,
    trimmedLength: unquoted.length,
    hasWrappingQuotes,
    hasWhitespace,
  };
}

function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 6) return '***';
  return phone.slice(0, 4) + '***' + phone.slice(-4);
}

/**
 * Validates Meta's X-Hub-Signature-256 header against the raw request body using META_WA_APP_SECRET
 */
export function verifyHubSignature(
  rawBuffer: Buffer,
  signatureHeader: string | null | undefined
): { valid: boolean; reason?: string; computedDigestLength?: number; expectedPrefixMatch?: boolean } {
  // Strip optional wrapping quotes (e.g. if set in Vercel as "secret" or 'secret') and whitespace
  const appSecret = process.env.META_WA_APP_SECRET?.replace(/^["']|["']$/g, '').trim();

  // If META_WA_APP_SECRET is not yet configured, log notice and permit in development
  if (!appSecret) {
    console.warn(
      '[Meta WhatsApp Webhook] Notice: META_WA_APP_SECRET is not configured. Skipping X-Hub-Signature-256 verification.'
    );
    return { valid: true, reason: 'APP_SECRET_NOT_CONFIGURED' };
  }

  // 1. Missing signature header
  if (!signatureHeader || !signatureHeader.trim()) {
    return { valid: false, reason: 'Missing X-Hub-Signature-256 header' };
  }

  // 2. Empty request body
  if (!rawBuffer || rawBuffer.length === 0) {
    return { valid: false, reason: 'Empty request body' };
  }

  // 3. Malformed signature header (must start with sha256=)
  const trimmedHeader = signatureHeader.trim();
  const lowerHeader = trimmedHeader.toLowerCase();
  if (!lowerHeader.startsWith('sha256=')) {
    return { valid: false, reason: 'Malformed signature header (expected sha256=<hash>)', expectedPrefixMatch: false };
  }

  // 4. Validate hex digest length (SHA-256 hex digest is exactly 64 hexadecimal characters)
  const signatureHex = trimmedHeader.slice(7).trim();
  if (!signatureHex || !/^[0-9a-fA-F]{64}$/.test(signatureHex)) {
    return { valid: false, reason: 'Malformed signature header (expected 64-char hex digest)', expectedPrefixMatch: true };
  }

  try {
    // 5. Compute HMAC-SHA256 digest over the raw unparsed bytes
    const hmac = crypto.createHmac('sha256', appSecret);
    hmac.update(rawBuffer);
    const expectedHex = hmac.digest('hex'); // 64 hex characters, lowercase

    // 6. Timing-safe comparison to prevent timing attacks
    const expectedBuffer = Buffer.from(expectedHex, 'utf8');
    const actualBuffer = Buffer.from(signatureHex.toLowerCase(), 'utf8');

    if (expectedBuffer.length !== actualBuffer.length) {
      return {
        valid: false,
        reason: 'Signature length mismatch',
        computedDigestLength: expectedBuffer.length,
        expectedPrefixMatch: true,
      };
    }

    const matches = crypto.timingSafeEqual(expectedBuffer, actualBuffer);
    return {
      valid: matches,
      reason: matches ? undefined : 'Cryptographic signature mismatch',
      computedDigestLength: expectedBuffer.length,
      expectedPrefixMatch: true,
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
  mode: string | null | undefined,
  token: string | null | undefined,
  challenge: string | null | undefined
): { status: number; body: string } {
  const configuredToken = process.env.META_WA_VERIFY_TOKEN?.replace(/^["']|["']$/g, '').trim();
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
  const accessToken = process.env.META_WA_ACCESS_TOKEN?.replace(/^["']|["']$/g, '').trim();
  const phoneNumberId = process.env.META_WA_PHONE_NUMBER_ID?.replace(/^["']|["']$/g, '').trim();

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
 * Process verified Meta payload
 */
async function processVerifiedPayload(rawText: string, correlationId: string) {
  try {
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
              console.log(`[Meta WhatsApp Webhook] [${correlationId}] Duplicate message skipped: ${messageId}`);
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
              `[Meta WhatsApp Webhook] [${correlationId}] Inbound message from ${maskPhoneNumber(fromPhone)} (ID: ${messageId})`
            );

            // Auto-reply
            const autoReply = getAutomatedReply(messageText);
            if (autoReply) {
              console.log(
                `[Meta WhatsApp Webhook] [${correlationId}] Dispatching auto-reply to ${maskPhoneNumber(fromPhone)}`
              );
              await sendMetaCloudTextMessage(fromPhone, autoReply);
            }
          }
        }

        // Outbound Status Updates (sent, delivered, read)
        if (Array.isArray(value.statuses)) {
          for (const status of value.statuses) {
            console.log(
              `[Meta WhatsApp Webhook] [${correlationId}] Status update for message ${status.id}: ${status.status}`
            );
          }
        }
      }
    }
  } catch (err: any) {
    console.error(`[Meta WhatsApp Webhook] [${correlationId}] Async processing error:`, err.message);
  }
}

// =============================================================================
// MODERN VERCEL SERVERLESS FUNCTION: WEB STANDARDS ROUTE HANDLERS
// In modern Vercel Functions, named exports (GET, POST) receive native Web Request
// objects without any pre-parsing middleware, guaranteeing 100% raw byte capture.
// =============================================================================

/**
 * Modern Vercel GET Handler: Meta Webhook Subscription Verification
 */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  const verification = handleWebhookVerification(mode, token, challenge);
  return new Response(verification.body, {
    status: verification.status,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

/**
 * Modern Vercel POST Handler: Inbound Webhook Events
 * Uses request.arrayBuffer() directly to capture the exact, unparsed raw bytes.
 */
export async function POST(request: Request): Promise<Response> {
  const correlationId = `wh_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  try {
    // 1. Read exact raw bytes from native Web Request stream BEFORE any JSON parsing
    const arrayBuffer = await request.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);

    // 2. Validate X-Hub-Signature-256 using META_WA_APP_SECRET
    const signatureHeader = request.headers.get('x-hub-signature-256');
    const signatureCheck = verifyHubSignature(rawBuffer, signatureHeader);
    const secretDiag = inspectSecret('META_WA_APP_SECRET');

    // 3. Safe diagnostic logging (Never logs secrets, access tokens, or customer messages)
    console.log(
      `[Meta WhatsApp Webhook - Vercel WebStandard] [${correlationId}] ` +
      `source=request.arrayBuffer ` +
      `bytes=${rawBuffer.length} ` +
      `sigHeader=${Boolean(signatureHeader)} ` +
      `secretConfigured=${secretDiag.configured} ` +
      `secretLength=${secretDiag.trimmedLength} ` +
      `secretHasQuotes=${secretDiag.hasWrappingQuotes} ` +
      `secretHasWhitespace=${secretDiag.hasWhitespace} ` +
      `valid=${signatureCheck.valid} ` +
      `${signatureCheck.reason ? `reason="${signatureCheck.reason}"` : 'status=OK'}`
    );

    if (!signatureCheck.valid) {
      console.warn(
        `[Meta WhatsApp Webhook - Vercel WebStandard] [${correlationId}] Request rejected: ${signatureCheck.reason}`
      );
      return new Response(
        JSON.stringify({
          error: 'Invalid signature',
          reason: signatureCheck.reason,
          correlationId,
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 4. Immediately return 200 EVENT_RECEIVED to satisfy Meta's 20-second timeout
    const rawText = rawBuffer.toString('utf8');
    if (rawText.trim()) {
      // Process payload asynchronously in background
      processVerifiedPayload(rawText, correlationId).catch((err) =>
        console.error(`[Meta WhatsApp Webhook] [${correlationId}] Background error:`, err.message)
      );
    }

    return new Response('EVENT_RECEIVED', {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (err: any) {
    console.error(`[Meta WhatsApp Webhook - Vercel WebStandard] [${correlationId}] Processing error:`, err.message);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// =============================================================================
// BACKWARDS-COMPATIBLE DEFAULT EXPORT (Node.js (req, res) & Test Runners)
// =============================================================================

export default async function handler(req: any, res?: any): Promise<any> {
  // If invoked with a Web Standard Request (e.g. Edge or modern runtime adapter)
  if (req instanceof Request || (arguments.length === 1 && typeof req?.arrayBuffer === 'function')) {
    const method = req.method?.toUpperCase();
    if (method === 'GET') return GET(req);
    if (method === 'POST') return POST(req);
    return new Response('Method Not Allowed', { status: 405 });
  }

  // Legacy Node.js (req, res) handler
  const method = req.method?.toUpperCase();

  if (method === 'GET') {
    const url = new URL(req.url || '', 'http://localhost');
    const mode = (req.query?.['hub.mode'] || url.searchParams.get('hub.mode')) as string;
    const token = (req.query?.['hub.verify_token'] || url.searchParams.get('hub.verify_token')) as string;
    const challenge = (req.query?.['hub.challenge'] || url.searchParams.get('hub.challenge')) as string;

    const verification = handleWebhookVerification(mode, token, challenge);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.statusCode = verification.status;
    return res.end(verification.body);
  }

  if (method === 'POST') {
    const correlationId = `wh_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    try {
      let rawBuffer: Buffer;
      let bodySource = 'stream';

      if (req.rawBody) {
        rawBuffer = Buffer.isBuffer(req.rawBody) ? req.rawBody : Buffer.from(req.rawBody);
        bodySource = 'req.rawBody';
      } else if (Buffer.isBuffer(req.body)) {
        rawBuffer = req.body;
        bodySource = 'req.body(Buffer)';
      } else if (typeof req.body === 'string') {
        rawBuffer = Buffer.from(req.body, 'utf8');
        bodySource = 'req.body(string)';
      } else if (req.body && typeof req.body === 'object') {
        console.warn(
          '[Meta WhatsApp Webhook - Vercel] Warning: req.body was pre-parsed into an object by runtime middleware. Raw byte stream is required for exact HMAC verification.'
        );
        rawBuffer = Buffer.from(JSON.stringify(req.body), 'utf8');
        bodySource = 'req.body(object-fallback)';
      } else {
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }
        rawBuffer = Buffer.concat(chunks);
        bodySource = 'stream(for-await)';
      }

      const signatureHeader = (req.headers?.['x-hub-signature-256'] || '') as string;
      const signatureCheck = verifyHubSignature(rawBuffer, signatureHeader);
      const secretDiag = inspectSecret('META_WA_APP_SECRET');

      console.log(
        `[Meta WhatsApp Webhook - Vercel Legacy] [${correlationId}] ` +
        `source=${bodySource} ` +
        `bytes=${rawBuffer.length} ` +
        `sigHeader=${Boolean(signatureHeader)} ` +
        `secretConfigured=${secretDiag.configured} ` +
        `secretLength=${secretDiag.trimmedLength} ` +
        `secretHasQuotes=${secretDiag.hasWrappingQuotes} ` +
        `secretHasWhitespace=${secretDiag.hasWhitespace} ` +
        `valid=${signatureCheck.valid} ` +
        `${signatureCheck.reason ? `reason="${signatureCheck.reason}"` : 'status=OK'}`
      );

      if (!signatureCheck.valid) {
        res.statusCode = 403;
        res.setHeader('Content-Type', 'application/json');
        return res.end(
          JSON.stringify({
            error: 'Invalid signature',
            reason: signatureCheck.reason,
            correlationId,
          })
        );
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('EVENT_RECEIVED');

      const rawText = rawBuffer.toString('utf8');
      if (rawText.trim()) {
        processVerifiedPayload(rawText, correlationId).catch((err) =>
          console.error(`[Meta WhatsApp Webhook] [${correlationId}] Error:`, err.message)
        );
      }
      return;
    } catch (err: any) {
      console.error(`[Meta WhatsApp Webhook - Vercel Legacy] [${correlationId}] Error:`, err.message);
      if (!res.writableEnded) {
        res.statusCode = 500;
        return res.end('Internal Server Error');
      }
    }
  }

  res.statusCode = 405;
  return res.end('Method Not Allowed');
}
