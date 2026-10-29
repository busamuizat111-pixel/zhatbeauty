# KasuwaDesk - WhatsApp Sales Management System for Nigerian Businesses

A mobile-first, full-stack WhatsApp CRM, order fulfillment, and sales management platform built for Nigerian small businesses (SMEs).

Designed for Nigerian commerce:
- **Currency:** Nigerian Naira (`₦ NGN`) with server-side authoritative calculations.
- **Timezone:** West Africa Time (`Africa/Lagos`).
- **Delivery Presets:** Lagos Mainland (₦2,500), Lagos Island (₦3,500), Abuja FCT (₦4,500), and Interstate Waybill (₦5,500).
- **Phone Normalization:** International E.164 conversion (+234 format).
- **Payment & Bank Transfers:** Access Bank, GTBank, Zenith Bank details generation for customer transfers.

---

## 1. Core Features

1. **Overview Dashboard**
   - Answers the 7 essential merchant questions:
     - *Who contacted my business today?*
     - *Which customers are interested in buying?*
     - *Which enquiries have not been answered?*
     - *Which customers need follow-up?*
     - *What orders are pending payment or delivery?*
     - *Which products are selling?*
     - *How much revenue have I recorded?*
   - Real calculated metrics from stored records (no fabricated numbers).

2. **WhatsApp Inbox & Enquiry Manager**
   - Unified customer conversation history.
   - Linkage to products of interest and inventory.
   - Status pipeline: `New`, `Awaiting response`, `Interested`, `Awaiting payment`, `Converted`, `Lost`.
   - Pre-filled Nigerian Quick Reply templates:
     - 💳 Send Official Bank Transfer Details
     - 🚚 Send Lagos & Interstate Delivery Rates
     - 📦 Order Confirmation & Dispatch Notice
   - Human handoff toggle (`isPausedAutomation`) to pause bots for individual customers.
   - Test Inbound Simulator for demonstrating bot replies and human handoffs.

3. **Product Catalogue & Stock Tracking**
   - Full CRUD with images, SKU, variants (sizes, colours), and categories.
   - Enforced non-negative prices and non-negative inventory quantities.
   - Inventory reservation: stock is deducted upon order creation and replenished if cancelled.
   - Generate shareable WhatsApp click-to-chat links with pre-filled enquiry text.

4. **Customer CRM**
   - Normalized Nigerian phone numbers (+234).
   - Duplicate prevention on phone number.
   - Customer status: `Lead`, `Active`, `VIP`, `At Risk`, `Inactive`.
   - Customer history drawer showing total orders and total spend.

5. **Order Management & Invoicing**
   - Server-authoritative totals (never trusting client-submitted prices).
   - Payment statuses: `Unpaid`, `Partially paid`, `Paid`, `Refunded`.
   - Fulfillment statuses: `Pending`, `Processing`, `Ready for pickup`, `Dispatched`, `Delivered`, `Cancelled`.
   - Instant WhatsApp Order Invoice generator ready to copy and send.

6. **Follow-up Reminders**
   - Categorized by: *Due Today*, *Overdue*, *Upcoming*, and *Completed*.
   - Preset triggers: "Customer asked for price", "Customer promised to pay", "Order ready for collection", "Delivery confirmation required".
   - Record completion outcomes and launch direct WhatsApp chats.

7. **Modular WhatsApp Messaging Architecture**
   - **Provider A (Unofficial WhatsApp Web Adapter):** Powered by `whatsapp-web.js` in a dedicated persistent Node.js microservice (`/services/whatsapp-web-service`). Includes clear warnings on account restrictions and protocol changes.
   - **Provider B (Meta WhatsApp Cloud API Adapter):** Official Graph API integration with webhook verification, deduplication cache, and zero account ban risk.
   - Test Message Dispatcher to test sending to any Nigerian phone number.

