import React, { useState } from 'react';
import {
  Clock,
  Edit,
  ExternalLink,
  MessageCircle,
  Plus,
  Search,
  ShoppingBag,
  User,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import {
  formatLagosDate,
  formatNaira,
  getWhatsAppClickToChatUrl,
} from '../../lib/formatters';
import { Customer, CustomerStatus, Order } from '../../types';

interface CustomersViewProps {
  customers: Customer[];
  orders: Order[];
  onCreateCustomer: (data: Partial<Customer>) => Promise<void>;
  onUpdateCustomer: (id: string, data: Partial<Customer>) => Promise<void>;
  onOpenConversationForCustomer?: (customerId: string) => void;
  onOpenNewOrderForCustomer?: (customerId: string) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  orders,
  onCreateCustomer,
  onUpdateCustomer,
  onOpenConversationForCustomer,
  onOpenNewOrderForCustomer,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomerHistory, setSelectedCustomerHistory] = useState<Customer | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formChannel, setFormChannel] = useState<'whatsapp' | 'phone_call' | 'sms'>('whatsapp');
  const [formStatus, setFormStatus] = useState<CustomerStatus>('lead');
  const [formNotes, setFormNotes] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.notes && c.notes.toLowerCase().includes(search.toLowerCase())) ||
      (c.deliveryAddress && c.deliveryAddress.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    return true;
  });

  const openCreateModal = () => {
    setEditingCustomer(null);
    setFormName('');
    setFormPhone('+234');
    setFormChannel('whatsapp');
    setFormStatus('lead');
    setFormNotes('');
    setFormAddress('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setFormName(c.name);
    setFormPhone(c.phone);
    setFormChannel(c.preferredChannel);
    setFormStatus(c.status);
    setFormNotes(c.notes);
    setFormAddress(c.deliveryAddress || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim()) {
      setFormError('Customer name is required');
      return;
    }
    if (!formPhone.trim() || formPhone.trim().length < 10) {
      setFormError('Valid phone number is required (e.g. +2348031234567 or 08031234567)');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<Customer> = {
        name: formName.trim(),
        phone: formPhone.trim(),
        preferredChannel: formChannel,
        status: formStatus,
        notes: formNotes.trim(),
        deliveryAddress: formAddress.trim(),
      };

      if (editingCustomer) {
        await onUpdateCustomer(editingCustomer.id, payload);
      } else {
        await onCreateCustomer(payload);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const customerOrders = selectedCustomerHistory
    ? orders.filter((o) => o.customerId === selectedCustomerHistory.id)
    : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Customer Directory & CRM
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Normalized Nigerian contacts, messaging preferences, order histories, and VIP tags.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Search & Status Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, phone (+234...), or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:bg-white focus:outline-emerald-500"
          />
        </div>

        {/* Status Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 text-xs">
          {['all', 'vip', 'active', 'lead', 'at_risk'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-medium capitalize whitespace-nowrap cursor-pointer transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'All Customers' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-base font-bold text-slate-700">No customers found</p>
            <p className="text-xs text-slate-400">
              No matching records for your current filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Customer Name & Phone</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Total Orders</th>
                  <th className="py-3 px-4">Total Spend (₦)</th>
                  <th className="py-3 px-4">Last Interaction</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{c.name}</span>
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {c.phone}
                          </span>
                        </div>
                        {c.notes && (
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {c.notes}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          c.status === 'vip'
                            ? 'bg-purple-100 text-purple-800'
                            : c.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.status === 'lead'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {c.totalOrdersCount} orders
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatNaira(c.totalSpend)}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {formatLagosDate(c.lastInteraction)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={getWhatsAppClickToChatUrl(c.phone)}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Chat on WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>

                        <button
                          onClick={() => setSelectedCustomerHistory(c)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="View Order History"
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Customer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Detail & Order History Drawer Modal */}
      {selectedCustomerHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  {selectedCustomerHistory.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {selectedCustomerHistory.phone}
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomerHistory(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Spent</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {formatNaira(selectedCustomerHistory.totalSpend)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Orders</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {selectedCustomerHistory.totalOrdersCount}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Delivery Address</span>
                <span className="text-slate-700">
                  {selectedCustomerHistory.deliveryAddress || 'No default address saved.'}
                </span>
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Order History ({customerOrders.length})
              </h4>
              {customerOrders.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No past orders recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {customerOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-slate-900 block">
                          {ord.reference}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {ord.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-slate-900 block">
                          {formatNaira(ord.totalAmount)}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 uppercase">
                          {ord.paymentStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <a
                href={getWhatsAppClickToChatUrl(selectedCustomerHistory.phone)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>

              {onOpenNewOrderForCustomer && (
                <button
                  onClick={() => {
                    const id = selectedCustomerHistory.id;
                    setSelectedCustomerHistory(null);
                    onOpenNewOrderForCustomer(id);
                  }}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
                >
                  Create New Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Customer Modal (Create / Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h2>
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

            <form onSubmit={handleSave} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Chioma Adebayo"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number * (Standard Nigerian format)
                </label>
                <input
                  type="text"
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="e.g. +2348031234567 or 08031234567"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-emerald-500 font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Automatically converted to international E.164 (+234...).
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Customer Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as CustomerStatus)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-emerald-500"
                  >
                    <option value="lead">Lead</option>
                    <option value="active">Active Customer</option>
                    <option value="vip">VIP Buyer</option>
                    <option value="at_risk">At Risk</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preferred Channel
                  </label>
                  <select
                    value={formChannel}
                    onChange={(e) => setFormChannel(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-emerald-500"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="phone_call">Phone Call</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Delivery Address in Nigeria
                </label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="e.g. 14 Admiralty Way, Lekki Phase 1, Lagos"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Internal Notes
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Preferences, fabric choices, budget notes..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-emerald-500 resize-none"
                />
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
                  {isSubmitting ? 'Saving...' : editingCustomer ? 'Update Customer' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
