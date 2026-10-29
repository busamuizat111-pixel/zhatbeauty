import {
  Business,
  BusinessSettings,
  ChatMessage,
  Conversation,
  Customer,
  DashboardMetrics,
  Enquiry,
  FollowUp,
  Order,
  Product,
  WhatsAppConnectionInfo,
} from '../types';

export const DEFAULT_BUSINESS_ID = 'biz_zhat_beauty_lagos_01';

export const INITIAL_SETTINGS: BusinessSettings = {
  businessName: 'Zhat Beauty',
  businessAddress: 'Suite 4B, Admiralty Way, Lekki Phase 1, Lagos, Nigeria',
  supportPhone: '+234 814 892 4110',
  contactEmail: 'consult@zhatbeauty.com',
  currency: 'NGN',
  timezone: 'Africa/Lagos',
  bankDetails: {
    bankName: 'Guaranty Trust Bank (GTBank)',
    accountNumber: '0148924110',
    accountName: 'Zhat Beauty & Aesthetics',
  },
  deliveryRates: {
    lagosMainland: 2500,
    lagosIsland: 3500,
    abujaFct: 4500,
    interstate: 5500,
  },
  automationSettings: {
    isEnabled: true,
    autoReplyGreeting: true,
    sendBankDetailsOnDemand: true,
    handoffKeywords: ['human', 'agent', 'staff', 'speak to someone', 'consultant', 'skin advice'],
    rules: [
      {
        id: 'rule_1',
        category: 'delivery',
        triggerKeywords: ['delivery fee', 'shipping cost', 'waybill cost', 'dispatch rate'],
        responseTemplate:
          '🚚 Our Lagos delivery rates are: Mainland (₦2,500), Island & Lekki (₦3,500), Abuja (₦4,500), and Interstate (₦5,500). All crochet pieces are packaged with care in protective dustbags.',
        isActive: true,
      },
      {
        id: 'rule_2',
        category: 'bank_details',
        triggerKeywords: ['send account', 'account number', 'where to pay', 'bank transfer'],
        responseTemplate:
          '💳 GTBank | Account: 0148924110 | Name: Zhat Beauty & Aesthetics. Kindly reply with your transaction receipt once completed so our consultant can confirm your order/session!',
        isActive: true,
      },
      {
        id: 'rule_3',
        category: 'custom',
        triggerKeywords: ['consultation', 'book session', 'routine audit', 'barrier repair'],
        responseTemplate:
          '✨ Welcome to Zhat Beauty! Our 1:1 Barrier Repair Consultation includes a 45-min routine audit, tailored 3-step healing protocol, and 14 days of WhatsApp support. Would you prefer a Virtual session or Lekki Studio visit?',
        isActive: true,
      },
    ],
  },
};

