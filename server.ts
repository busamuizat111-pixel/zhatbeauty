import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  CustomerSchema,
  FollowUpSchema,
  normalizeNigerianPhoneNumber,
  OrderSchema,
  ProductSchema,
} from './src/lib/validations';
import { evaluateAutomatedResponse } from './src/server/automatedResponses';
import { MetaCloudAdapter } from './src/server/messaging/MetaCloudAdapter';
import { DEFAULT_BUSINESS_ID, storage } from './src/server/storage';
import {
  handleWebhookVerification,
  processWebhookPayload,
  verifyHubSignature,
} from './src/server/whatsappWebhookService';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Parse JSON body while capturing raw buffer for HMAC X-Hub-Signature-256 verification
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

// Official Meta WhatsApp Cloud API Adapter (Exclusive messaging provider)
const metaCloudAdapter = new MetaCloudAdapter();

function getActiveAdapter() {
  return metaCloudAdapter;
}

// -------------------------------------------------------------
// REST API ROUTES
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'KasuwaDesk',
    timestamp: new Date().toISOString(),
    demoMode: !process.env.MONGODB_URI,
    database: process.env.MONGODB_URI ? 'MongoDB (Connected)' : 'In-Memory (Demo Mode)',
  });
});

// Settings
app.get('/api/settings', (req, res) => {
  const settings = storage.getSettings(DEFAULT_BUSINESS_ID);
  res.json(settings);
});

app.put('/api/settings', (req, res) => {
  try {
    const updated = storage.updateSettings(DEFAULT_BUSINESS_ID, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Dashboard metrics
app.get('/api/dashboard/metrics', (req, res) => {
  const metrics = storage.getDashboardMetrics(DEFAULT_BUSINESS_ID);
  res.json(metrics);
});

// Products
app.get('/api/products', (req, res) => {
  const products = storage.getProducts(DEFAULT_BUSINESS_ID);
  res.json(products);
});

app.post('/api/products', (req, res) => {
  const parseResult = ProductSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const newProduct = storage.createProduct({
    ...parseResult.data,
    businessId: DEFAULT_BUSINESS_ID,
  });
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const parseResult = ProductSchema.partial().safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const updated = storage.updateProduct(req.params.id, DEFAULT_BUSINESS_ID, parseResult.data);
  if (!updated) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(updated);
});

app.delete('/api/products/:id', (req, res) => {
  const success = storage.deleteProduct(req.params.id, DEFAULT_BUSINESS_ID);
  if (!success) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ success: true, message: 'Product deleted' });
});

// Customers
app.get('/api/customers', (req, res) => {
  const customers = storage.getCustomers(DEFAULT_BUSINESS_ID);
  res.json(customers);
});

app.post('/api/customers', (req, res) => {
  const parseResult = CustomerSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  // Prevent duplicates by checking normalized phone
  const existing = storage.getCustomerByPhone(parseResult.data.phone, DEFAULT_BUSINESS_ID);
  if (existing) {
    return res.status(409).json({
      error: `Customer with phone number ${parseResult.data.phone} already exists (${existing.name}).`,
      existingCustomer: existing,
    });
  }

  const newCustomer = storage.createCustomer({
    ...parseResult.data,
    businessId: DEFAULT_BUSINESS_ID,
    lastInteraction: new Date().toISOString(),
    lastEnquiryDate: new Date().toISOString(),
  });
  res.status(201).json(newCustomer);
});

app.put('/api/customers/:id', (req, res) => {
  const parseResult = CustomerSchema.partial().safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const updated = storage.updateCustomer(req.params.id, DEFAULT_BUSINESS_ID, parseResult.data);
  if (!updated) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  res.json(updated);
});

// Inbox & Conversations
app.get('/api/inbox/conversations', (req, res) => {
  const convs = storage.getConversations(DEFAULT_BUSINESS_ID);
  res.json(convs);
});

app.post('/api/inbox/conversations/:id/messages', async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Message text is required' });
  }

  const conversation = storage.getConversationById(req.params.id, DEFAULT_BUSINESS_ID);
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  // 1. Send via active messaging adapter
  const adapter = getActiveAdapter();
  const sendResult = await adapter.sendTextMessage(conversation.customerPhone, text);

  // 2. Record business message in conversation log
  const chatMsg = storage.addMessageToConversation(conversation.id, DEFAULT_BUSINESS_ID, {
    sender: 'business',
    text,
    status: sendResult.success ? 'sent' : 'failed',
    externalId: sendResult.messageId,
  });

  res.status(201).json({
    message: chatMsg,
    sendResult,
  });
});

app.post('/api/inbox/conversations/:id/toggle-automation', (req, res) => {
  const conversation = storage.getConversationById(req.params.id, DEFAULT_BUSINESS_ID);
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  const updated = storage.updateConversation(conversation.id, DEFAULT_BUSINESS_ID, {
    isPausedAutomation: !conversation.isPausedAutomation,
  });
  res.json(updated);
});

