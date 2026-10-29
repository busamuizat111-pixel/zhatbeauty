import mongoose, { Schema } from 'mongoose';

/**
 * Tenant Isolation Policy:
 * Every business-owned collection has a mandatory, indexed 'businessId' field.
 * All queries and mutations MUST include { businessId }.
 */

export const BusinessSchema = new Schema(
  {
    name: { type: String, required: true },
    ownerEmail: { type: String, required: true },
    ownerPhone: { type: String, required: true },
    activeProvider: {
      type: String,
      enum: ['whatsapp_web', 'meta_cloud'],
      default: 'whatsapp_web',
    },
    settings: {
      businessName: { type: String, required: true },
      businessAddress: { type: String, default: '' },
      supportPhone: { type: String, default: '' },
      contactEmail: { type: String, default: '' },
      currency: { type: String, default: 'NGN' },
      timezone: { type: String, default: 'Africa/Lagos' },
      bankDetails: {
        bankName: { type: String, default: 'Access Bank' },
        accountNumber: { type: String, default: '0123456789' },
        accountName: { type: String, default: 'Zikora Wears Enterprises' },
      },
      deliveryRates: {
        lagosMainland: { type: Number, default: 2500 },
        lagosIsland: { type: Number, default: 3500 },
        abujaFct: { type: Number, default: 4500 },
        interstate: { type: Number, default: 5500 },
      },
      automationSettings: {
        isEnabled: { type: Boolean, default: false },
        autoReplyGreeting: { type: Boolean, default: true },
        sendBankDetailsOnDemand: { type: Boolean, default: true },
        handoffKeywords: { type: [String], default: ['human', 'agent', 'speak to staff', 'complain'] },
        rules: [
          {
            id: String,
            triggerKeywords: [String],
            responseTemplate: String,
            category: String,
            isActive: Boolean,
          },
        ],
      },
    },
  },
  { timestamps: true }
);

export const ProductSchema = new Schema(
  {
    businessId: { type: String, required: true, index: true },
    name: { type: String, required: true, index: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, index: true },
    sku: { type: String, required: true },
    stockQuantity: { type: Number, required: true, min: 0, default: 0 },
    variants: [
      {
        name: String,
        options: [String],
      },
    ],
    images: { type: [String], default: [] },
    status: { type: String, enum: ['active', 'archived'], default: 'active', index: true },
  },
  { timestamps: true }
);

export const CustomerSchema = new Schema(
  {
    businessId: { type: String, required: true, index: true },
    name: { type: String, required: true, index: true },
    phone: { type: String, required: true, index: true },
    preferredChannel: {
      type: String,
      enum: ['whatsapp', 'phone_call', 'sms'],
      default: 'whatsapp',
    },
    productsOfInterest: { type: [String], default: [] },
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['lead', 'active', 'vip', 'at_risk', 'inactive'],
      default: 'lead',
      index: true,
    },
    consentGiven: { type: Boolean, default: true },
    lastInteraction: { type: Date, default: Date.now },
    lastEnquiryDate: { type: Date, default: Date.now },
    totalOrdersCount: { type: Number, default: 0 },
    totalSpend: { type: Number, default: 0 },
    deliveryAddress: { type: String, default: '' },
  },
  { timestamps: true }
);

export const ConversationSchema = new Schema(
  {
    businessId: { type: String, required: true, index: true },
    customerId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true, index: true },
    enquiryStatus: {
      type: String,
      enum: ['new', 'awaiting_response', 'interested', 'awaiting_payment', 'converted', 'lost'],
      default: 'new',
      index: true,
    },
    productIdOfInterest: { type: String },
    productNameOfInterest: { type: String },
    lastMessageText: { type: String, default: '' },
    lastMessageTimestamp: { type: Date, default: Date.now, index: true },
    unreadCount: { type: Number, default: 0 },
    isPausedAutomation: { type: Boolean, default: false },
    assignedStaff: { type: String },
    messages: [
      {
        id: { type: String, required: true },
        sender: { type: String, enum: ['customer', 'business', 'system'], required: true },
        text: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        status: { type: String, enum: ['pending', 'sent', 'delivered', 'read', 'failed'], default: 'sent' },
        externalId: String,
        isAutomated: Boolean,
      },
    ],
  },
  { timestamps: true }
);

export const EnquirySchema = new Schema(
  {
    businessId: { type: String, required: true, index: true },
    customerId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    productId: String,
    productName: String,
    status: {
      type: String,
      enum: ['new', 'awaiting_response', 'interested', 'awaiting_payment', 'converted', 'lost'],
      default: 'new',
      index: true,
    },
    initialMessage: { type: String, required: true },
    notes: String,
    assignedStaff: String,
  },
  { timestamps: true }
);

export const OrderSchema = new Schema(
  {
    reference: { type: String, required: true, unique: true, index: true },
    businessId: { type: String, required: true, index: true },
    customerId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    items: [
      {
        productId: { type: String, required: true },
        productName: { type: String, required: true },
        sku: { type: String, required: true },
        unitPrice: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        subtotal: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    deliveryFee: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partially_paid', 'paid', 'refunded'],
      default: 'unpaid',
      index: true,
    },
    fulfillmentStatus: {
      type: String,
      enum: ['pending', 'processing', 'ready_for_pickup', 'dispatched', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
    deliveryAddress: { type: String, required: true },
    deliveryCity: { type: String, default: 'Lagos' },
    notes: String,
  },
  { timestamps: true }
);

export const FollowUpSchema = new Schema(
  {
    businessId: { type: String, required: true, index: true },
    customerId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    dueDate: { type: String, required: true, index: true }, // YYYY-MM-DD
    dueTime: { type: String, required: true }, // HH:MM
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    outcome: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
  },
  { timestamps: true }
);

export const MessagingConnectionSchema = new Schema(
  {
    businessId: { type: String, required: true, unique: true, index: true },
    provider: { type: String, enum: ['whatsapp_web', 'meta_cloud'], required: true },
    status: {
      type: String,
      enum: ['disconnected', 'connecting', 'connected', 'error'],
      default: 'disconnected',
    },
    qrCode: String,
    phoneNumber: String,
    businessAccountId: String,
    lastConnectedAt: Date,
    lastMessageReceivedAt: Date,
    lastMessageSentAt: Date,
    errorDetails: String,
  },
  { timestamps: true }
);