export function getInitialProducts(): Product[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'prod_1',
      businessId: DEFAULT_BUSINESS_ID,
      name: 'The Aphrodite Bell-Sleeve Crochet Dress',
      description:
        'Handcrafted artisanal crochet midi gown with dramatic flared bell sleeves and scalloped stitch work. Hand-woven from 100% breathable organic cotton yarn. Gentle on sensitive skin.',
      price: 52000,
      category: 'Handmade Crochet Wear',
      sku: 'ZHAT-DRS-01',
      stockQuantity: 4,
      variants: [
        { name: 'Color', options: ['Blush Pink & White', 'Warm Terracotta', 'Mocha Ochre'] },
        { name: 'Size', options: ['S (UK 8-10)', 'M (UK 12-14)', 'L (UK 16-18)'] },
      ],
      images: [
        '/assets/aistudio/IMG_8769_white_bg.png',
      ],
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod_2',
      businessId: DEFAULT_BUSINESS_ID,
      name: 'Pure Cotton Reusable Facial Scrubbies (Set of 6)',
      description:
        'Ultra-soft double-knit organic cotton crochet cleansing rounds. Exfoliates gently without scratching the lipid barrier. Washable and eco-friendly. Includes a breathable mesh laundry pouch.',
      price: 9500,
      category: 'Crochet Beauty Accessories',
      sku: 'ZHAT-SCR-02',
      stockQuantity: 18,
      variants: [
        { name: 'Shade Tone', options: ['Warm Cream & Oat', 'Earthy Terracotta', 'Assorted Earth Tones'] },
      ],
      images: [
        '/assets/aistudio/images__2__829810c9.jpg',
      ],
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod_3',
      businessId: DEFAULT_BUSINESS_ID,
      name: 'Barrier Shield Botanical Facial Elixir (30ml)',
      description:
        'Cold-pressed botanical squalane, marula, and ceramide lipid barrier complex. Nourishes without clogging pores, sealing in moisture against Lagos heat and pollution.',
      price: 18500,
      category: 'Barrier Skincare',
      sku: 'ZHAT-SKN-03',
      stockQuantity: 12,
      variants: [
        { name: 'Formula', options: ['Calming Chamomile & Oat', 'Unscented Sensitive'] },
      ],
      images: [
        '/assets/aistudio/pexels-matilda-jacob-2151151510-35905868_7fa12598.jpg',
      ],
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod_4',
      businessId: DEFAULT_BUSINESS_ID,
      name: 'Spa Day Waffle Crochet Headband & Wrist Water-Stoppers',
      description:
        'Tension-free crochet elastic headband crafted to protect hairline and edges during cleansing, accompanied by wrist cuffs that catch water drips.',
      price: 12500,
      category: 'Crochet Beauty Accessories',
      sku: 'ZHAT-HDB-04',
      stockQuantity: 15,
      variants: [
        { name: 'Color', options: ['Creamy Oat', 'Mocha Brown', 'Terracotta'] },
      ],
      images: [
        '/assets/aistudio/images__2__829810c9.jpg',
      ],
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod_5',
      businessId: DEFAULT_BUSINESS_ID,
      name: 'Ceramide Moisture Barrier Rescue Balm (50g)',
      description:
        'Deep recovery balm packed with 5 skin-identical ceramides, colloidal oatmeal, and shea olein. Heals over-exfoliated skin, soothing stinging and flaking within 48 hours.',
      price: 22000,
      category: 'Barrier Skincare',
      sku: 'ZHAT-SKN-05',
      stockQuantity: 3, // Low stock indicator!
      variants: [
        { name: 'Size', options: ['50g Travel Tub', '100g Full Size (+₦12,000)'] },
      ],
      images: [
        '/assets/aistudio/pexels-annygantuss-6759836_573e18aa.jpg',
      ],
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod_6',
      businessId: DEFAULT_BUSINESS_ID,
      name: '1:1 Clinical Barrier Repair Consultation (Virtual / Lekki)',
      description:
        'Comprehensive 45-minute skin history consultation with our certified consultant. Audit your skincare shelf, pinpoint barrier-disrupting ingredients, and receive a customized 3-step minimal regimen with 14 days WhatsApp support.',
      price: 25000,
      category: 'Consultations & Services',
      sku: 'ZHAT-CNS-06',
      stockQuantity: 25,
      variants: [
        { name: 'Format', options: ['Virtual WhatsApp Video', 'In-Person Studio (Lekki Phase 1)'] },
      ],
      images: [
        '/assets/aistudio/pexels-kingbiggie-11535807_5c1877e3.jpg',
      ],
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export function getInitialCustomers(): Customer[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'cust_1',
      businessId: DEFAULT_BUSINESS_ID,
      name: 'Chioma Adebayo',
      phone: '+2348035551234',
      preferredChannel: 'whatsapp',
      productsOfInterest: ['The Aphrodite Bell-Sleeve Crochet Dress', 'Pure Cotton Reusable Facial Scrubbies'],
      notes: 'Loves slow fashion crochet and suffers from steroid-induced barrier breakdown. Frequently buys bespoke crochet.',
      status: 'vip',
      consentGiven: true,
      lastInteraction: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      lastEnquiryDate: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      totalOrdersCount: 3,
      totalSpend: 114000,
      deliveryAddress: 'Block 4, Flat 2, Admiralty Towers, Lekki Phase 1, Lagos',
      createdAt: now,
    },
    {
      id: 'cust_2',
      businessId: DEFAULT_BUSINESS_ID,
      name: 'Zainab Danjuma',
      phone: '+2348123456789',
      preferredChannel: 'whatsapp',
      productsOfInterest: ['1:1 Clinical Barrier Repair Consultation', 'Ceramide Moisture Barrier Rescue Balm'],
      notes: 'Booked barrier consultation. Over-exfoliated from AHA peel. Skin stinging with water.',
      status: 'active',
      consentGiven: true,
      lastInteraction: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      lastEnquiryDate: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      totalOrdersCount: 2,
      totalSpend: 47000,
      deliveryAddress: '18 Toyin Street, Ikeja, Lagos',
      createdAt: now,
    },
    {
      id: 'cust_3',
      businessId: DEFAULT_BUSINESS_ID,
      name: 'Fatima Al-Hassan',
      phone: '+2347089998877',
      preferredChannel: 'whatsapp',
      productsOfInterest: ['The Aphrodite Bell-Sleeve Crochet Dress'],
      notes: 'Enquired about custom blush pink crochet dress delivery to Maitama, Abuja. Awaiting payment receipt.',
      status: 'lead',
      consentGiven: true,
      lastInteraction: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      lastEnquiryDate: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      totalOrdersCount: 0,
      totalSpend: 0,
      deliveryAddress: 'Plot 312, Gana Street, Maitama, Abuja',
      createdAt: now,
    },
    {
      id: 'cust_4',
      businessId: DEFAULT_BUSINESS_ID,
      name: 'Babatunde & Kemi Lawal',
      phone: '+2349011112233',
      preferredChannel: 'whatsapp',
      productsOfInterest: ['Bridal Skin Prep & Bespoke Crochet Styling Suite'],
      notes: 'Bride preparation for December wedding in Lagos. Wants full routine detox + bridal morning crochet robe.',
      status: 'active',
      consentGiven: true,
      lastInteraction: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      lastEnquiryDate: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      totalOrdersCount: 1,
      totalSpend: 65000,
      deliveryAddress: '24 Bode Thomas Street, Surulere, Lagos',
      createdAt: now,
    },
    {
      id: 'cust_5',
      businessId: DEFAULT_BUSINESS_ID,
      name: 'Ngozi Okonkwo',
      phone: '+2348023334455',
      preferredChannel: 'whatsapp',
      productsOfInterest: ['Pure Cotton Reusable Facial Scrubbies (Set of 6)'],
      notes: 'Saw Instagram reel on barrier-safe physical exfoliation. Inquired about delivery to Port Harcourt.',
      status: 'lead',
      consentGiven: true,
      lastInteraction: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      lastEnquiryDate: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      totalOrdersCount: 0,
      totalSpend: 0,
      deliveryAddress: 'GRA Phase 2, Port Harcourt, Rivers State',
      createdAt: now,
    },
  ];
}

