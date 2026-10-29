import type { IncomingMessage, ServerResponse } from 'http';
import { parse as parseUrl } from 'url';
import { MetaCloudAdapter } from '../../src/server/messaging/MetaCloudAdapter';
import {
  handleWebhookVerification,
  processWebhookPayload,
  verifyHubSignature,
} from '../../src/server/whatsappWebhookService';

// Vercel Serverless Function Configuration
export const config = {
  api: {
    bodyParser: false, // We read raw stream to compute crypto HMAC X-Hub-Signature-256
  },
};

const metaCloudAdapter = new MetaCloudAdapter();

async function readRawStream(req: IncomingMessage): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', (err) => reject(err));
  });
}

/**
 * Vercel Serverless Function entry point for /api/webhooks/whatsapp
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
      // 1. Read raw buffer for HMAC verification
      let rawBuffer: Buffer;
      if (req.rawBody) {
        rawBuffer = Buffer.isBuffer(req.rawBody) ? req.rawBody : Buffer.from(req.rawBody);
      } else if (req.body && Buffer.isBuffer(req.body)) {
        rawBuffer = req.body;
      } else {
        rawBuffer = await readRawStream(req);
      }

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
      if (rawText.trim()) {
        const payload = JSON.parse(rawText);
        await processWebhookPayload(payload, metaCloudAdapter);
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
