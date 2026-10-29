/**
 * Standalone Persistent WhatsApp Web Service (Node.js daemon)
 * Uses whatsapp-web.js with Puppeteer and LocalAuth session storage.
 *
 * Designed to run as an independent background service on a persistent VPS/container.
 * Communicates with the main KasuwaDesk web application via authenticated REST calls and Webhooks.
 */

const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const SERVICE_API_KEY = process.env.WA_WEB_SERVICE_KEY || 'demo-service-key';
const MAIN_APP_WEBHOOK_URL = process.env.MAIN_APP_WEBHOOK_URL || 'http://localhost:3000/api/whatsapp/webhook';

// Security middleware: Require Bearer API token
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${SERVICE_API_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized: Invalid service API key' });
  }
  next();
}

let clientState = {
  status: 'disconnected', // 'disconnected' | 'connecting' | 'connected' | 'error'
  qrCodeDataUrl: null,
  phoneNumber: null,
  error: null,
};

let client = null;

function initializeWhatsAppClient() {
  if (client) {
    try {
      client.destroy();
    } catch (e) {}
  }

  clientState.status = 'connecting';
  clientState.error = null;

  client = new Client({
    authStrategy: new LocalAuth({
      dataPath: './.wwebjs_auth',
    }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
      ],
    },
  });

  client.on('qr', async (qr) => {
    try {
      clientState.qrCodeDataUrl = await qrcode.toDataURL(qr);
      clientState.status = 'connecting';
      console.log('📌 WhatsApp Web QR code generated. Scan via KasuwaDesk admin.');
    } catch (err) {
      console.error('Failed to generate QR data URL', err);
    }
  });

  client.on('ready', () => {
    clientState.status = 'connected';
    clientState.qrCodeDataUrl = null;
    clientState.phoneNumber = client.info?.wid?.user ? `+${client.info.wid.user}` : null;
    console.log(`✅ WhatsApp Web client connected as ${clientState.phoneNumber}`);
  });

  client.on('authenticated', () => {
    console.log('🔐 Session authenticated successfully.');
  });

  client.on('auth_failure', (msg) => {
    clientState.status = 'error';
    clientState.error = `Authentication failure: ${msg}`;
    console.error('❌ Auth failure', msg);
  });

  client.on('disconnected', (reason) => {
    clientState.status = 'disconnected';
    clientState.qrCodeDataUrl = null;
    clientState.phoneNumber = null;
    console.log(`⚠️ WhatsApp Web client disconnected: ${reason}`);
  });

  // Relay incoming messages to KasuwaDesk backend
  client.on('message', async (msg) => {
    // Ignore status broadcasts and group messages if strictly 1:1 business customer chat
    if (msg.from === 'status@broadcast' || msg.isGroupMsg) return;

    try {
      const payload = {
        id: msg.id,
        from: msg.from,
        senderName: msg._data?.notifyName || 'Customer',
        body: msg.body,
        timestamp: msg.timestamp,
      };

      await fetch(MAIN_APP_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (relayErr) {
      console.error('Error relaying message to main app:', relayErr.message);
    }
  });

  client.initialize().catch((err) => {
    clientState.status = 'error';
    clientState.error = err.message;
    console.error('Error during client initialization:', err);
  });
}

// -------------------------------------------------------------
// ENDPOINTS FOR MAIN KASUWADESK APPLICATION
// -------------------------------------------------------------

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'whatsapp-web-service',
    whatsappStatus: clientState.status,
    timestamp: new Date().toISOString(),
  });
});

// Connect / Start pairing
app.post('/session/connect', authMiddleware, (req, res) => {
  if (clientState.status !== 'connected') {
    initializeWhatsAppClient();
  }
  res.json({
    status: clientState.status,
    qrCode: clientState.qrCodeDataUrl,
    phoneNumber: clientState.phoneNumber,
    message: clientState.status === 'connected' ? 'Already connected' : 'Pairing initialized',
  });
});

// Status
app.get('/session/status', authMiddleware, (req, res) => {
  res.json({
    status: clientState.status,
    qrCode: clientState.qrCodeDataUrl,
    phoneNumber: clientState.phoneNumber,
    error: clientState.error,
  });
});

// Disconnect
app.post('/session/disconnect', authMiddleware, async (req, res) => {
  if (client) {
    try {
      await client.logout();
    } catch (e) {}
    try {
      await client.destroy();
    } catch (e) {}
  }
  clientState = {
    status: 'disconnected',
    qrCodeDataUrl: null,
    phoneNumber: null,
    error: null,
  };
  res.json({ success: true, message: 'WhatsApp session terminated' });
});

// Send outgoing message
app.post('/messages/send', authMiddleware, async (req, res) => {
  const { to, message } = req.body;
  if (!to || !message) {
    return res.status(400).json({ error: 'Missing required parameters: to, message' });
  }

  if (clientState.status !== 'connected' || !client) {
    return res.status(503).json({ error: 'WhatsApp Web is not connected' });
  }

  try {
    // Format to WhatsApp chat ID (e.g. 2348031234567@c.us)
    const cleanNumber = to.replace(/\D/g, '');
    const chatId = `${cleanNumber}@c.us`;

    const sent = await client.sendMessage(chatId, message);
    res.json({
      success: true,
      messageId: sent.id._serialized,
      timestamp: sent.timestamp,
    });
  } catch (sendErr) {
    res.status(500).json({ error: sendErr.message });
  }
});

app.listen(PORT, () => {
  console.log(`📡 WhatsApp Web microservice listening on port ${PORT}`);
});