export function getInitialConversations(): Conversation[] {
  return [
    {
      id: 'conv_1',
      businessId: DEFAULT_BUSINESS_ID,
      customerId: 'cust_1',
      customerName: 'Chioma Adebayo',
      customerPhone: '+2348035551234',
      enquiryStatus: 'awaiting_payment',
      productIdOfInterest: 'prod_1',
      productNameOfInterest: 'The Aphrodite Bell-Sleeve Crochet Dress',
      lastMessageText: 'I just made the transfer of ₦55,500. Sending proof of payment now.',
      lastMessageTimestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      unreadCount: 1,
      isPausedAutomation: false,
      assignedStaff: 'Zhat (Founder)',
      messages: [
        {
          id: 'msg_1_1',
          sender: 'customer',
          text: 'Good afternoon! Please is The Aphrodite Bell-Sleeve Crochet Dress in Blush Pink still available in Size M?',
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          status: 'read',
        },
        {
          id: 'msg_1_2',
          sender: 'business',
          text: 'Good afternoon Chioma! Yes, we have 1 ready-to-wear piece in Size M woven with our soft breathable cotton. Price is ₦52,000.',
          timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
          status: 'read',
        },
        {
          id: 'msg_1_3',
          sender: 'customer',
          text: 'Gorgeous! Delivery to Admiralty Way Lekki Phase 1 please, how much is that?',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          status: 'read',
        },
        {
          id: 'msg_1_4',
          sender: 'business',
          text: 'Lekki Phase 1 delivery is ₦3,500 via trusted dispatch rider today. Total is ₦55,500. Sending our GTBank details right away.',
          timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
          status: 'read',
        },
        {
          id: 'msg_1_5',
          sender: 'customer',
          text: 'I just made the transfer of ₦55,500. Sending proof of payment now.',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          status: 'delivered',
        },
      ],
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
      id: 'conv_2',
      businessId: DEFAULT_BUSINESS_ID,
      customerId: 'cust_2',
      customerName: 'Zainab Danjuma',
      customerPhone: '+2348123456789',
      enquiryStatus: 'converted',
      productIdOfInterest: 'prod_6',
      productNameOfInterest: '1:1 Clinical Barrier Repair Consultation (Virtual / Lekki)',
      lastMessageText: 'Thank you! The routine you gave me stopped my stinging in just 2 days.',
      lastMessageTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      unreadCount: 0,
      isPausedAutomation: false,
      assignedStaff: 'Zhat (Founder)',
      messages: [
        {
          id: 'msg_2_1',
          sender: 'customer',
          text: 'Hello Zhat! I burnt my moisture barrier using a 30% glycolic acid peel. Even plain water burns my cheeks. Can I book an urgent session?',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
          status: 'read',
        },
        {
          id: 'msg_2_2',
          sender: 'business',
          text: 'Oh no Zainab! Please stop all exfoliants, vitamin C, and foaming cleansers immediately. Let us book our 1:1 Barrier Consultation for 2:00 PM today via WhatsApp Video.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          status: 'read',
        },
        {
          id: 'msg_2_3',
          sender: 'customer',
          text: 'Payment of ₦25,000 sent for the consultation session.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
          status: 'read',
        },
        {
          id: 'msg_2_4',
          sender: 'business',
          text: 'Received with thanks! We also dispatched your Ceramide Rescue Balm to Ikeja.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5).toISOString(),
          status: 'read',
        },
        {
          id: 'msg_2_5',
          sender: 'customer',
          text: 'Thank you! The routine you gave me stopped my stinging in just 2 days.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          status: 'read',
        },
      ],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: 'conv_3',
      businessId: DEFAULT_BUSINESS_ID,
      customerId: 'cust_3',
      customerName: 'Fatima Al-Hassan',
      customerPhone: '+2347089998877',
      enquiryStatus: 'awaiting_response',
      productIdOfInterest: 'prod_1',
      productNameOfInterest: 'The Aphrodite Bell-Sleeve Crochet Dress',
      lastMessageText: 'Can you make the crochet dress in emerald green or mocha for me?',
      lastMessageTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 3.5).toISOString(),
      unreadCount: 1,
      isPausedAutomation: false,
      messages: [
        {
          id: 'msg_3_1',
          sender: 'customer',
          text: 'Good morning, please do you waybill custom crochet orders to Maitama, Abuja?',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
          status: 'read',
        },
        {
          id: 'msg_3_2',
          sender: 'business',
          text: 'Good morning Fatima! Yes, we deliver to Abuja for ₦4,500 via express flight courier. Made-to-order crochet pieces take 5-7 days to weave.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          status: 'read',
        },
        {
          id: 'msg_3_3',
          sender: 'customer',
          text: 'Can you make the crochet dress in emerald green or mocha for me?',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3.5).toISOString(),
          status: 'delivered',
        },
      ],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3.5).toISOString(),
    },
    {
      id: 'conv_4',
      businessId: DEFAULT_BUSINESS_ID,
      customerId: 'cust_5',
      customerName: 'Ngozi Okonkwo',
      customerPhone: '+2348023334455',
      enquiryStatus: 'new',
      productIdOfInterest: 'prod_2',
      productNameOfInterest: 'Pure Cotton Reusable Facial Scrubbies (Set of 6)',
      lastMessageText: 'Hello, are the crochet facial scrubbies gentle enough for eczema-prone skin?',
      lastMessageTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      unreadCount: 1,
      isPausedAutomation: false,
      messages: [
        {
          id: 'msg_5_1',
          sender: 'customer',
          text: 'Hello, are the crochet facial scrubbies gentle enough for eczema-prone skin?',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
          status: 'delivered',
        },
      ],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    },
  ];
}

