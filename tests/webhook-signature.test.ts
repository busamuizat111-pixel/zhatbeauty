import crypto from 'crypto';
import handler, {
  handleWebhookVerification,
  verifyHubSignature,
} from '../api/webhooks/whatsapp';

// Test-only secret (Never use production secrets in tests)
const TEST_APP_SECRET = 'test_meta_app_secret_998877665544332211aabbcc';
process.env.META_WA_APP_SECRET = TEST_APP_SECRET;
process.env.META_WA_VERIFY_TOKEN = 'test_verify_token_123';

const validPayload = JSON.stringify({
  object: 'whatsapp_business_account',
  entry: [
    {
      id: 'WABA_123456789',
      changes: [
        {
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '2348000000000',
              phone_number_id: 'PHONE_ID_123',
            },
            contacts: [
              {
                profile: { name: 'Amina Test' },
                wa_id: '2348012345678',
              },
            ],
            messages: [
              {
                from: '2348012345678',
                id: `wamid.TEST_DEDUP_${Date.now()}`,
                timestamp: '1730000000',
                text: { body: 'Hello from test suite' },
                type: 'text',
              },
            ],
          },
          field: 'messages',
        },
      ],
    },
  ],
});

function computeSignature(payload: string | Buffer, secret: string): string {
  const buf = Buffer.isBuffer(payload) ? payload : Buffer.from(payload, 'utf8');
  const hash = crypto.createHmac('sha256', secret).update(buf).digest('hex');
  return `sha256=${hash}`;
}

async function runTestSuite() {
  console.log('--- STARTING WEBHOOK SIGNATURE & SECURITY TEST SUITE ---');
  let passCount = 0;
  let failCount = 0;

  function assert(testName: string, condition: boolean, detail?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passCount++;
    } else {
      console.error(`❌ FAIL: ${testName} - ${detail || 'Assertion failed'}`);
      failCount++;
    }
  }

  // 1. Valid signature and valid JSON payload
  const validBuffer = Buffer.from(validPayload, 'utf8');
  const validSig = computeSignature(validBuffer, TEST_APP_SECRET);
  const res1 = verifyHubSignature(validBuffer, validSig);
  assert('1. Valid signature and valid payload', res1.valid === true, res1.reason);

  // 2. Invalid signature (computed with wrong secret or tampered hash)
  const wrongSecretSig = computeSignature(validBuffer, 'wrong_secret_abcdef123456');
  const res2 = verifyHubSignature(validBuffer, wrongSecretSig);
  assert(
    '2. Invalid signature rejection',
    res2.valid === false && res2.reason === 'Cryptographic signature mismatch',
    res2.reason
  );

  // 3. Missing signature header
  const res3a = verifyHubSignature(validBuffer, undefined);
  const res3b = verifyHubSignature(validBuffer, '');
  assert('3. Missing signature header', res3a.valid === false && res3b.valid === false);

  // 4. Malformed signature headers
  const res4a = verifyHubSignature(validBuffer, 'not_sha256=123456');
  const res4b = verifyHubSignature(validBuffer, 'sha256=short');
  const res4c = verifyHubSignature(
    validBuffer,
    'sha256=zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz'
  );
  assert(
    '4. Malformed signature header formats',
    res4a.valid === false && res4b.valid === false && res4c.valid === false
  );

  // 5. Modified / tampered payload with original signature
  const tamperedBuffer = Buffer.from(validPayload.replace('Amina Test', 'Attacker Name'), 'utf8');
  const res5 = verifyHubSignature(tamperedBuffer, validSig);
  assert(
    '5. Modified payload rejection',
    res5.valid === false && res5.reason === 'Cryptographic signature mismatch'
  );

  // 6. Empty request body
  const emptyBuffer = Buffer.alloc(0);
  const emptySig = computeSignature(emptyBuffer, TEST_APP_SECRET);
  const res6 = verifyHubSignature(emptyBuffer, emptySig);
  assert('6. Empty request body detection', res6.valid === false && res6.reason === 'Empty request body');

  // 7. Full Handler Invocation & Duplicate Webhook Event Deduplication
  const testMessageId = `wamid.DEDUP_TEST_${Date.now()}`;
  const dedupPayload = JSON.stringify({
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'WABA_123',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              messages: [
                {
                  from: '2348011223344',
                  id: testMessageId,
                  text: { body: 'Testing deduplication' },
                  type: 'text',
                },
              ],
            },
            field: 'messages',
          },
        ],
      },
    ],
  });
  const dedupBuffer = Buffer.from(dedupPayload, 'utf8');
  const dedupSig = computeSignature(dedupBuffer, TEST_APP_SECRET);

  let firstStatusCode = 0;
  let firstBody = '';
  const mockRes1 = {
    statusCode: 0,
    setHeader: () => {},
    end: (d: string) => {
      firstBody = d;
    },
    get writableEnded() {
      return true;
    },
  };
  Object.defineProperty(mockRes1, 'statusCode', {
    set: (v) => (firstStatusCode = v),
    get: () => firstStatusCode,
  });

  const mockReq1 = {
    method: 'POST',
    url: '/api/webhooks/whatsapp',
    headers: { 'x-hub-signature-256': dedupSig },
    rawBody: dedupBuffer,
  };

  // First invocation
  await handler(mockReq1, mockRes1);
  assert(
    '7a. Handler accepts valid POST payload',
    mockRes1.statusCode === 200 && firstBody === 'EVENT_RECEIVED'
  );

  // Second invocation (retry of exact same message ID)
  let secondStatusCode = 0;
  let secondBody = '';
  const mockRes2 = {
    statusCode: 0,
    setHeader: () => {},
    end: (d: string) => {
      secondBody = d;
    },
    get writableEnded() {
      return true;
    },
  };
  Object.defineProperty(mockRes2, 'statusCode', {
    set: (v) => (secondStatusCode = v),
    get: () => secondStatusCode,
  });

  const mockReq2 = {
    method: 'POST',
    url: '/api/webhooks/whatsapp',
    headers: { 'x-hub-signature-256': dedupSig },
    rawBody: dedupBuffer,
  };

  await handler(mockReq2, mockRes2);
  assert(
    '7b. Handler acknowledges duplicate without re-processing',
    mockRes2.statusCode === 200 && secondBody === 'EVENT_RECEIVED'
  );

  // 8. GET Verification Check
  const getSuccess = handleWebhookVerification('subscribe', 'test_verify_token_123', 'chal_778899');
  assert(
    '8a. GET verification with valid token',
    getSuccess.status === 200 && getSuccess.body === 'chal_778899'
  );

  const getFailure = handleWebhookVerification('subscribe', 'wrong_token', 'chal_778899');
  assert('8b. GET verification with wrong token rejected', getFailure.status === 403);

  console.log(`\nTEST SUMMARY: ${passCount} PASSED, ${failCount} FAILED.`);
  if (failCount > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Test suite failed with unexpected error:', err);
  process.exit(1);
});
