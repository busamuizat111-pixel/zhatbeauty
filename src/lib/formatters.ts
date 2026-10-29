/**
 * Nigerian Business Formatting Utilities
 * Standardized for NGN (₦) and Africa/Lagos timezone
 */

export function formatNaira(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₦0';
  }
  return '₦' + Math.round(amount).toLocaleString('en-NG');
}

export function formatLagosDate(isoDateString?: string): string {
  if (!isoDateString) return '';
  try {
    const date = new Date(isoDateString);
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Lagos',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return isoDateString;
  }
}

export function formatLagosDateOnly(isoDateString?: string): string {
  if (!isoDateString) return '';
  try {
    const date = new Date(isoDateString);
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Lagos',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return isoDateString;
  }
}

export function formatLagosTimeOnly(isoDateString?: string): string {
  if (!isoDateString) return '';
  try {
    const date = new Date(isoDateString);
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Lagos',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return isoDateString;
  }
}

/**
 * Clean phone number for WhatsApp URLs (strips +, spaces, dashes)
 */
export function sanitizePhoneForWhatsApp(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

/**
 * Generates direct WhatsApp click-to-chat link
 */
export function getWhatsAppClickToChatUrl(phone: string, defaultMessage?: string): string {
  const cleanPhone = sanitizePhoneForWhatsApp(phone);
  const baseUrl = `https://wa.me/${cleanPhone}`;
  if (defaultMessage) {
    return `${baseUrl}?text=${encodeURIComponent(defaultMessage)}`;
  }
  return baseUrl;
}

/**
 * Generates a clean, professional WhatsApp order receipt text that sellers can send directly to customers
 */
export function generateWhatsAppOrderReceipt(order: {
  reference: string;
  customerName: string;
  items: Array<{ productName: string; quantity: number; unitPrice: number; subtotal: number }>;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;
  deliveryAddress: string;
  paymentStatus: string;
  bankDetails?: { bankName: string; accountNumber: string; accountName: string };
}): string {
  const itemsText = order.items
    .map(
      (item, i) =>
        `${i + 1}. *${item.productName}* x${item.quantity} = ${formatNaira(item.subtotal)}`
    )
    .join('\n');

  let text = `🛍️ *ORDER INVOICE: ${order.reference}*\n` +
    `Hello ${order.customerName}, thank you for your order!\n\n` +
    `📦 *Items:*\n${itemsText}\n\n` +
    `💰 *Subtotal:* ${formatNaira(order.subtotal)}\n` +
    (order.discount > 0 ? `🏷️ *Discount:* -${formatNaira(order.discount)}\n` : '') +
    `🚚 *Delivery Fee:* ${formatNaira(order.deliveryFee)}\n` +
    `🧾 *TOTAL AMOUNT:* ${formatNaira(order.totalAmount)}\n\n` +
    `📍 *Delivery Address:* ${order.deliveryAddress}\n` +
    `📌 *Payment Status:* ${order.paymentStatus.toUpperCase()}\n`;

  if (order.paymentStatus.toLowerCase() !== 'paid' && order.bankDetails) {
    text += `\n💳 *Payment Account Details:*\n` +
      `Bank: ${order.bankDetails.bankName}\n` +
      `Account No: ${order.bankDetails.accountNumber}\n` +
      `Account Name: ${order.bankDetails.accountName}\n\n` +
      `_Kindly send proof of payment once transfer is complete. Thank you!_`;
  }

  return text;
}

/**
 * Generates direct WhatsApp order enquiry link for a specific product
 */
export function generateWhatsAppOrderUrl(
  phone: string,
  product: { productName: string; sku?: string; price: number }
): string {
  const msg =
    `Hello Zhat Beauty! I am interested in ordering *${product.productName}*` +
    (product.sku ? ` (${product.sku})` : '') +
    ` at ${formatNaira(product.price)}.\n` +
    `Please let me know if it is ready for dispatch or in stock. Thank you!`;
  return getWhatsAppClickToChatUrl(phone, msg);
}