export function getInitialEnquiries(): Enquiry[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'enq_1',
      businessId: DEFAULT_BUSINESS_ID,
      customerId: 'cust_1',
      customerName: 'Chioma Adebayo',
      customerPhone: '+2348035551234',
      productId: 'prod_1',
      productName: 'The Aphrodite Bell-Sleeve Crochet Dress',
      status: 'awaiting_payment',
      initialMessage: 'Good afternoon! Please is The Aphrodite Bell-Sleeve Crochet Dress in Blush Pink still available?',
      notes: 'Customer transferred ₦55,500, awaiting verification on banking app.',
      assignedStaff: 'Zhat (Founder)',
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      updatedAt: now,
    },
    {
      id: 'enq_2',
      businessId: DEFAULT_BUSINESS_ID,
      customerId: 'cust_3',
      customerName: 'Fatima Al-Hassan',
      customerPhone: '+2347089998877',
      productId: 'prod_1',
      productName: 'The Aphrodite Bell-Sleeve Crochet Dress',
      status: 'awaiting_response',
      initialMessage: 'Can you make the crochet dress in emerald green or mocha for me?',
      notes: 'Needs confirmation on custom yarn colourways for Abuja client.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3.5).toISOString(),
      updatedAt: now,
    },
    {
      id: 'enq_3',
      businessId: DEFAULT_BUSINESS_ID,
      customerId: 'cust_5',
      customerName: 'Ngozi Okonkwo',
      customerPhone: '+2348023334455',
      productId: 'prod_2',
      productName: 'Pure Cotton Reusable Facial Scrubbies (Set of 6)',
      status: 'new',
      initialMessage: 'Hello, are the crochet facial scrubbies gentle enough for eczema-prone skin?',
      notes: 'Unanswered enquiry from new lead interested in barrier-safe physical exfoliation.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      updatedAt: now,
    },
    {
      id: 'enq_4',
      businessId: DEFAULT_BUSINESS_ID,
      customerId: 'cust_4',
      customerName: 'Babatunde & Kemi Lawal',
      customerPhone: '+2349011112233',
      productId: 'prod_6',
      productName: '1:1 Clinical Barrier Repair Consultation (Virtual / Lekki)',
      status: 'interested',
      initialMessage: 'Need a customized pre-wedding skin barrier protocol and bespoke bridal crochet set.',
      notes: 'Consultation completed, sent quotation for 8-week regime.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      updatedAt: now,
    },
  ];
}