// Update conversation enquiry status
app.put('/api/inbox/conversations/:id/status', (req, res) => {
  const { enquiryStatus } = req.body;
  const conversation = storage.getConversationById(req.params.id, DEFAULT_BUSINESS_ID);
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  const updated = storage.updateConversation(conversation.id, DEFAULT_BUSINESS_ID, {
    enquiryStatus,
  });
  res.json(updated);
});

// Manual Customer Message Simulator (Useful for demo & testing customer messages)
app.post('/api/inbox/simulate-customer-message', async (req, res) => {
  const { conversationId, text } = req.body;
  if (!conversationId || !text) {
    return res.status(400).json({ error: 'conversationId and text are required' });
  }

  const conversation = storage.getConversationById(conversationId, DEFAULT_BUSINESS_ID);
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  // Record incoming customer message
  const customerMsg = storage.addMessageToConversation(conversation.id, DEFAULT_BUSINESS_ID, {
    sender: 'customer',
    text,
    status: 'delivered',
  });

  // Evaluate automated assistant
  const settings = storage.getSettings(DEFAULT_BUSINESS_ID);
  const products = storage.getProducts(DEFAULT_BUSINESS_ID);
  const autoEval = evaluateAutomatedResponse(
    text,
    settings,
    products,
    conversation.isPausedAutomation
  );

  let autoReplyMsg = null;
  if (autoEval.shouldReply && autoEval.replyText) {
    // Record and send automated reply
    autoReplyMsg = storage.addMessageToConversation(conversation.id, DEFAULT_BUSINESS_ID, {
      sender: 'business',
      text: autoEval.replyText,
      status: 'sent',
      isAutomated: true,
    });
  }

  // Update conversation status if flagged
  if (autoEval.flagForHumanAttention) {
    storage.updateConversation(conversation.id, DEFAULT_BUSINESS_ID, {
      enquiryStatus: 'awaiting_response',
    });
  }

  res.json({
    customerMessage: customerMsg,
    automatedReply: autoReplyMsg,
    evaluation: autoEval,
  });
});

// Enquiries
app.get('/api/enquiries', (req, res) => {
  const enquiries = storage.getEnquiries(DEFAULT_BUSINESS_ID);
  res.json(enquiries);
});

app.post('/api/enquiries', (req, res) => {
  const { customerId, productId, initialMessage, notes } = req.body;
  const customer = storage.getCustomerById(customerId, DEFAULT_BUSINESS_ID);
  if (!customer) {
    return res.status(400).json({ error: 'Invalid customer' });
  }

  const product = productId ? storage.getProductById(productId, DEFAULT_BUSINESS_ID) : undefined;

  const enquiry = storage.createEnquiry({
    businessId: DEFAULT_BUSINESS_ID,
    customerId,
    customerName: customer.name,
    customerPhone: customer.phone,
    productId,
    productName: product?.name,
    status: 'new',
    initialMessage: initialMessage || 'Customer initiated a new enquiry.',
    notes,
  });

  res.status(201).json(enquiry);
});

app.put('/api/enquiries/:id', (req, res) => {
  const updated = storage.updateEnquiry(req.params.id, DEFAULT_BUSINESS_ID, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Enquiry not found' });
  }
  res.json(updated);
});

// Orders
app.get('/api/orders', (req, res) => {
  const orders = storage.getOrders(DEFAULT_BUSINESS_ID);
  res.json(orders);
});

app.post('/api/orders', (req, res) => {
  const parseResult = OrderSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const customer = storage.getCustomerById(parseResult.data.customerId, DEFAULT_BUSINESS_ID);
  if (!customer) {
    return res.status(400).json({ error: 'Invalid customer ID' });
  }

  // Verify stock availability
  for (const item of parseResult.data.items) {
    const prod = storage.getProductById(item.productId, DEFAULT_BUSINESS_ID);
    if (!prod) {
      return res.status(400).json({ error: `Product ID ${item.productId} not found` });
    }
    if (prod.stockQuantity < item.quantity) {
      return res.status(400).json({
        error: `Insufficient stock for ${prod.name}. Available: ${prod.stockQuantity}, Requested: ${item.quantity}`,
      });
    }
  }

  // Server-authoritative total calculation & inventory deduction
  const order = storage.createOrder({
    ...parseResult.data,
    businessId: DEFAULT_BUSINESS_ID,
    customerName: customer.name,
    customerPhone: customer.phone,
    items: parseResult.data.items.map((i) => {
      const p = storage.getProductById(i.productId, DEFAULT_BUSINESS_ID)!;
      return {
        productId: i.productId,
        productName: p.name,
        sku: p.sku,
        unitPrice: p.price,
        quantity: i.quantity,
        subtotal: p.price * i.quantity,
      };
    }),
  });

  res.status(201).json(order);
});

