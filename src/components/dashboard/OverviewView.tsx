import React from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Clock,
  CreditCard,
  MessageSquare,
  Package,
  Plus,
  ShoppingBag,
  TrendingUp,
  Truck,
  Users,
} from 'lucide-react';
import { formatLagosDate, formatNaira } from '../../lib/formatters';
import {
  Conversation,
  Customer,
  DashboardMetrics,
  Enquiry,
  FollowUp,
  Order,
  Product,
} from '../../types';

interface OverviewViewProps {
  metrics: DashboardMetrics | null;
  conversations: Conversation[];
  enquiries: Enquiry[];
  orders: Order[];
  followUps: FollowUp[];
  products: Product[];
  customers: Customer[];
  onNavigate: (tab: string) => void;
  onOpenNewOrder: () => void;
  onOpenNewProduct: () => void;
  onOpenNewFollowUp: () => void;
  onOpenNewCustomer: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  metrics,
  conversations,
  enquiries,
  orders,
  followUps,
  products,
  customers,
  onNavigate,
  onOpenNewOrder,
  onOpenNewProduct,
  onOpenNewFollowUp,
  onOpenNewCustomer,
}) => {
  const pendingOrders = orders.filter(
    (o) => o.paymentStatus === 'unpaid' || o.fulfillmentStatus === 'processing'
  );
  const urgentFollowUps = followUps.filter((f) => f.status === 'pending');
  const unansweredEnquiries = enquiries.filter(
    (e) => e.status === 'new' || e.status === 'awaiting_response'
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Business Overview
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time sales, WhatsApp enquiries, and order fulfillment in Lagos & Nigeria.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenNewOrder}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Order</span>
          </button>
          <button
            onClick={onOpenNewProduct}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-medium transition-all cursor-pointer"
          >
            <Package className="w-4 h-4 text-slate-500" />
            <span>Add Product</span>
          </button>
          <button
            onClick={onOpenNewFollowUp}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-medium transition-all cursor-pointer"
          >
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Schedule Follow-up</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Answering Core Business Questions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Recorded Revenue */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-500">Recorded Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-extrabold text-2xl text-slate-900">
            {formatNaira(metrics?.totalRevenue || 0)}
          </div>
          <p className="text-[11px] text-slate-500">
            Calculated from paid orders ({orders.filter((o) => o.paymentStatus === 'paid').length} completed)
          </p>
        </div>

        {/* Metric 2: Unanswered Enquiries */}
        <div
          onClick={() => onNavigate('inbox')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2 cursor-pointer hover:border-emerald-300 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-500">Unanswered Enquiries</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="font-extrabold text-2xl text-slate-900 flex items-baseline gap-2">
            <span>{metrics?.unansweredEnquiries || 0}</span>
            <span className="text-xs font-normal text-slate-400">
              of {enquiries.length} total
            </span>
          </div>
          <p className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
            <span>Needs immediate reply</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </div>

        {/* Metric 3: Follow-ups Due Today */}
        <div
          onClick={() => onNavigate('followups')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2 cursor-pointer hover:border-emerald-300 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-500">Follow-ups Due Today</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="font-extrabold text-2xl text-slate-900">
            {metrics?.followUpsDueToday || 0}
          </div>
          <p className="text-[11px] text-slate-500">
            Pending customer reminders & promises
          </p>
        </div>

        {/* Metric 4: Orders Awaiting Payment */}
        <div
          onClick={() => onNavigate('orders')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2 cursor-pointer hover:border-emerald-300 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-500">Awaiting Payment</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="font-extrabold text-2xl text-slate-900">
            {metrics?.ordersAwaitingPayment || 0}
          </div>
          <p className="text-[11px] text-slate-500">
            Awaiting customer bank transfer alert
          </p>
        </div>
      </div>

      {/* Two-Column Working Section: Action Items & Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Attention Needed (Unanswered Enquiries & Follow-ups) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section: Enquiries Requiring Attention */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <h2 className="font-bold text-slate-900 text-base">
                  Enquiries Requiring Attention
                </h2>
              </div>
              <button
                onClick={() => onNavigate('inbox')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
              >
                Open Inbox &rarr;
              </button>
            </div>

            {unansweredEnquiries.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-100">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">All caught up!</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  No unanswered enquiries pending staff response.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {unansweredEnquiries.map((enq) => (
                  <div
                    key={enq.id}
                    onClick={() => onNavigate('inbox')}
                    className="py-3 flex items-start justify-between gap-3 hover:bg-slate-50/80 p-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {enq.customerName}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {enq.customerPhone}
                        </span>
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full capitalize">
                          {enq.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1 italic">
                        "{enq.initialMessage}"
                      </p>
                      {enq.productName && (
                        <p className="text-[11px] text-emerald-700 font-medium">
                          Product: {enq.productName}
                        </p>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">
                      {formatLagosDate(enq.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Follow-ups Today */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-600" />
                <h2 className="font-bold text-slate-900 text-base">
                  Follow-ups Scheduled
                </h2>
              </div>
              <button
                onClick={() => onNavigate('followups')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
              >
                View All ({urgentFollowUps.length}) &rarr;
              </button>
            </div>

            {urgentFollowUps.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500">No pending follow-ups right now.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {urgentFollowUps.slice(0, 3).map((f) => (
                  <div
                    key={f.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{f.customerName}</span>
                        <span className="text-[10px] text-slate-500">{f.customerPhone}</span>
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            f.priority === 'high'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {f.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 mt-1 leading-snug">{f.reason}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-semibold text-slate-800 block">
                        {f.dueDate}
                      </span>
                      <span className="text-[10px] text-slate-500">{f.dueTime} WAT</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Pipeline & Product Stock Status */}
        <div className="lg:col-span-5 space-y-6">
          {/* Order Fulfillment Status */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <h2 className="font-bold text-slate-900 text-base">Active Orders</h2>
              </div>
              <button
                onClick={() => onNavigate('orders')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
              >
                View Orders &rarr;
              </button>
            </div>

            {pendingOrders.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500">No pending orders processing.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-extrabold text-slate-900">
                        {ord.reference}
                      </span>
                      <span className="font-bold text-xs text-emerald-800">
                        {formatNaira(ord.totalAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 truncate max-w-[150px]">
                        {ord.customerName}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          ord.paymentStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        Payment: {ord.paymentStatus}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Truck className="w-3 h-3 text-slate-400" />
                      <span className="capitalize">{ord.fulfillmentStatus.replace('_', ' ')}</span>
                      <span>·</span>
                      <span className="truncate">{ord.deliveryAddress}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Inventory Quick Watch */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-slate-600" />
                <h2 className="font-bold text-slate-900 text-base">Inventory Watch</h2>
              </div>
              <button
                onClick={() => onNavigate('products')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
              >
                Catalogue ({products.length}) &rarr;
              </button>
            </div>

            <div className="space-y-2.5">
              {products.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="truncate max-w-[180px]">
                    <p className="text-xs font-bold text-slate-900 truncate">{p.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{p.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-900">
                      {formatNaira(p.price)}
                    </p>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        p.stockQuantity === 0
                          ? 'bg-rose-100 text-rose-800'
                          : p.stockQuantity <= 3
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {p.stockQuantity === 0
                        ? 'Out of stock'
                        : `${p.stockQuantity} in stock`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
