import React, { useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  ExternalLink,
  Filter,
  MessageCircle,
  Package,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  Truck,
  User,
  X,
} from 'lucide-react';
import {
  formatLagosDate,
  formatNaira,
  generateWhatsAppOrderReceipt,
  getWhatsAppClickToChatUrl,
} from '../../lib/formatters';
import {
  BusinessSettings,
  Customer,
  FulfillmentStatus,
  Order,
  OrderItem,
  PaymentStatus,
  Product,
} from '../../types';

interface OrdersViewProps {
  orders: Order[];
  products: Product[];
  customers: Customer[];
  settings: BusinessSettings | null;
  onCreateOrder: (orderData: any) => Promise<void>;
  onUpdateOrder: (id: string, updates: Partial<Order>) => Promise<void>;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  products,
  customers,
  settings,
  onCreateOrder,
  onUpdateOrder,
}) => {
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [fulfillmentFilter, setFulfillmentFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [orderItems, setOrderItems] = useState<
    Array<{ productId: string; quantity: number }>
  >([{ productId: products[0]?.id || '', quantity: 1 }]);
  const [deliveryType, setDeliveryType] = useState<
    'mainland' | 'island' | 'abuja' | 'interstate' | 'pickup'
  >('island');
  const [customDeliveryFee, setCustomDeliveryFee] = useState<number>(
    settings?.deliveryRates.lagosIsland || 3500
  );
  const [discount, setDiscount] = useState<number>(0);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('Lagos');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('unpaid');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.reference.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search) ||
      o.items.some((i) => i.productName.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (paymentFilter !== 'all' && o.paymentStatus !== paymentFilter) return false;
    if (fulfillmentFilter !== 'all' && o.fulfillmentStatus !== fulfillmentFilter)
      return false;

    return true;
  });

  const openNewOrderModal = (preselectedCustId?: string) => {
    setSelectedCustomerId(preselectedCustId || customers[0]?.id || '');
    setOrderItems([{ productId: products[0]?.id || '', quantity: 1 }]);
    setDeliveryType('island');
    setCustomDeliveryFee(settings?.deliveryRates.lagosIsland || 3500);
    setDiscount(0);
    const cust = customers.find((c) => c.id === (preselectedCustId || customers[0]?.id));
    setDeliveryAddress(cust?.deliveryAddress || 'Lekki Phase 1, Lagos');
    setDeliveryCity('Lagos');
    setOrderNotes('');
    setPaymentStatus('unpaid');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDeliveryPresetChange = (type: string) => {
    setDeliveryType(type as any);
    if (!settings) return;
    if (type === 'mainland') setCustomDeliveryFee(settings.deliveryRates.lagosMainland);
    else if (type === 'island') setCustomDeliveryFee(settings.deliveryRates.lagosIsland);
    else if (type === 'abuja') setCustomDeliveryFee(settings.deliveryRates.abujaFct);
    else if (type === 'interstate') setCustomDeliveryFee(settings.deliveryRates.interstate);
    else if (type === 'pickup') setCustomDeliveryFee(0);
  };

  const handleAddItem = () => {
    setOrderItems([...orderItems, { productId: products[0]?.id || '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (orderItems.length === 1) return;
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, val: any) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], [field]: val };
    setOrderItems(updated);
  };

  // Live estimate for preview
  const estimatedSubtotal = orderItems.reduce((sum, item) => {
    const p = products.find((prod) => prod.id === item.productId);
    return sum + (p ? p.price * (item.quantity || 1) : 0);
  }, 0);
  const estimatedTotal = Math.max(0, estimatedSubtotal + customDeliveryFee - discount);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedCustomerId) {
      setFormError('Please select a customer');
      return;
    }
    if (!deliveryAddress.trim()) {
      setFormError('Delivery address is required');
      return;
    }

    // Verify stock availability
    for (const item of orderItems) {
      const p = products.find((prod) => prod.id === item.productId);
      if (!p) {
        setFormError('Invalid product selected');
        return;
      }
      if (p.stockQuantity < item.quantity) {
        setFormError(
          `Insufficient stock for "${p.name}". Available: ${p.stockQuantity}, Requested: ${item.quantity}. Please update quantity or restock.`
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onCreateOrder({
        customerId: selectedCustomerId,
        items: orderItems,
        deliveryFee: customDeliveryFee,
        discount,
        deliveryAddress: deliveryAddress.trim(),
        deliveryCity,
        notes: orderNotes.trim(),
        paymentStatus,
        fulfillmentStatus: 'processing',
      });
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyReceipt = (order: Order) => {
    const text = generateWhatsAppOrderReceipt({
      reference: order.reference,
      customerName: order.customerName,
      items: order.items,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      discount: order.discount,
      totalAmount: order.totalAmount,
      deliveryAddress: order.deliveryAddress,
      paymentStatus: order.paymentStatus,
      bankDetails: settings?.bankDetails,
    });

    navigator.clipboard.writeText(text);
    setCopiedOrderId(order.id);
    setTimeout(() => setCopiedOrderId(null), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Order Management & Invoicing
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track customer payments in Naira (₦), delivery status, and generate WhatsApp receipts.
          </p>
        </div>

        <button
          onClick={() => openNewOrderModal()}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Order</span>
        </button>
      </div>

      {/* Search & Status Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search order KD-..., customer, phone, item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:bg-white focus:outline-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Payment Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 cursor-pointer focus:outline-emerald-500"
          >
            <option value="all">All Payment Statuses</option>
            <option value="unpaid">Unpaid / Awaiting Transfer</option>
            <option value="paid">Paid & Verified</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="refunded">Refunded</option>
          </select>

          {/* Fulfillment Filter */}
          <select
            value={fulfillmentFilter}
            onChange={(e) => setFulfillmentFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 cursor-pointer focus:outline-emerald-500"
          >
            <option value="all">All Fulfillment Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing / Packing</option>
            <option value="ready_for_pickup">Ready for Pickup</option>
            <option value="dispatched">Dispatched with Rider</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List / Cards */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-2">
          <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-base font-bold text-slate-700">No orders found</p>
          <p className="text-xs text-slate-400">
            No orders match your filter. Click "Record New Order" to start tracking sales.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((ord) => {
            const isPaid = ord.paymentStatus === 'paid';
            const isDelivered = ord.fulfillmentStatus === 'delivered';

            return (
              <div
                key={ord.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-2xs p-5 transition-all space-y-4"
              >
                {/* Header: Ref, Date, Customer & Amounts */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {ord.reference}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatLagosDate(ord.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-sm text-slate-800">
                        {ord.customerName}
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        {ord.customerPhone}
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="font-extrabold text-xl text-slate-900">
                      {formatNaira(ord.totalAmount)}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Subtotal: {formatNaira(ord.subtotal)} | Delivery: {formatNaira(ord.deliveryFee)}
                      {ord.discount > 0 && ` | Disc: -${formatNaira(ord.discount)}`}
                    </div>
                  </div>
                </div>

                {/* Items & Delivery Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-400 uppercase text-[10px] tracking-wider mb-1.5">
                      Ordered Products
                    </h4>
                    <div className="space-y-1">
                      {ord.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50"
                        >
                          <span className="font-medium text-slate-800">
                            {item.productName} × {item.quantity}
                          </span>
                          <span className="font-bold text-slate-900">
                            {formatNaira(item.subtotal)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-400 uppercase text-[10px] tracking-wider mb-1.5">
                      Delivery Details
                    </h4>
                    <div className="p-2.5 rounded-lg bg-slate-50 space-y-1">
                      <p className="text-slate-800 font-medium">{ord.deliveryAddress}</p>
                      <p className="text-slate-500 text-[11px]">Destination: {ord.deliveryCity}</p>
                      {ord.notes && (
                        <p className="text-slate-500 text-[11px] italic">Note: {ord.notes}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Switchers & Quick Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Payment status picker */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-slate-500">Payment:</span>
                      <select
                        value={ord.paymentStatus}
                        onChange={(e) =>
                          onUpdateOrder(ord.id, { paymentStatus: e.target.value as PaymentStatus })
                        }
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border capitalize cursor-pointer ${
                          isPaid
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        <option value="unpaid">Unpaid (Awaiting Transfer)</option>
                        <option value="paid">Paid & Verified</option>
                        <option value="partially_paid">Partially Paid</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>

                    {/* Fulfillment status picker */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-slate-500">Fulfillment:</span>
                      <select
                        value={ord.fulfillmentStatus}
                        onChange={(e) =>
                          onUpdateOrder(ord.id, {
                            fulfillmentStatus: e.target.value as FulfillmentStatus,
                          })
                        }
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-800 capitalize cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing / Packing</option>
                        <option value="ready_for_pickup">Ready for Pickup</option>
                        <option value="dispatched">Dispatched with Rider</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled (Restore Stock)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Copy WhatsApp Receipt */}
                    <button
                      onClick={() => copyReceipt(ord)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      title="Copy formatted invoice to send on WhatsApp"
                    >
                      {copiedOrderId === ord.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied WhatsApp Receipt!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-600" />
                          <span>Copy WhatsApp Receipt</span>
                        </>
                      )}
                    </button>

                    {/* Chat with Customer */}
                    <a
                      href={getWhatsAppClickToChatUrl(
                        ord.customerPhone,
                        `Hello ${ord.customerName}! Concerning your order ${ord.reference} (${formatNaira(ord.totalAmount)})...`
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Customer</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Record New Customer Order</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitOrder} className="space-y-4 mt-4">
              {/* Customer Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer *
                </label>
                <select
                  required
                  value={selectedCustomerId}
                  onChange={(e) => {
                    setSelectedCustomerId(e.target.value);
                    const c = customers.find((cust) => cust.id === e.target.value);
                    if (c?.deliveryAddress) setDeliveryAddress(c.deliveryAddress);
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-emerald-500"
                >
                  <option value="">Select a Customer...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone}) - {c.status.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Order Items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">
                    Product Line Items *
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                {orderItems.map((item, index) => {
                  const prod = products.find((p) => p.id === item.productId);

                  return (
                    <div
                      key={index}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2"
                    >
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                        className="flex-1 p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} - {formatNaira(p.price)} (Stock: {p.stockQuantity})
                          </option>
                        ))}
                      </select>

                      <div className="w-20">
                        <input
                          type="number"
                          min="1"
                          max={prod?.stockQuantity || 99}
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, 'quantity', parseInt(e.target.value, 10) || 1)
                          }
                          className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs text-center"
                          placeholder="Qty"
                        />
                      </div>

                      {orderItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Delivery Fee Presets (Nigeria) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Delivery Destination & Fee *
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleDeliveryPresetChange('island')}
                    className={`p-2 rounded-xl border text-left cursor-pointer ${
                      deliveryType === 'island'
                        ? 'bg-emerald-50 border-emerald-500 font-bold text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>Lagos Island</span>
                    <span className="block text-[11px] opacity-75">
                      {formatNaira(settings?.deliveryRates.lagosIsland || 3500)}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeliveryPresetChange('mainland')}
                    className={`p-2 rounded-xl border text-left cursor-pointer ${
                      deliveryType === 'mainland'
                        ? 'bg-emerald-50 border-emerald-500 font-bold text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>Lagos Mainland</span>
                    <span className="block text-[11px] opacity-75">
                      {formatNaira(settings?.deliveryRates.lagosMainland || 2500)}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeliveryPresetChange('abuja')}
                    className={`p-2 rounded-xl border text-left cursor-pointer ${
                      deliveryType === 'abuja'
                        ? 'bg-emerald-50 border-emerald-500 font-bold text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>Abuja (FCT)</span>
                    <span className="block text-[11px] opacity-75">
                      {formatNaira(settings?.deliveryRates.abujaFct || 4500)}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeliveryPresetChange('interstate')}
                    className={`p-2 rounded-xl border text-left cursor-pointer ${
                      deliveryType === 'interstate'
                        ? 'bg-emerald-50 border-emerald-500 font-bold text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>Interstate Waybill</span>
                    <span className="block text-[11px] opacity-75">
                      {formatNaira(settings?.deliveryRates.interstate || 5500)}
                    </span>
                  </button>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Delivery Address *
                </label>
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="e.g. Block 4, Flat 2, Admiralty Towers, Lekki Phase 1"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-emerald-500"
                />
              </div>

              {/* Payment Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-emerald-500"
                  >
                    <option value="unpaid">Unpaid (Awaiting Transfer)</option>
                    <option value="paid">Paid (Receipt Confirmed)</option>
                    <option value="partially_paid">Partially Paid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Discount (₦ NGN)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-emerald-500"
                  />
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-3.5 bg-slate-100 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Subtotal:</span>
                  <span className="font-semibold">{formatNaira(estimatedSubtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Fee:</span>
                  <span className="font-semibold">{formatNaira(customDeliveryFee)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount:</span>
                    <span>-{formatNaira(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-1 border-t border-slate-200">
                  <span>Total Amount (NGN):</span>
                  <span className="text-emerald-800">{formatNaira(estimatedTotal)}</span>
                </div>
                <p className="text-[10px] text-slate-400 italic text-right">
                  * Final total is authoritatively verified and calculated on the server.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all"
                >
                  {isSubmitting ? 'Recording Order...' : 'Confirm & Save Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
