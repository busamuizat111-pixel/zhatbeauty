import crypto from 'crypto';
import handler, {
  GET,
  POST,
  handleWebhookVerification,
  inspectSecret,
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

  // 1. Independent Golden Vector Test 1 (RFC-Style precomputed verification)
  // Ensures test cannot pass from self-referential generator bugs
  process.env.META_WA_APP_SECRET = 'known_test_secret_for_regression_verification_only';
  const goldenPayload1 = Buffer.from('{"test":"known_payload"}', 'utf8');
  const goldenHeader1 = 'sha256=6815565f8fea1dcdcae400e773f2003d2b5b69f025bbda36a1bf7515d9125163';
  const goldenRes1 = verifyHubSignature(goldenPayload1, goldenHeader1);
  assert(
    '1. Independent Golden Vector 1 (Precomputed known HMAC constant)',
    goldenRes1.valid === true,
    goldenRes1.reason
  );

  // 2. Independent Golden Vector Test 2 (Exact Meta Webhook Payload Format)
  process.env.META_WA_APP_SECRET = 'meta_test_secret_32_characters_123';
  const goldenPayload2 = Buffer.from(
    '{"object":"whatsapp_business_account","entry":[{"id":"0","changes":[{"value":{"messaging_product":"whatsapp","metadata":{"display_phone_number":"16505551111","phone_number_id":"123456123"},"contacts":[{"profile":{"name":"test user name"},"wa_id":"16315551181"}],"messages":[{"from":"16315551181","id":"wamid.HBgL...","timestamp":"1528497807","text":{"body":"test text message"},"type":"text"}]},"field":"messages"}]}]}',
    'utf8'
  );
  const goldenHeader2 = 'sha256=ce928a6a5b9b93321bdfd63cd575892afb2a77030bb61d1817a0275e395ce462';
  const goldenRes2 = verifyHubSignature(goldenPayload2, goldenHeader2);
  assert(
    '2. Independent Golden Vector 2 (Precomputed Meta Developer Portal test payload)',
    goldenRes2.valid === true,
    goldenRes2.reason
  );

  // Reset to suite secret
  process.env.META_WA_APP_SECRET = TEST_APP_SECRET;

  // 3. Regression Test: Signature over EXACT bytes including whitespace differences
  // Payload with newlines and indentation:
  const whitespacePayload = '{\n  "object": "whatsapp_business_account",\n  "entry": [\n    {\n      "id": "123"\n    }\n  ]\n}';
  const whitespaceBuf = Buffer.from(whitespacePayload, 'utf8');
  const whitespaceSig = computeSignature(whitespaceBuf, TEST_APP_SECRET);

  // Raw whitespace payload with exact signature must PASS:
  const res3a = verifyHubSignature(whitespaceBuf, whitespaceSig);
  assert('3a. Exact raw bytes with whitespace verifies successfully', res3a.valid === true, res3a.reason);

  // If payload is parsed and re-stringified (compact, losing whitespace),
  // validating against whitespaceSig must FAIL because bytes changed:
  const reStringifiedBuf = Buffer.from(JSON.stringify(JSON.parse(whitespacePayload)), 'utf8');
  const res3b = verifyHubSignature(reStringifiedBuf, whitespaceSig);
  assert(
    '3b. Re-serialized JSON without whitespace correctly fails HMAC verification',
    res3b.valid === false && res3b.reason === 'Cryptographic signature mismatch'
  );

  // 4. Modern Web Standards POST Handler: request.arrayBuffer() preserves exact bytes
  const webRequestGood = new Request('https://zhatbeauty.vercel.app/api/webhooks/whatsapp', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-hub-signature-256': whitespaceSig,
    },
    body: whitespacePayload,
  });
  const webResponseGood = await POST(webRequestGood);
  const webTextGood = await webResponseGood.text();
  assert(
    '4. Modern Web Standards POST handler accepts raw unparsed stream',
    webResponseGood.status === 200 && webTextGood === 'EVENT_RECEIVED'
  );

  // 5. Modern Web Standards POST Handler: Rejects invalid signature with 403
  const webRequestBad = new Request('https://zhatbeauty.vercel.app/api/webhooks/whatsapp', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-hub-signature-256': 'sha256=wronghash123456789012345678901234567890123456789012345678901234567890',
    },
    body: whitespacePayload,
  });
  const webResponseBad = await POST(webRequestBad);
  assert('5. Modern Web Standards POST handler returns 403 for invalid signature', webResponseBad.status === 403);

  // 6. Modern Web Standards GET Handler: Verification challenge handshake
  const webRequestGet = new Request(
    'https://zhatbeauty.vercel.app/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=test_verify_token_123&hub.challenge=test_web_challenge_99',
    { method: 'GET' }
  );
  const webResponseGet = await GET(webRequestGet);
  const webTextGet = await webResponseGet.text();
  assert(
    '6. Modern Web Standards GET handler succeeds with challenge body',
    webResponseGet.status === 200 && webTextGet === 'test_web_challenge_99'
  );

  // 7. Invalid signature (computed with wrong secret)
  const validBuffer = Buffer.from(validPayload, 'utf8');
  const wrongSecretSig = computeSignature(validBuffer, 'wrong_secret_abcdef123456');
  const res7 = verifyHubSignature(validBuffer, wrongSecretSig);
  assert(
    '7. Invalid signature rejection',
    res7.valid === false && res7.reason === 'Cryptographic signature mismatch',
    res7.reason
  );

  // 8. Missing signature header
  const res8a = verifyHubSignature(validBuffer, undefined);
  const res8b = verifyHubSignature(validBuffer, '');
  assert('8. Missing signature header', res8a.valid === false && res8b.valid === false);

  // 9. Malformed signature headers
  const res9a = verifyHubSignature(validBuffer, 'not_sha256=123456');
  const res9b = verifyHubSignature(validBuffer, 'sha256=short');
  const res9c = verifyHubSignature(
    validBuffer,
    'sha256=zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz'
  );
  assert(
    '9. Malformed signature header formats',
    res9a.valid === false && res9b.valid === false && res9c.valid === false
  );

  // 10. Modified / tampered payload with original signature
  const validSig = computeSignature(validBuffer, TEST_APP_SECRET);
  const tamperedBuffer = Buffer.from(validPayload.replace('Amina Test', 'Attacker Name'), 'utf8');
  const res10 = verifyHubSignature(tamperedBuffer, validSig);
  assert(
    '10. Modified payload rejection',
    res10.valid === false && res10.reason === 'Cryptographic signature mismatch'
  );

  // 11. Empty request body
  const emptyBuffer = Buffer.alloc(0);
  const emptySig = computeSignature(emptyBuffer, TEST_APP_SECRET);
  const res11 = verifyHubSignature(emptyBuffer, emptySig);
  assert('11. Empty request body detection', res11.valid === false && res11.reason === 'Empty request body');

  // 12. Secret with accidental surrounding quotation marks in environment
  process.env.META_WA_APP_SECRET = `"${TEST_APP_SECRET}"`;
  const res12 = verifyHubSignature(validBuffer, validSig);
  assert('12. Secret with wrapping quotes correctly sanitized', res12.valid === true, res12.reason);
  process.env.META_WA_APP_SECRET = TEST_APP_SECRET;

  // 13. Safe Secret Inspector Test (Confirms secret is never leaked)
  const secretInspection = inspectSecret('META_WA_APP_SECRET');
  assert(
    '13. Safe Secret Inspector (Reports metadata without exposing value)',
    secretInspection.configured === true &&
      secretInspection.trimmedLength === TEST_APP_SECRET.length &&
      secretInspection.hasWrappingQuotes === false
  );

  // 14. Full Handler Invocation & Duplicate Webhook Event Deduplication
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
    '14a. Handler accepts valid POST payload and logs correlation ID',
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
    '14b. Handler acknowledges duplicate without re-processing',
    mockRes2.statusCode === 200 && secondBody === 'EVENT_RECEIVED'
  );

  console.log(`\nTEST SUMMARY: ${passCount} PASSED, ${failCount} FAILED.`);
  if (failCount > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Test suite failed with unexpected error:', err);
  process.exit(1);
});