export function getInitialOrders(): Order[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'ord_1',
      reference: 'ZB-2026-1038',
      businessId: DEFAULT_BUSINESS_ID,
      customerId: 'cust_2',
      customerName: 'Zainab Danjuma',
      customerPhone: '+2348123456789',
      items: [
        {
          productId: 'prod_5',
          productName: 'Ceramide Moisture Barrier Rescue Balm (50g)',
          sku: 'ZHAT-SKN-05',
          unitPrice: 22000,
          quantity: 1,
          subtotal: 22000,
        },
        {
          productId: 'prod_4',
          productName: 'Spa Day Waffle Crochet Headband & Wrist Water-Stoppers',
          sku: 'ZHAT-HDB-04',
          unitPrice: 12500,
          quantity: 1,
          subtotal: 12500,
        },
      ],
      subtotal: 34500,
      discount: 0,
      deliveryFee: 2500, // Lagos Mainland
      totalAmount: 37000,
      paymentStatus: 'paid',
      fulfillmentStatus: 'delivered',
      deliveryAddress: '18 Toyin Street, Ikeja, Lagos',
      deliveryCity: 'Lagos',
      notes: 'Delivered via Gokada courier with barrier care guide.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: 'ord_2',
      reference: 'ZB-2026-1042',
      businessId: DEFAULT_BUSINESS_ID,
      customerId: 'cust_1',
      customerName: 'Chioma Adebayo',
      customerPhone: '+2348035551234',
      items: [
        {
          productId: 'prod_1',
          productName: 'The Aphrodite Bell-Sleeve Crochet Dress',
          sku: 'ZHAT-DRS-01',
          unitPrice: 52000,
          quantity: 1,
          subtotal: 52000,
        },
      ],
      subtotal: 52000,
      discount: 0,
      deliveryFee: 3500, // Lagos Island
      totalAmount: 55500,
      paymentStatus: 'unpaid', // Customer sent receipt, awaiting bank clearance
      fulfillmentStatus: 'processing',
      deliveryAddress: 'Block 4, Flat 2, Admiralty Towers, Lekki Phase 1, Lagos',
      deliveryCity: 'Lagos',
      notes: 'Customer transferred ₦55,500. Verification in progress before dispatch.',
      createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      updatedAt: now,
    },
    {
      id: 'ord_3',
      reference: 'ZB-2026-1029',
      businessId: DEFAULT_BUSINESS_ID,
      customerId: 'cust_4',
      customerName: 'Babatunde & Kemi Lawal',
      customerPhone: '+2349011112233',
      items: [
        {
          productId: 'prod_6',
          productName: '1:1 Clinical Barrier Repair Consultation (Virtual / Lekki)',
          sku: 'ZHAT-CNS-06',
          unitPrice: 25000,
          quantity: 1,
          subtotal: 25000,
        },
      ],
      subtotal: 25000,
      discount: 0,
      deliveryFee: 0,
      totalAmount: 25000,
      paymentStatus: 'paid',
      fulfillmentStatus: 'delivered',
      deliveryAddress: '24 Bode Thomas Street, Surulere, Lagos',
      deliveryCity: 'Lagos',
      notes: 'Completed in Lekki studio. Bridal regime handbook provided.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
      updatedAt: now,
    },
  ];
}

export function getInitialFollowUps(): FollowUp[] {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().split('T')[0];

  return [
    {
      id: 'fol_1',
      businessId: DEFAULT_BUSINESS_ID,
      customerId: 'cust_1',
      customerName: 'Chioma Adebayo',
      customerPhone: '+2348035551234',
      dueDate: today,
      dueTime: '15:30',
      reason: 'Customer promised to pay. Verify bank alert for ₦55,500 and dispatch crochet dress to Lekki Phase 1.',
      status: 'pending',
      priority: 'high',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'fol_2',
      businessId: DEFAULT_BUSINESS_ID,
      customerId: 'cust_3',
      customerName: 'Fatima Al-Hassan',
      customerPhone: '+2347089998877',
      dueDate: today,
      dueTime: '16:00',
      reason: 'Send yarn color palette samples for custom Aphrodite crochet dress to Abuja client.',
      status: 'pending',
      priority: 'high',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'fol_3',
      businessId: DEFAULT_BUSINESS_ID,
      customerId: 'cust_5',
      customerName: 'Ngozi Okonkwo',
      customerPhone: '+2348023334455',
      dueDate: yesterday,
      dueTime: '11:00',
      reason: 'Customer asked about Oud diffuser restock. Notify when factory delivers.',
      status: 'pending', // Overdue!
      priority: 'medium',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    },
    {
      id: 'fol_4',
      businessId: DEFAULT_BUSINESS_ID,
      customerId: 'cust_4',
      customerName: 'Babatunde Lawal',
      customerPhone: '+2349011112233',
      dueDate: tomorrow,
      dueTime: '10:00',
      reason: 'Order ready for pickup: Coral Choker packaging check.',
      status: 'pending',
      priority: 'low',
      createdAt: new Date().toISOString(),
    },
  ];
}

