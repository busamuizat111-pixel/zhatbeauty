import { z } from 'zod';

/**
 * Normalizes phone numbers to standard E.164 format.
 * Particularly handles Nigerian phone variations:
 * 08031234567 -> +2348031234567
 * 2348031234567 -> +2348031234567
 * +2348031234567 -> +2348031234567
 */
export function normalizeNigerianPhoneNumber(raw: string): string {
  const clean = raw.trim().replace(/[\s\-\(\)]/g, '');
  if (clean.startsWith('+')) {
    return clean;
  }
  if (clean.startsWith('234')) {
    return `+${clean}`;
  }
  if (clean.startsWith('0') && clean.length === 11) {
    return `+234${clean.slice(1)}`;
  }
  return clean.startsWith('+') ? clean : `+${clean}`;
}

export const ProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  description: z.string().default(''),
  price: z.number().min(0, 'Price cannot be negative'),
  category: z.string().min(1, 'Category is required'),
  sku: z.string().min(1, 'SKU is required'),
  stockQuantity: z.number().int().min(0, 'Stock quantity cannot be negative'),
  variants: z
    .array(
      z.object({
        name: z.string(),
        options: z.array(z.string()),
      })
    )
    .default([]),
  images: z.array(z.string()).default([]),
  status: z.enum(['active', 'archived']).default('active'),
});

export const CustomerSchema = z.object({
  name: z.string().min(2, 'Customer name is required'),
  phone: z
    .string()
    .min(10, 'Valid phone number is required')
    .transform(normalizeNigerianPhoneNumber),
  preferredChannel: z.enum(['whatsapp', 'phone_call', 'sms']).default('whatsapp'),
  productsOfInterest: z.array(z.string()).default([]),
  notes: z.string().default(''),
  status: z.enum(['lead', 'active', 'vip', 'at_risk', 'inactive']).default('lead'),
  consentGiven: z.boolean().default(true),
  deliveryAddress: z.string().optional(),
});

export const OrderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be greater than 0'),
  // unitPrice is validated or looked up from actual product on server
});

export const OrderSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  items: z.array(OrderItemSchema).min(1, 'Order must contain at least 1 item'),
  discount: z.number().min(0, 'Discount cannot be negative').default(0),
  deliveryFee: z.number().min(0, 'Delivery fee cannot be negative').default(0),
  deliveryAddress: z.string().min(3, 'Delivery address is required'),
  deliveryCity: z.string().default('Lagos'),
  notes: z.string().optional(),
  paymentStatus: z.enum(['unpaid', 'partially_paid', 'paid', 'refunded']).default('unpaid'),
  fulfillmentStatus: z
    .enum(['pending', 'processing', 'ready_for_pickup', 'dispatched', 'delivered', 'cancelled'])
    .default('pending'),
});

export const FollowUpSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be YYYY-MM-DD'),
  dueTime: z.string().regex(/^\d{2}:\d{2}$/, 'Due time must be HH:MM'),
  reason: z.string().min(3, 'Follow-up reason is required'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

export const SendMessageSchema = z.object({
  conversationId: z.string().min(1, 'Conversation ID is required'),
  text: z.string().min(1, 'Message text cannot be empty'),
});

export const AutomatedRuleSchema = z.object({
  triggerKeywords: z.array(z.string()).min(1, 'At least 1 trigger keyword is required'),
  responseTemplate: z.string().min(5, 'Response template is required'),
  category: z.enum(['price', 'delivery', 'location', 'bank_details', 'hours', 'custom']),
  isActive: z.boolean().default(true),
});