app.put('/api/orders/:id', (req, res) => {
  const updated = storage.updateOrder(req.params.id, DEFAULT_BUSINESS_ID, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(updated);
});

// Follow-ups
app.get('/api/followups', (req, res) => {
  const followUps = storage.getFollowUps(DEFAULT_BUSINESS_ID);
  res.json(followUps);
});

app.post('/api/followups', (req, res) => {
  const parseResult = FollowUpSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const customer = storage.getCustomerById(parseResult.data.customerId, DEFAULT_BUSINESS_ID);
  if (!customer) {
    return res.status(400).json({ error: 'Invalid customer ID' });
  }

  const newFollowUp = storage.createFollowUp({
    ...parseResult.data,
    businessId: DEFAULT_BUSINESS_ID,
    customerName: customer.name,
    customerPhone: customer.phone,
  });
  res.status(201).json(newFollowUp);
});

app.put('/api/followups/:id', (req, res) => {
  const updated = storage.updateFollowUp(req.params.id, DEFAULT_BUSINESS_ID, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Follow-up not found' });
  }
  res.json(updated);
});

app.delete('/api/followups/:id', (req, res) => {
  const success = storage.deleteFollowUp(req.params.id, DEFAULT_BUSINESS_ID);
  if (!success) {
    return res.status(404).json({ error: 'Follow-up not found' });
  }
  res.json({ success: true });
});

// WhatsApp Connections & Telemetry
app.get('/api/whatsapp/status', async (req, res) => {
  const info = storage.getConnectionInfo();
  res.json(info);
});

app.post('/api/whatsapp/connect', async (req, res) => {
  storage.updateConnectionInfo({ provider: 'meta_cloud' });
  const result = await metaCloudAdapter.connect();
  storage.updateConnectionInfo({
    provider: 'meta_cloud',
    status: result.status,
    phoneNumber: result.phoneNumber,
    errorDetails: result.status === 'error' ? result.message : undefined,
  });
  return res.json(result);
});

app.post('/api/whatsapp/disconnect', async (req, res) => {
  const adapter = getActiveAdapter();
  await adapter.disconnect();
  storage.updateConnectionInfo({
    status: 'disconnected',
    qrCode: undefined,
    errorDetails: undefined,
  });
  res.json({ success: true, message: 'Disconnected from WhatsApp' });
});

app.post('/api/whatsapp/test-message', async (req, res) => {
  const { phone, text } = req.body;
  if (!phone || !text) {
    return res.status(400).json({ error: 'Phone number and message text are required' });
  }

  const normalizedPhone = normalizeNigerianPhoneNumber(phone);
  const adapter = getActiveAdapter();
  const result = await adapter.sendTextMessage(normalizedPhone, text);

  res.json(result);
});

// Meta WhatsApp Cloud API Webhook endpoints (GET for challenge verification, POST for messages & status updates)
const webhookPaths = ['/api/webhooks/whatsapp', '/api/whatsapp/webhook'];

app.get(webhookPaths, (req, res) => {
  const mode = req.query['hub.mode'] as string | undefined;
  const token = req.query['hub.verify_token'] as string | undefined;
  const challenge = req.query['hub.challenge'] as string | undefined;

  const result = handleWebhookVerification(mode, token, challenge);
  return res.status(result.status).send(result.body);
});

app.post(webhookPaths, async (req: any, res) => {
  // 1. Validate X-Hub-Signature-256 using META_WA_APP_SECRET and raw request body
  const signatureHeader = req.headers['x-hub-signature-256'] as string | undefined;
  const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body || {}), 'utf8');

  const verification = verifyHubSignature(rawBody, signatureHeader);
  if (!verification.valid) {
    console.warn(`[Meta WhatsApp Webhook] Rejected unauthorized request: ${verification.reason}`);
    return res.status(403).json({ error: 'Invalid signature', reason: verification.reason });
  }

  // 2. Acknowledge receipt to Meta immediately (Meta requires fast HTTP 200 to prevent retries)
  res.status(200).send('EVENT_RECEIVED');

  // 3. Process inbound messages and delivery statuses
  try {
    await processWebhookPayload(req.body, metaCloudAdapter);
  } catch (err: any) {
    console.error('[Meta WhatsApp Webhook] Background processing error:', err.message);
  }
});

// Demo Data Reset
app.post('/api/demo/reset', (req, res) => {
  storage.resetDemoData();
  res.json({ success: true, message: 'Demo records successfully reset to initial state.' });
});

// -------------------------------------------------------------
// VITE DEV SERVER / STATIC FILE SERVING
// -------------------------------------------------------------
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 KasuwaDesk server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
