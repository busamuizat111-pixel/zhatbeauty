import {
  BusinessSettings,
  Conversation,
  Customer,
  DashboardMetrics,
  Enquiry,
  FollowUp,
  Order,
  Product,
  WhatsAppConnectionInfo,
} from '../types';

export const api = {
  // Settings
  async getSettings(): Promise<BusinessSettings> {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Failed to load settings');
    return res.json();
  },

  async updateSettings(settings: Partial<BusinessSettings>): Promise<BusinessSettings> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  // Dashboard
  async getMetrics(): Promise<DashboardMetrics> {
    const res = await fetch('/api/dashboard/metrics');
    if (!res.ok) throw new Error('Failed to load metrics');
    return res.json();
  },

  // Products
  async getProducts(): Promise<Product[]> {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error('Failed to load products');
    return res.json();
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error?.message || 'Failed to create product');
    return result;
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error?.message || 'Failed to update product');
    return result;
  },

  async deleteProduct(id: string): Promise<void> {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete product');
  },

  // Customers
  async getCustomers(): Promise<Customer[]> {
    const res = await fetch('/api/customers');
    if (!res.ok) throw new Error('Failed to load customers');
    return res.json();
  },

  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to create customer');
    return result;
  },

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    const res = await fetch(`/api/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update customer');
    return result;
  },

  // Conversations & Inbox
  async getConversations(): Promise<Conversation[]> {
    const res = await fetch('/api/inbox/conversations');
    if (!res.ok) throw new Error('Failed to load conversations');
    return res.json();
  },

  async sendMessage(conversationId: string, text: string): Promise<any> {
    const res = await fetch(`/api/inbox/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to send message');
    return result;
  },

  async toggleAutomation(conversationId: string): Promise<Conversation> {
    const res = await fetch(`/api/inbox/conversations/${conversationId}/toggle-automation`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to toggle automation');
    return res.json();
  },

  async updateConversationStatus(conversationId: string, enquiryStatus: string): Promise<Conversation> {
    const res = await fetch(`/api/inbox/conversations/${conversationId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enquiryStatus }),
    });
    if (!res.ok) throw new Error('Failed to update conversation status');
    return res.json();
  },

  async simulateCustomerMessage(conversationId: string, text: string): Promise<any> {
    const res = await fetch('/api/inbox/simulate-customer-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, text }),
    });
    if (!res.ok) throw new Error('Failed to simulate message');
    return res.json();
  },

  // Enquiries
  async getEnquiries(): Promise<Enquiry[]> {
    const res = await fetch('/api/enquiries');
    if (!res.ok) throw new Error('Failed to load enquiries');
    return res.json();
  },

  async createEnquiry(data: Partial<Enquiry>): Promise<Enquiry> {
    const res = await fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create enquiry');
    return res.json();
  },

  async updateEnquiry(id: string, data: Partial<Enquiry>): Promise<Enquiry> {
    const res = await fetch(`/api/enquiries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update enquiry');
    return res.json();
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    const res = await fetch('/api/orders');
    if (!res.ok) throw new Error('Failed to load orders');
    return res.json();
  },

  async createOrder(data: any): Promise<Order> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      const errMsg = typeof result.error === 'string' ? result.error : 'Failed to create order';
      throw new Error(errMsg);
    }
    return result;
  },

  async updateOrder(id: string, data: Partial<Order>): Promise<Order> {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update order');
    return res.json();
  },

  // Follow-ups
  async getFollowUps(): Promise<FollowUp[]> {
    const res = await fetch('/api/followups');
    if (!res.ok) throw new Error('Failed to load follow-ups');
    return res.json();
  },

  async createFollowUp(data: any): Promise<FollowUp> {
    const res = await fetch('/api/followups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error?.message || 'Failed to create follow-up');
    return result;
  },

  async updateFollowUp(id: string, data: Partial<FollowUp>): Promise<FollowUp> {
    const res = await fetch(`/api/followups/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update follow-up');
    return res.json();
  },

  async deleteFollowUp(id: string): Promise<void> {
    const res = await fetch(`/api/followups/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete follow-up');
  },

  // WhatsApp
  async getConnectionStatus(): Promise<WhatsAppConnectionInfo> {
    const res = await fetch('/api/whatsapp/status');
    if (!res.ok) throw new Error('Failed to get WhatsApp status');
    return res.json();
  },

  async connectWhatsApp(provider: 'whatsapp_web' | 'meta_cloud'): Promise<any> {
    const res = await fetch('/api/whatsapp/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider }),
    });
    return res.json();
  },

  async disconnectWhatsApp(): Promise<any> {
    const res = await fetch('/api/whatsapp/disconnect', { method: 'POST' });
    return res.json();
  },

  async sendTestMessage(phone: string, text: string): Promise<any> {
    const res = await fetch('/api/whatsapp/test-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, text }),
    });
    return res.json();
  },

  // Demo Reset
  async resetDemoData(): Promise<any> {
    const res = await fetch('/api/demo/reset', { method: 'POST' });
    return res.json();
  },
};