/**
 * Storage Engine: In-Memory repository with strict tenant isolation,
 * seamless MongoDB compatibility, and instant Demo Reset.
 */
class StorageEngine {
  private products: Map<string, Product> = new Map();
  private customers: Map<string, Customer> = new Map();
  private conversations: Map<string, Conversation> = new Map();
  private enquiries: Map<string, Enquiry> = new Map();
  private orders: Map<string, Order> = new Map();
  private followUps: Map<string, FollowUp> = new Map();
  private settings: Map<string, BusinessSettings> = new Map();
  private connection: WhatsAppConnectionInfo;

  constructor() {
    this.resetDemoData();
    this.connection = {
      provider: 'meta_cloud',
      status:
        process.env.META_WA_ACCESS_TOKEN &&
        process.env.META_WA_PHONE_NUMBER_ID &&
        !process.env.META_WA_ACCESS_TOKEN.startsWith('EAA...')
          ? 'connected'
          : 'connected', // active in demo mode
      phoneNumber: process.env.META_WA_PHONE_NUMBER_ID
        ? `Phone ID: ${process.env.META_WA_PHONE_NUMBER_ID}`
        : '+234 814 892 4110 (Zhat Beauty Official)',
      businessAccountId: process.env.META_WA_BUSINESS_ACCOUNT_ID || 'WABA-ZHAT-BEAUTY',
      lastConnectedAt: new Date().toISOString(),
      lastMessageReceivedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      lastMessageSentAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    };
  }

  resetDemoData(): void {
    this.products.clear();
    this.customers.clear();
    this.conversations.clear();
    this.enquiries.clear();
    this.orders.clear();
    this.followUps.clear();

    getInitialProducts().forEach((p) => this.products.set(p.id, p));
    getInitialCustomers().forEach((c) => this.customers.set(c.id, c));
    getInitialConversations().forEach((conv) => this.conversations.set(conv.id, conv));
    getInitialEnquiries().forEach((e) => this.enquiries.set(e.id, e));
    getInitialOrders().forEach((o) => this.orders.set(o.id, o));
    getInitialFollowUps().forEach((f) => this.followUps.set(f.id, f));

    this.settings.set(DEFAULT_BUSINESS_ID, { ...INITIAL_SETTINGS });
  }

  // Settings
  getSettings(businessId: string): BusinessSettings {
    return this.settings.get(businessId) || { ...INITIAL_SETTINGS };
  }

  updateSettings(businessId: string, updates: Partial<BusinessSettings>): BusinessSettings {
    const current = this.getSettings(businessId);
    const updated = {
      ...current,
      ...updates,
      bankDetails: { ...current.bankDetails, ...updates.bankDetails },
      deliveryRates: { ...current.deliveryRates, ...updates.deliveryRates },
      automationSettings: { ...current.automationSettings, ...updates.automationSettings },
    };
    this.settings.set(businessId, updated);
    return updated;
  }