8. **Rules-Based Automated Assistant**
   - Configurable keyword triggers for Price, Available Sizes, Delivery Rates, Store Location, Opening Hours, and Bank Details.
   - Uses live product records and business settings as the source of truth.
   - Flags for manual staff intervention if inquiry is unrecognized or when customer requests human help.

---

## 2. Technology Stack

- **Backend & API:** Node.js, Express, TypeScript, Zod request validation.
- **Database:** MongoDB with Mongoose (with schema tenant isolation via indexed `businessId`). Includes fallback in-memory repository for Demo Mode.
- **Frontend:** React, Vite, Tailwind CSS, Lucide React icons.
- **Messaging:** Modular Adapter (`IMessagingAdapter`) supporting both `WhatsAppWebAdapter` and `MetaCloudAdapter`.

---

## 3. Project Structure

```
/
├── services/
│   └── whatsapp-web-service/    # Dedicated persistent Node.js daemon (whatsapp-web.js)
│       ├── index.js             # Puppeteer + LocalAuth session manager
│       ├── package.json
│       └── README.md
├── src/
│   ├── components/
│   │   ├── dashboard/           # OverviewView.tsx
│   │   ├── inbox/               # InboxView.tsx
│   │   ├── products/            # ProductsView.tsx
│   │   ├── customers/           # CustomersView.tsx
│   │   ├── orders/              # OrdersView.tsx
│   │   ├── followups/           # FollowUpsView.tsx
│   │   ├── whatsapp/            # WhatsAppConnectionsView.tsx
│   │   ├── settings/            # SettingsView.tsx
│   │   └── layout/              # Navbar.tsx, Sidebar.tsx, MobileNav.tsx
│   ├── lib/
│   │   ├── api.ts               # Frontend API client
│   │   ├── formatters.ts        # Naira (₦), Lagos time, WhatsApp URLs
│   │   └── validations.ts       # Zod schemas & phone normalizer
│   ├── server/
│   │   ├── models/              # Mongoose tenant-isolated schemas
│   │   ├── messaging/           # Modular WhatsApp adapters
│   │   ├── automatedResponses.ts# Rules-based bot engine
│   │   └── storage.ts           # Storage engine & demo records
│   ├── types/                   # TypeScript interfaces
│   ├── App.tsx                  # Main application controller
│   └── main.tsx
├── server.ts                    # Express entry point & API routes
├── .env.example                 # Environment configuration template
└── package.json
```

---

## 4. Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
The application will launch on **http://localhost:3000**.

---

## 5. WhatsApp Integration Setup

### Setting Up Provider A: WhatsApp Web Microservice
1. Navigate to `/services/whatsapp-web-service`:
   ```bash
   cd services/whatsapp-web-service
   npm install
   npm start
   ```
2. The service starts on port `3001` with LocalAuth session caching in `./.wwebjs_auth`.
3. In KasuwaDesk, navigate to **WhatsApp Connections**, select **Provider A**, and initiate QR code pairing.

### Setting Up Provider B: Meta WhatsApp Cloud API (Official)
1. Register a Meta Developer account at [developers.facebook.com](https://developers.facebook.com).
2. Create a Business App and enable **WhatsApp**.
3. Obtain your credentials and add them to `.env`:
   ```env
   META_WA_ACCESS_TOKEN="EAA..."
   META_WA_PHONE_NUMBER_ID="109876543210123"
   META_WA_BUSINESS_ACCOUNT_ID="123456789012345"
   META_WA_VERIFY_TOKEN="your-custom-verify-token"
   ```
4. Configure your Webhook URL in Meta App settings:
   `https://<your-domain>/api/whatsapp/webhook`
5. Subscribe to the `messages` event.

---

## 6. Demo Mode vs Production

- **Demo Mode:** By default, if `MONGODB_URI` is not provided, KasuwaDesk runs in Demo Mode with isolated sample records for a Lagos fashion boutique ("Kasuwa Wears & Lifestyle Lagos").
- You can reset the demo records at any time using the **Reset Demo Data** button in the top navigation bar.
- To connect production MongoDB, set `MONGODB_URI` in `.env`.
