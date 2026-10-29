import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { CustomersView } from './components/customers/CustomersView';
import { OverviewView } from './components/dashboard/OverviewView';
import { FollowUpsView } from './components/followups/FollowUpsView';
import { InboxView } from './components/inbox/InboxView';
import { MobileNav } from './components/layout/MobileNav';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { OrdersView } from './components/orders/OrdersView';
import { ProductsView } from './components/products/ProductsView';
import { SettingsView } from './components/settings/SettingsView';
import { StorefrontView } from './components/storefront/StorefrontView';
import { WhatsAppConnectionsView } from './components/whatsapp/WhatsAppConnectionsView';
import { api } from './lib/api';
import {
  BusinessSettings,
  Conversation,
  Customer,
  DashboardMetrics,
  Enquiry,
  EnquiryStatus,
  FollowUp,
  MessagingProviderType,
  Order,
  Product,
  WhatsAppConnectionInfo,
} from './types';

export default function App() {
  // View mode: 'storefront' (public website visitors) vs 'admin' (website owner dashboard)
  const [viewMode, setViewMode] = useState<'storefront' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      return window.location.hash === '#admin' || window.location.search.includes('admin=true')
        ? 'admin'
        : 'storefront';
    }
    return 'storefront';
  });

  const [activeTab, setActiveTab] = useState<string>('overview');

  // Core Data State
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [connection, setConnection] = useState<WhatsAppConnectionInfo | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadAllData = async () => {
    try {
      setError(null);
      const [
        metricsData,
        productsData,
        customersData,
        conversationsData,
        enquiriesData,
        ordersData,
        followUpsData,
        settingsData,
        connectionData,
      ] = await Promise.all([
        api.getMetrics(),
        api.getProducts(),
        api.getCustomers(),
        api.getConversations(),
        api.getEnquiries(),
        api.getOrders(),
        api.getFollowUps(),
        api.getSettings(),
        api.getConnectionStatus(),
      ]);

      setMetrics(metricsData);
      setProducts(productsData);
      setCustomers(customersData);
      setConversations(conversationsData);
      setEnquiries(enquiriesData);
      setOrders(ordersData);
      setFollowUps(followUpsData);
      setSettings(settingsData);
      setConnection(connectionData);
    } catch (err: any) {
      console.error('Failed to load application data:', err);
      setError(err.message || 'Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Demo Reset Handler
  const handleResetDemo = async () => {
    if (!confirm('Reset all demo products, orders, and messages to initial state?')) return;
    setIsResetting(true);
    try {
      await api.resetDemoData();
      await loadAllData();
      showToast('Demo data reset to original state.');
    } catch (err: any) {
      alert(`Error resetting demo data: ${err.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  // Product Handlers
  const handleCreateProduct = async (data: Partial<Product>) => {
    await api.createProduct(data);
    await loadAllData();
    showToast('Product added to catalogue!');
  };

  const handleUpdateProduct = async (id: string, data: Partial<Product>) => {
    await api.updateProduct(id, data);
    await loadAllData();
    showToast('Product updated!');
  };

  const handleDeleteProduct = async (id: string) => {
    await api.deleteProduct(id);
    await loadAllData();
    showToast('Product deleted.');
  };

  // Customer Handlers
  const handleCreateCustomer = async (data: Partial<Customer>) => {
    await api.createCustomer(data);
    await loadAllData();
    showToast('Customer created successfully!');
  };

  const handleUpdateCustomer = async (id: string, data: Partial<Customer>) => {
    await api.updateCustomer(id, data);
    await loadAllData();
    showToast('Customer record updated!');
  };

  // Inbox Handlers
  const handleSendMessage = async (conversationId: string, text: string) => {
    await api.sendMessage(conversationId, text);
    const updatedConvs = await api.getConversations();
    setConversations(updatedConvs);
    const updatedMetrics = await api.getMetrics();
    setMetrics(updatedMetrics);
    showToast('Message sent via WhatsApp adapter.');
  };

  const handleToggleAutomation = async (conversationId: string) => {
    await api.toggleAutomation(conversationId);
    const updatedConvs = await api.getConversations();
    setConversations(updatedConvs);
  };

  const handleUpdateConversationStatus = async (
    conversationId: string,
    enquiryStatus: EnquiryStatus
  ) => {
    await api.updateConversationStatus(conversationId, enquiryStatus);
    const updatedConvs = await api.getConversations();
    setConversations(updatedConvs);
    const updatedMetrics = await api.getMetrics();
    setMetrics(updatedMetrics);
    showToast(`Status updated to ${enquiryStatus.replace('_', ' ')}`);
  };

  const handleSimulateCustomerMessage = async (conversationId: string, text: string) => {
    await api.simulateCustomerMessage(conversationId, text);
    const updatedConvs = await api.getConversations();
    setConversations(updatedConvs);
    const updatedMetrics = await api.getMetrics();
    setMetrics(updatedMetrics);
    showToast('Inbound customer message simulated.');
  };

  // Order Handlers
  const handleCreateOrder = async (orderData: any) => {
    await api.createOrder(orderData);
    await loadAllData();
    showToast('Order created and inventory updated!');
  };

  const handleUpdateOrder = async (id: string, updates: Partial<Order>) => {
    await api.updateOrder(id, updates);
    await loadAllData();
    showToast('Order status updated!');
  };

  // Follow-up Handlers
  const handleCreateFollowUp = async (data: any) => {
    await api.createFollowUp(data);
    await loadAllData();
    showToast('Follow-up scheduled!');
  };

  const handleUpdateFollowUp = async (id: string, updates: Partial<FollowUp>) => {
    await api.updateFollowUp(id, updates);
    await loadAllData();
    showToast('Follow-up updated!');
  };

  const handleDeleteFollowUp = async (id: string) => {
    await api.deleteFollowUp(id);
    await loadAllData();
    showToast('Follow-up removed.');
  };

  // WhatsApp Handlers
  const handleConnectWhatsApp = async (provider: MessagingProviderType) => {
    const res = await api.connectWhatsApp(provider);
    const status = await api.getConnectionStatus();
    setConnection(status);
    showToast(res.message || 'WhatsApp connection request submitted.');
    return res;
  };

  const handleDisconnectWhatsApp = async () => {
    await api.disconnectWhatsApp();
    const status = await api.getConnectionStatus();
    setConnection(status);
    showToast('WhatsApp session disconnected.');
  };

  const handleSendTestMessage = async (phone: string, text: string) => {
    return api.sendTestMessage(phone, text);
  };

  // Settings Handlers
  const handleUpdateSettings = async (newSettings: Partial<BusinessSettings>) => {
    const updated = await api.updateSettings(newSettings);
    setSettings(updated);
    showToast('Settings saved!');
  };

  return (
    <>
      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#261C1A] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-[#4A3430] animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle className="w-4 h-4 text-[#D97757]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {viewMode === 'storefront' ? (
        /* ================= Public Landing Page for Zhat Beauty ================= */
        <StorefrontView
          products={products}
          settings={settings}
          onEnterAdminDashboard={() => {
            window.location.hash = '#admin';
            setViewMode('admin');
          }}
          onRefreshData={loadAllData}
          showToast={showToast}
        />
      ) : (
        /* ================= Website Owner Admin Dashboard (KasuwaDesk) ================= */
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col antialiased">
          {/* Top Navbar with Return to Storefront */}
          <Navbar
            settings={settings}
            connection={connection}
            onResetDemo={handleResetDemo}
            onNavigate={setActiveTab}
            onReturnToStorefront={() => {
              window.location.hash = '';
              setViewMode('storefront');
            }}
            isResetting={isResetting}
          />

          <div className="flex-1 flex max-w-7xl w-full mx-auto">
            {/* Desktop Sidebar */}
            <Sidebar
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              metrics={metrics}
            />

            {/* Main Content Area */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
                  <RefreshCw className="w-8 h-8 text-[#C86D51] animate-spin" />
                  <p className="text-sm font-semibold text-slate-600">
                    Loading Zhat Beauty dashboard...
                  </p>
                </div>
              ) : error ? (
                <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-3">
                  <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
                  <p className="font-bold text-rose-900 text-base">{error}</p>
                  <button
                    onClick={loadAllData}
                    className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
                  >
                    Retry Connection
                  </button>
                </div>
              ) : (
                <>
                  {activeTab === 'overview' && (
                    <OverviewView
                      metrics={metrics}
                      conversations={conversations}
                      enquiries={enquiries}
                      orders={orders}
                      followUps={followUps}
                      products={products}
                      customers={customers}
                      onNavigate={setActiveTab}
                      onOpenNewOrder={() => setActiveTab('orders')}
                      onOpenNewProduct={() => setActiveTab('products')}
                      onOpenNewFollowUp={() => setActiveTab('followups')}
                      onOpenNewCustomer={() => setActiveTab('customers')}
                    />
                  )}

                  {activeTab === 'inbox' && (
                    <InboxView
                      conversations={conversations}
                      products={products}
                      customers={customers}
                      settings={settings}
                      onSendMessage={handleSendMessage}
                      onToggleAutomation={handleToggleAutomation}
                      onUpdateStatus={handleUpdateConversationStatus}
                      onSimulateCustomerMessage={handleSimulateCustomerMessage}
                      onOpenNewCustomer={() => setActiveTab('customers')}
                      onOpenNewOrderForCustomer={(custId) => setActiveTab('orders')}
                    />
                  )}

                  {activeTab === 'products' && (
                    <ProductsView
                      products={products}
                      settings={settings}
                      onCreateProduct={handleCreateProduct}
                      onUpdateProduct={handleUpdateProduct}
                      onDeleteProduct={handleDeleteProduct}
                    />
                  )}

                  {activeTab === 'customers' && (
                    <CustomersView
                      customers={customers}
                      orders={orders}
                      onCreateCustomer={handleCreateCustomer}
                      onUpdateCustomer={handleUpdateCustomer}
                      onOpenConversationForCustomer={() => setActiveTab('inbox')}
                      onOpenNewOrderForCustomer={() => setActiveTab('orders')}
                    />
                  )}

                  {activeTab === 'orders' && (
                    <OrdersView
                      orders={orders}
                      products={products}
                      customers={customers}
                      settings={settings}
                      onCreateOrder={handleCreateOrder}
                      onUpdateOrder={handleUpdateOrder}
                    />
                  )}

                  {activeTab === 'followups' && (
                    <FollowUpsView
                      followUps={followUps}
                      customers={customers}
                      onCreateFollowUp={handleCreateFollowUp}
                      onUpdateFollowUp={handleUpdateFollowUp}
                      onDeleteFollowUp={handleDeleteFollowUp}
                    />
                  )}

                  {activeTab === 'whatsapp' && (
                    <WhatsAppConnectionsView
                      connection={connection}
                      onConnect={handleConnectWhatsApp}
                      onDisconnect={handleDisconnectWhatsApp}
                      onSendTestMessage={handleSendTestMessage}
                    />
                  )}

                  {activeTab === 'settings' && (
                    <SettingsView
                      settings={settings}
                      onUpdateSettings={handleUpdateSettings}
                      onResetDemo={handleResetDemo}
                      isResetting={isResetting}
                    />
                  )}
                </>
              )}
            </main>
          </div>

          {/* Mobile Bottom Navigation */}
          <MobileNav
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            metrics={metrics}
          />
        </div>
      )}
    </>
  );
}
