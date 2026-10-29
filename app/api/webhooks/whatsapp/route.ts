import { MetaCloudAdapter } from '../../../../src/server/messaging/MetaCloudAdapter';
import {
  handleWebhookVerification,
  processWebhookPayload,
  verifyHubSignature,
} from '../../../../src/server/whatsappWebhookService';

const metaCloudAdapter = new MetaCloudAdapter();

/**
 * Next.js App Router Webhook Handler
 * Route: app/api/webhooks/whatsapp/route.ts
 */

// GET: Meta Webhook Challenge Verification
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode') || undefined;
  const token = searchParams.get('hub.verify_token') || undefined;
  const challenge = searchParams.get('hub.challenge') || undefined;

  const result = handleWebhookVerification(mode, token, challenge);
  return new Response(result.body, {
    status: result.status,
    headers: { 'Content-Type': 'text/plain' },
  });
}

// POST: Meta WhatsApp Cloud API Inbound Events & Status Updates
export async function POST(request: Request) {
  try {
    const rawBodyText = await request.text();
    const rawBuffer = Buffer.from(rawBodyText, 'utf8');
    const signatureHeader = request.headers.get('x-hub-signature-256') || undefined;

    // 1. Verify X-Hub-Signature-256 using META_WA_APP_SECRET
    const check = verifyHubSignature(rawBuffer, signatureHeader);
    if (!check.valid) {
      console.warn(`[Meta WhatsApp Webhook - Next.js] Rejected request: ${check.reason}`);
      return new Response(JSON.stringify({ error: 'Invalid signature', reason: check.reason }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Parse payload
    const payload = JSON.parse(rawBodyText);

    // 3. Process payload (asynchronously or before returning 200)
    await processWebhookPayload(payload, metaCloudAdapter);

    return new Response('EVENT_RECEIVED', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (err: any) {
    console.error('[Meta WhatsApp Webhook - Next.js] Error:', err.message);
    return new Response('Internal Server Error', { status: 500 });
  }
}
