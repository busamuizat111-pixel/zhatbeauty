/**
 * KasuwaDesk - Core Type Definitions
 * Designed for Nigerian Small Businesses managing WhatsApp Commerce
 */

export type Currency = 'NGN';

export type CustomerStatus = 'lead' | 'active' | 'vip' | 'at_risk' | 'inactive';

export type EnquiryStatus =
  | 'new'
  | 'awaiting_response'
  | 'interested'
  | 'awaiting_payment'
  | 'converted'
  | 'lost';

export type PaymentStatus = 'unpaid' | 'partially_paid' | 'paid' | 'refunded';

export type FulfillmentStatus =
  | 'pending'
  | 'processing'
  | 'ready_for_pickup'
  | 'dispatched'
  | 'delivered'
  | 'cancelled';

export type FollowUpStatus = 'pending' | 'completed' | 'cancelled';
export type FollowUpPriority = 'low' | 'medium' | 'high';

export type MessagingProviderType = 'whatsapp_web' | 'meta_cloud';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface BusinessSettings {
  businessName: string;
  businessAddress: string;
  supportPhone: string;
  contactEmail: string;
  currency: Currency;
  timezone: string; // 'Africa/Lagos'
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  deliveryRates: {
    lagosMainland: number;
    lagosIsland: number;
    abujaFct: number;
    interstate: number;
  };
  automationSettings: {
    isEnabled: boolean;
    autoReplyGreeting: boolean;
    sendBankDetailsOnDemand: boolean;
    handoffKeywords: string[];
    rules: AutomatedRule[];
  };
}

export interface AutomatedRule {
  id: string;
  triggerKeywords: string[];
  responseTemplate: string;
  category: 'price' | 'delivery' | 'location' | 'bank_details' | 'hours' | 'custom';
  isActive: boolean;
}

export interface Business {
  id: string;
  name: string;
  ownerEmail: string;
  ownerPhone: string;
  activeProvider: MessagingProviderType;
  settings: BusinessSettings;
  createdAt: string;
}

export interface ProductVariant {
  name: string; // e.g. "Size", "Color"
  options: string[]; // e.g. ["M", "L", "XL"]
}

export interface Product {
  id: string;
  businessId: string;
  name: string;
  description: string;
  price: number; // in NGN
  category: string;
  sku: string;
  stockQuantity: number;
  variants: ProductVariant[];
  images: string[];
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  businessId: string;
  name: string;
  phone: string; // E.164 normalized e.g. +2348012345678
  preferredChannel: 'whatsapp' | 'phone_call' | 'sms';
  productsOfInterest: string[]; // product IDs or names
  notes: string;
  status: CustomerStatus;
  consentGiven: boolean;
  lastInteraction: string;
  lastEnquiryDate: string;
  totalOrdersCount: number;
  totalSpend: number; // in NGN
  deliveryAddress?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'business' | 'system';
  text: string;
  timestamp: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  externalId?: string;
  isAutomated?: boolean;
}

export interface Conversation {
  id: string;
  businessId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  enquiryStatus: EnquiryStatus;
  productIdOfInterest?: string;
  productNameOfInterest?: string;
  lastMessageText: string;
  lastMessageTimestamp: string;
  unreadCount: number;
  isPausedAutomation: boolean; // human handoff flag
  assignedStaff?: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface Enquiry {
  id: string;
  businessId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  productId?: string;
  productName?: string;
  status: EnquiryStatus;
  initialMessage: string;
  notes?: string;
  assignedStaff?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number; // snapshot at purchase time
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  reference: string; // e.g. KD-2026-1042
  businessId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  totalAmount: number; // server-calculated
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  deliveryAddress: string;
  deliveryCity: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FollowUp {
  id: string;
  businessId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:MM
  reason: string;
  status: FollowUpStatus;
  outcome?: string;
  priority: FollowUpPriority;
  createdAt: string;
}

export interface WhatsAppConnectionInfo {
  provider: MessagingProviderType;
  status: ConnectionState;
  qrCode?: string; // Data URL for WhatsApp Web QR
  phoneNumber?: string;
  businessAccountId?: string;
  lastConnectedAt?: string;
  lastMessageReceivedAt?: string;
  lastMessageSentAt?: string;
  errorDetails?: string;
}

export interface DashboardMetrics {
  enquiriesToday: number;
  unansweredEnquiries: number;
  followUpsDueToday: number;
  ordersAwaitingPayment: number;
  ordersProcessing: number;
  ordersDelivered: number;
  totalRevenue: number;
  revenueThisMonth: number;
}

export interface ActivityFeedItem {
  id: string;
  type: 'enquiry' | 'message' | 'order' | 'followup' | 'connection';
  title: string;
  description: string;
  timestamp: string;
  badge?: string;
  linkTab?: string;
}
