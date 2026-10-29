import { BusinessSettings, Product } from '../types';
import { formatNaira } from '../lib/formatters';

export interface AutoResponseResult {
  shouldReply: boolean;
  replyText?: string;
  flagForHumanAttention: boolean;
  triggerCategory?: string;
  matchedReason?: string;
}

/**
 * Rules-based Automated Assistant for Nigerian Merchants.
 * Grounded strictly in approved products and business settings.
 * Includes automatic human handoff detection.
 */
export function evaluateAutomatedResponse(
  messageText: string,
  settings: BusinessSettings,
  products: Product[],
  isPausedForConversation: boolean
): AutoResponseResult {
  const normalized = messageText.toLowerCase().trim();

  // 1. Check if human handoff was already engaged for this conversation
  if (isPausedForConversation) {
    return {
      shouldReply: false,
      flagForHumanAttention: true,
      matchedReason: 'Conversation automation is paused by merchant for human handoff.',
    };
  }

  // 2. Check master switch
  if (!settings.automationSettings.isEnabled) {
    return {
      shouldReply: false,
      flagForHumanAttention: true,
      matchedReason: 'Automated assistant is currently disabled in business settings.',
    };
  }

  // 3. Check for human handoff trigger keywords
  const handoffWords = settings.automationSettings.handoffKeywords || [
    'human',
    'agent',
    'staff',
    'speak to someone',
    'complain',
    'issue',
    'talk to human',
    'person',
  ];
  if (handoffWords.some((word) => normalized.includes(word.toLowerCase()))) {
    return {
      shouldReply: true,
      replyText: `Hello! I have flagged this conversation for our team. A member of staff at ${settings.businessName} will attend to you shortly. Thank you for your patience! 🙏`,
      flagForHumanAttention: true,
      triggerCategory: 'handoff',
      matchedReason: 'Customer requested human agent.',
    };
  }

  // 4. Check for Bank Account / Payment details demand
  if (
    normalized.includes('bank') ||
    normalized.includes('account number') ||
    normalized.includes('account details') ||
    normalized.includes('how to pay') ||
    normalized.includes('send account') ||
    normalized.includes('acct details')
  ) {
    const bank = settings.bankDetails;
    return {
      shouldReply: true,
      replyText:
        `💳 *Official Payment Details for ${settings.businessName}*\n\n` +
        `Bank: *${bank.bankName}*\n` +
        `Account Number: *${bank.accountNumber}*\n` +
        `Account Name: *${bank.accountName}*\n\n` +
        `Kindly reply with your transfer receipt and delivery address once done so we can process your order immediately.`,
      flagForHumanAttention: false,
      triggerCategory: 'bank_details',
      matchedReason: 'Inquiry about bank transfer details.',
    };
  }

  // 5. Check for Delivery options & rates
  if (
    normalized.includes('delivery') ||
    normalized.includes('dispatch') ||
    normalized.includes('shipping') ||
    normalized.includes('waybill') ||
    normalized.includes('send to abuja') ||
    normalized.includes('send to lagos')
  ) {
    const rates = settings.deliveryRates;
    return {
      shouldReply: true,
      replyText:
        `🚚 *Delivery Rates & Timeline - ${settings.businessName}*\n\n` +
        `• Lagos Mainland: ${formatNaira(rates.lagosMainland)} (Same day / 24 hrs)\n` +
        `• Lagos Island: ${formatNaira(rates.lagosIsland)} (Same day / 24 hrs)\n` +
        `• Abuja (FCT): ${formatNaira(rates.abujaFct)} (24 - 48 hrs)\n` +
        `• Interstate / Other States: ${formatNaira(rates.interstate)} (2 - 4 business days via motor park / DHL)\n\n` +
        `Where are you ordering to? Reply with your city or state to confirm your delivery fee!`,
      flagForHumanAttention: false,
      triggerCategory: 'delivery',
      matchedReason: 'Inquiry about delivery rates.',
    };
  }

  // 6. Check for Location / Physical Address / Opening hours
  if (
    normalized.includes('where is your shop') ||
    normalized.includes('your store') ||
    normalized.includes('location') ||
    normalized.includes('address') ||
    normalized.includes('opening hours') ||
    normalized.includes('are you open')
  ) {
    return {
      shouldReply: true,
      replyText:
        `📍 *Store Location & Business Hours*\n\n` +
        `Address: ${settings.businessAddress || 'Lekki Phase 1, Lagos, Nigeria'}\n` +
        `Business Hours: Monday – Saturday (9:00 AM – 6:30 PM WAT)\n` +
        `Support Line: ${settings.supportPhone || '+234 803 000 0000'}\n\n` +
        `We also do nationwide delivery daily!`,
      flagForHumanAttention: false,
      triggerCategory: 'location',
      matchedReason: 'Inquiry about store address or hours.',
    };
  }

  // 7. Check for specific product pricing or stock from active catalog
  const matchedProduct = products.find(
    (p) =>
      p.status === 'active' &&
      (normalized.includes(p.name.toLowerCase()) ||
        normalized.includes(p.sku.toLowerCase()) ||
        (p.category && normalized.includes(p.category.toLowerCase())))
  );

  if (matchedProduct && (normalized.includes('price') || normalized.includes('how much') || normalized.includes('cost') || normalized.includes('available'))) {
    const stockStatus =
      matchedProduct.stockQuantity > 0
        ? `✅ In Stock (${matchedProduct.stockQuantity} pieces available)`
        : `⚠️ Currently out of stock. Contact our staff to pre-order.`;

    const variantsText =
      matchedProduct.variants.length > 0
        ? `\nAvailable options: ${matchedProduct.variants.map((v) => `${v.name}: ${v.options.join(', ')}`).join(' | ')}`
        : '';

    return {
      shouldReply: true,
      replyText:
        `🛍️ *${matchedProduct.name}*\n\n` +
        `Price: *${formatNaira(matchedProduct.price)}*\n` +
        `Status: ${stockStatus}${variantsText}\n\n` +
        `${matchedProduct.description.slice(0, 150)}${matchedProduct.description.length > 150 ? '...' : ''}\n\n` +
        `Would you like to place an order for this? Reply *YES* to proceed!`,
      flagForHumanAttention: matchedProduct.stockQuantity === 0,
      triggerCategory: 'price',
      matchedReason: `Customer asked about product ${matchedProduct.name}.`,
    };
  }

  // 8. Custom user-defined rules from settings
  if (settings.automationSettings.rules) {
    for (const rule of settings.automationSettings.rules) {
      if (
        rule.isActive &&
        rule.triggerKeywords.some((kw) => normalized.includes(kw.toLowerCase()))
      ) {
        return {
          shouldReply: true,
          replyText: rule.responseTemplate,
          flagForHumanAttention: false,
          triggerCategory: rule.category,
          matchedReason: `Matched custom rule keywords.`,
        };
      }
    }
  }

  // 9. Unknown enquiry or ambiguous question -> flag for manual staff response
  return {
    shouldReply: false,
    flagForHumanAttention: true,
    matchedReason: 'No specific automated rule matched. Flagged for merchant attention.',
  };
}