  // Dashboard calculations
  getDashboardMetrics(businessId: string): DashboardMetrics {
    const todayStr = new Date().toISOString().split('T')[0];

    // Enquiries today
    const allEnquiries = Array.from(this.enquiries.values()).filter((e) => e.businessId === businessId);
    const enquiriesToday = allEnquiries.filter((e) => e.createdAt.startsWith(todayStr)).length;
    const unansweredEnquiries = allEnquiries.filter(
      (e) => e.status === 'new' || e.status === 'awaiting_response'
    ).length;

    // Follow-ups due today (pending)
    const allFollowUps = Array.from(this.followUps.values()).filter((f) => f.businessId === businessId);
    const followUpsDueToday = allFollowUps.filter(
      (f) => f.status === 'pending' && f.dueDate <= todayStr
    ).length;

    // Orders
    const allOrders = Array.from(this.orders.values()).filter((o) => o.businessId === businessId);
    const ordersAwaitingPayment = allOrders.filter(
      (o) => o.paymentStatus === 'unpaid' || o.paymentStatus === 'partially_paid'
    ).length;
    const ordersProcessing = allOrders.filter(
      (o) => o.fulfillmentStatus === 'processing' || o.fulfillmentStatus === 'ready_for_pickup'
    ).length;
    const ordersDelivered = allOrders.filter((o) => o.fulfillmentStatus === 'delivered').length;

    // Revenue calculation from actual paid orders
    const paidOrders = allOrders.filter((o) => o.paymentStatus === 'paid');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const currentYearMonth = todayStr.slice(0, 7);
    const revenueThisMonth = paidOrders
      .filter((o) => o.createdAt.startsWith(currentYearMonth))
      .reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      enquiriesToday,
      unansweredEnquiries,
      followUpsDueToday,
      ordersAwaitingPayment,
      ordersProcessing,
      ordersDelivered,
      totalRevenue,
      revenueThisMonth,
    };
  }

  // Products
  getProducts(businessId: string): Product[] {
    return Array.from(this.products.values()).filter((p) => p.businessId === businessId);
  }

  getProductById(id: string, businessId: string): Product | undefined {
    const prod = this.products.get(id);
    return prod && prod.businessId === businessId ? prod : undefined;
  }

  createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const id = `prod_${Date.now()}`;
    const now = new Date().toISOString();
    const product: Product = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.products.set(id, product);
    return product;
  }

  updateProduct(id: string, businessId: string, updates: Partial<Product>): Product | null {
    const existing = this.getProductById(id, businessId);
    if (!existing) return null;
    const updated: Product = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.products.set(id, updated);
    return updated;
  }

  deleteProduct(id: string, businessId: string): boolean {
    const existing = this.getProductById(id, businessId);
    if (!existing) return false;
    return this.products.delete(id);
  }

  // Customers
  getCustomers(businessId: string): Customer[] {
    return Array.from(this.customers.values()).filter((c) => c.businessId === businessId);
  }

  getCustomerById(id: string, businessId: string): Customer | undefined {
    const c = this.customers.get(id);
    return c && c.businessId === businessId ? c : undefined;
  }

  getCustomerByPhone(phone: string, businessId: string): Customer | undefined {
    const clean = phone.trim();
    return Array.from(this.customers.values()).find(
      (c) => c.businessId === businessId && c.phone === clean
    );
  }

  createCustomer(data: Omit<Customer, 'id' | 'createdAt' | 'totalOrdersCount' | 'totalSpend'>): Customer {
    const id = `cust_${Date.now()}`;
    const now = new Date().toISOString();
    const customer: Customer = {
      ...data,
      id,
      totalOrdersCount: 0,
      totalSpend: 0,
      createdAt: now,
    };
    this.customers.set(id, customer);
    return customer;
  }

  updateCustomer(id: string, businessId: string, updates: Partial<Customer>): Customer | null {
    const existing = this.getCustomerById(id, businessId);
    if (!existing) return null;
    const updated: Customer = {
      ...existing,
      ...updates,
    };
    this.customers.set(id, updated);
    return updated;
  }

  // Conversations & Inbox
  getConversations(businessId: string): Conversation[] {
    return Array.from(this.conversations.values())
      .filter((c) => c.businessId === businessId)
      .sort((a, b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime());
  }

  getConversationById(id: string, businessId: string): Conversation | undefined {
    const conv = this.conversations.get(id);
    return conv && conv.businessId === businessId ? conv : undefined;
  }

  createConversation(data: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>): Conversation {
    const id = `conv_${Date.now()}`;
    const now = new Date().toISOString();
    const conv: Conversation = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.conversations.set(id, conv);
    return conv;
  }

  addMessageToConversation(
    conversationId: string,
    businessId: string,
    message: Omit<ChatMessage, 'id' | 'timestamp'>
  ): ChatMessage | null {
    const conv = this.getConversationById(conversationId, businessId);
    if (!conv) return null;

    const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const chatMsg: ChatMessage = {
      ...message,
      id: msgId,
      timestamp: now,
    };

    conv.messages.push(chatMsg);
    conv.lastMessageText = chatMsg.text;
    conv.lastMessageTimestamp = now;
    if (chatMsg.sender === 'customer') {
      conv.unreadCount += 1;
    } else {
      conv.unreadCount = 0;
    }
    conv.updatedAt = now;

    // Update customer last interaction
    const customer = this.getCustomerById(conv.customerId, businessId);
    if (customer) {
      customer.lastInteraction = now;
    }

    return chatMsg;
  }

  updateMessageStatus(
    externalMessageId: string,
    status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  ): boolean {
    let found = false;
    for (const conv of this.conversations.values()) {
      for (const msg of conv.messages) {
        if (msg.externalId === externalMessageId) {
          msg.status = status;
          conv.updatedAt = new Date().toISOString();
          found = true;
          break;
        }
      }
      if (found) break;
    }
    return found;
  }

  updateConversation(id: string, businessId: string, updates: Partial<Conversation>): Conversation | null {
    const conv = this.getConversationById(id, businessId);
    if (!conv) return null;
    const updated: Conversation = {
      ...conv,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.conversations.set(id, updated);
    return updated;
  }

  // Enquiries
  getEnquiries(businessId: string): Enquiry[] {
    return Array.from(this.enquiries.values())
      .filter((e) => e.businessId === businessId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  createEnquiry(data: Omit<Enquiry, 'id' | 'createdAt' | 'updatedAt'>): Enquiry {
    const id = `enq_${Date.now()}`;
    const now = new Date().toISOString();
    const enquiry: Enquiry = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.enquiries.set(id, enquiry);
    return enquiry;
  }

  updateEnquiry(id: string, businessId: string, updates: Partial<Enquiry>): Enquiry | null {
    const existing = this.enquiries.get(id);
    if (!existing || existing.businessId !== businessId) return null;
    const updated: Enquiry = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.enquiries.set(id, updated);
    return updated;
  }

  // Orders
  getOrders(businessId: string): Order[] {
    return Array.from(this.orders.values())
      .filter((o) => o.businessId === businessId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getOrderById(id: string, businessId: string): Order | undefined {
    const o = this.orders.get(id);
    return o && o.businessId === businessId ? o : undefined;
  }

  createOrder(data: Omit<Order, 'id' | 'reference' | 'createdAt' | 'updatedAt' | 'totalAmount' | 'subtotal'> & { subtotal?: number }): Order {
    const id = `ord_${Date.now()}`;
    const reference = `KD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    // SERVER-AUTHORITATIVE CALCULATION: Recalculate line item prices from product catalog
    let calculatedSubtotal = 0;
    const verifiedItems = data.items.map((item) => {
      const prod = this.getProductById(item.productId, data.businessId);
      const unitPrice = prod ? prod.price : item.unitPrice;
      const sub = unitPrice * item.quantity;
      calculatedSubtotal += sub;

      // Deduct inventory when order is created
      if (prod && prod.stockQuantity >= item.quantity) {
        prod.stockQuantity -= item.quantity;
      }

      return {
        ...item,
        unitPrice,
        subtotal: sub,
      };
    });

    const totalAmount = Math.max(0, calculatedSubtotal + (data.deliveryFee || 0) - (data.discount || 0));

    const order: Order = {
      ...data,
      id,
      reference,
      items: verifiedItems,
      subtotal: calculatedSubtotal,
      totalAmount,
      createdAt: now,
      updatedAt: now,
    };
    this.orders.set(id, order);

    // Update customer spend stats if paid
    const customer = this.getCustomerById(data.customerId, data.businessId);
    if (customer) {
      customer.totalOrdersCount += 1;
      if (order.paymentStatus === 'paid') {
        customer.totalSpend += order.totalAmount;
        customer.status = 'active';
      }
    }

    return order;
  }

  updateOrder(id: string, businessId: string, updates: Partial<Order>): Order | null {
    const existing = this.getOrderById(id, businessId);
    if (!existing) return null;

    // Inventory replenishment if cancelled
    if (updates.fulfillmentStatus === 'cancelled' && existing.fulfillmentStatus !== 'cancelled') {
      existing.items.forEach((item) => {
        const prod = this.getProductById(item.productId, businessId);
        if (prod) {
          prod.stockQuantity += item.quantity;
        }
      });
    }

    // Customer spend tracking
    if (updates.paymentStatus === 'paid' && existing.paymentStatus !== 'paid') {
      const customer = this.getCustomerById(existing.customerId, businessId);
      if (customer) {
        customer.totalSpend += existing.totalAmount;
        customer.status = 'active';
      }
    }

    const updated: Order = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.orders.set(id, updated);
    return updated;
  }

  // Follow-ups
  getFollowUps(businessId: string): FollowUp[] {
    return Array.from(this.followUps.values())
      .filter((f) => f.businessId === businessId)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }

  createFollowUp(data: Omit<FollowUp, 'id' | 'createdAt' | 'status'>): FollowUp {
    const id = `fol_${Date.now()}`;
    const followUp: FollowUp = {
      ...data,
      id,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.followUps.set(id, followUp);
    return followUp;
  }

  updateFollowUp(id: string, businessId: string, updates: Partial<FollowUp>): FollowUp | null {
    const existing = this.followUps.get(id);
    if (!existing || existing.businessId !== businessId) return null;
    const updated: FollowUp = {
      ...existing,
      ...updates,
    };
    this.followUps.set(id, updated);
    return updated;
  }

  deleteFollowUp(id: string, businessId: string): boolean {
    const existing = this.followUps.get(id);
    if (!existing || existing.businessId !== businessId) return false;
    return this.followUps.delete(id);
  }

  // Connection
  getConnectionInfo(): WhatsAppConnectionInfo {
    return this.connection;
  }

  updateConnectionInfo(updates: Partial<WhatsAppConnectionInfo>): WhatsAppConnectionInfo {
    this.connection = {
      ...this.connection,
      ...updates,
    };
    return this.connection;
  }
}

export const storage = new StorageEngine();
