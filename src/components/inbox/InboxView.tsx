import React, { useState } from 'react';
import {
  AlertTriangle,
  Bot,
  CheckCheck,
  ChevronDown,
  Clock,
  ExternalLink,
  MessageSquare,
  Package,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  User,
  UserCheck,
} from 'lucide-react';
import { formatLagosDate, formatNaira, getWhatsAppClickToChatUrl } from '../../lib/formatters';
import {
  BusinessSettings,
  Conversation,
  Customer,
  EnquiryStatus,
  Product,
} from '../../types';

interface InboxViewProps {
  conversations: Conversation[];
  products: Product[];
  customers: Customer[];
  settings: BusinessSettings | null;
  onSendMessage: (conversationId: string, text: string) => Promise<void>;
  onToggleAutomation: (conversationId: string) => Promise<void>;
  onUpdateStatus: (conversationId: string, status: EnquiryStatus) => Promise<void>;
  onSimulateCustomerMessage: (conversationId: string, text: string) => Promise<void>;
  onOpenNewCustomer: () => void;
  onOpenNewOrderForCustomer?: (customerId: string) => void;
}

export const InboxView: React.FC<InboxViewProps> = ({
  conversations,
  products,
  customers,
  settings,
  onSendMessage,
  onToggleAutomation,
  onUpdateStatus,
  onSimulateCustomerMessage,
  onOpenNewCustomer,
  onOpenNewOrderForCustomer,
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    conversations[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [simulatedCustomerText, setSimulatedCustomerText] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(false);

  const selectedConv = conversations.find((c) => c.id === selectedId) || conversations[0];
  const associatedCustomer = customers.find((c) => c.id === selectedConv?.customerId);

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customerPhone.includes(searchQuery) ||
      (c.lastMessageText && c.lastMessageText.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'unanswered')
      return c.enquiryStatus === 'new' || c.enquiryStatus === 'awaiting_response';
    return c.enquiryStatus === statusFilter;
  });

  const handleSend = async () => {
    if (!inputText.trim() || !selectedConv || isSending) return;
    setIsSending(true);
    try {
      await onSendMessage(selectedConv.id, inputText.trim());
      setInputText('');
    } finally {
      setIsSending(false);
    }
  };

  const handleSimulate = async () => {
    if (!simulatedCustomerText.trim() || !selectedConv) return;
    const text = simulatedCustomerText.trim();
    setSimulatedCustomerText('');
    await onSimulateCustomerMessage(selectedConv.id, text);
  };

  const quickReplies = [
    {
      title: '💳 Send Bank Details',
      text: `Hello ${selectedConv?.customerName || 'Ma/Sir'}! Here are our official payment details:\nBank: ${settings?.bankDetails.bankName || 'Access Bank'}\nAccount Number: ${settings?.bankDetails.accountNumber || '0123456789'}\nAccount Name: ${settings?.bankDetails.accountName || 'Kasuwa Lifestyle Enterprises'}\nKindly reply with your transfer receipt once done. Thank you!`,
    },
    {
      title: '🚚 Send Delivery Rates',
      text: `Hello! Our delivery rates are:\n• Lagos Mainland: ${formatNaira(settings?.deliveryRates.lagosMainland || 2500)}\n• Lagos Island: ${formatNaira(settings?.deliveryRates.lagosIsland || 3500)}\n• Abuja: ${formatNaira(settings?.deliveryRates.abujaFct || 4500)}\n• Interstate: ${formatNaira(settings?.deliveryRates.interstate || 5500)}\nDispatch is same-day within Lagos!`,
    },
    {
      title: '📦 Order Confirmation',
      text: `Thank you for choosing ${settings?.businessName || 'Kasuwa'}! Your order has been recorded and is currently being packed for dispatch. We will send you the rider's phone number as soon as they pick up.`,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col md:flex-row h-[calc(100vh-140px)] min-h-[580px]">
      {/* Left Pane: Conversation List */}
      <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col shrink-0 bg-slate-50/50">
        {/* Search & Filters */}
        <div className="p-3.5 border-b border-slate-200 bg-white space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search customer, phone, text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-100 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-emerald-500 border border-transparent focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Quick status tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200/70 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({conversations.length})
            </button>
            <button
              onClick={() => setStatusFilter('unanswered')}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap cursor-pointer ${
                statusFilter === 'unanswered'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-200/70 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Needs Reply
            </button>
            <button
              onClick={() => setStatusFilter('awaiting_payment')}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap cursor-pointer ${
                statusFilter === 'awaiting_payment'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200/70 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Payment Pending
            </button>
          </div>
        </div>

        {/* Conversation Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No conversations found.
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = selectedConv?.id === conv.id;
              const hasUnread = conv.unreadCount > 0;

              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={`p-3.5 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-emerald-50/80 border-l-4 border-emerald-600'
                      : 'hover:bg-slate-100/70 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className={`text-xs truncate ${hasUnread ? 'font-black text-slate-900' : 'font-semibold text-slate-800'}`}>
                        {conv.customerName}
                      </span>
                      {conv.isPausedAutomation && (
                        <span className="text-[9px] bg-slate-200 text-slate-700 px-1 py-0.5 rounded font-mono" title="Human agent active">
                          Human
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                      {formatLagosDate(conv.lastMessageTimestamp)}
                    </span>
                  </div>

                  <p className={`text-xs line-clamp-1 mb-1.5 ${hasUnread ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                    {conv.lastMessageText || 'No messages yet'}
                  </p>

                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        conv.enquiryStatus === 'new'
                          ? 'bg-emerald-100 text-emerald-800'
                          : conv.enquiryStatus === 'awaiting_response'
                          ? 'bg-amber-100 text-amber-800'
                          : conv.enquiryStatus === 'awaiting_payment'
                          ? 'bg-blue-100 text-blue-800'
                          : conv.enquiryStatus === 'converted'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {conv.enquiryStatus.replace('_', ' ')}
                    </span>

                    {hasUnread && (
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white font-extrabold text-[10px] flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Pane: Active Chat / Conversation Details */}
      {selectedConv ? (
        <div className="flex-1 flex flex-col bg-slate-50">
          {/* Conversation Header */}
          <div className="px-5 py-3.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  {selectedConv.customerName}
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  {selectedConv.customerPhone}
                </span>
                <a
                  href={getWhatsAppClickToChatUrl(selectedConv.customerPhone)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-600 hover:text-emerald-700 p-1 hover:bg-emerald-50 rounded"
                  title="Open direct in WhatsApp web/app"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {selectedConv.productNameOfInterest && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                  <Package className="w-3 h-3 text-emerald-600" />
                  <span>Product of interest: <strong className="text-slate-700">{selectedConv.productNameOfInterest}</strong></span>
                </div>
              )}
            </div>

            {/* Status & Automation Controls */}
            <div className="flex items-center gap-2">
              {/* Human Handoff / Bot Pause Switch */}
              <button
                onClick={() => onToggleAutomation(selectedConv.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  selectedConv.isPausedAutomation
                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
                title="Pause or resume automated bot replies for this customer"
              >
                {selectedConv.isPausedAutomation ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5 text-amber-700" />
                    <span>Human Mode (Bot Paused)</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Bot Active</span>
                  </>
                )}
              </button>

              {/* Status Dropdown */}
              <select
                value={selectedConv.enquiryStatus}
                onChange={(e) =>
                  onUpdateStatus(selectedConv.id, e.target.value as EnquiryStatus)
                }
                className="text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 cursor-pointer focus:outline-emerald-500"
              >
                <option value="new">New Enquiry</option>
                <option value="awaiting_response">Awaiting Response</option>
                <option value="interested">Interested</option>
                <option value="awaiting_payment">Awaiting Payment</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>

              {onOpenNewOrderForCustomer && (
                <button
                  onClick={() => onOpenNewOrderForCustomer(selectedConv.customerId)}
                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Create Order
                </button>
              )}
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {selectedConv.messages.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No recorded messages in this conversation yet. Send the first message below.
              </div>
            ) : (
              selectedConv.messages.map((msg) => {
                const isCustomer = msg.sender === 'customer';
                const isAutomated = msg.isAutomated;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isCustomer ? 'items-start' : 'items-end'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-md rounded-2xl px-4 py-2.5 text-xs shadow-2xs leading-relaxed whitespace-pre-wrap ${
                        isCustomer
                          ? 'bg-white text-slate-900 border border-slate-200/80 rounded-bl-xs'
                          : isAutomated
                          ? 'bg-emerald-700 text-white rounded-br-xs'
                          : 'bg-emerald-600 text-white rounded-br-xs'
                      }`}
                    >
                      {isAutomated && (
                        <div className="flex items-center gap-1 text-[10px] text-emerald-200 font-semibold mb-1 pb-1 border-b border-emerald-600">
                          <Bot className="w-3 h-3" />
                          <span>Automated Store Assistant</span>
                        </div>
                      )}
                      <p>{msg.text}</p>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px] text-slate-400">
                      <span>{formatLagosDate(msg.timestamp)}</span>
                      {!isCustomer && (
                        <CheckCheck
                          className={`w-3.5 h-3.5 ${
                            msg.status === 'read' ? 'text-emerald-600' : 'text-slate-400'
                          }`}
                        />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Reply Bar */}
          <div className="px-4 py-2 bg-slate-100/90 border-t border-slate-200 flex items-center justify-between gap-2 overflow-x-auto text-xs">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Quick:
              </span>
              {quickReplies.map((qr, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputText(qr.text)}
                  className="px-2 py-1 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-[11px] font-medium border border-slate-200 shadow-2xs whitespace-nowrap cursor-pointer transition-colors"
                >
                  {qr.title}
                </button>
              ))}
            </div>
          </div>

          {/* Message Composer */}
          <div className="p-3 bg-white border-t border-slate-200 space-y-2">
            <div className="flex items-end gap-2">
              <textarea
                rows={2}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type a message to customer or send payment details... (Enter to send)"
                className="flex-1 p-2.5 bg-slate-50 rounded-xl text-xs text-slate-900 border border-slate-200 focus:bg-white focus:outline-emerald-500 focus:border-emerald-500 transition-all resize-none"
              />

              <button
                onClick={handleSend}
                disabled={!inputText.trim() || isSending}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>

            {/* Test Simulation Helper for Nigerian SME demo */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Simulate Customer Inbound:</span>
              </div>
              <div className="flex items-center gap-2 flex-1 max-w-md ml-2">
                <input
                  type="text"
                  placeholder='e.g. "How much is delivery to Lagos Island?" or "send account"'
                  value={simulatedCustomerText}
                  onChange={(e) => setSimulatedCustomerText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSimulate();
                  }}
                  className="flex-1 px-2 py-1 bg-slate-100 text-slate-800 text-[11px] rounded-lg border border-slate-200"
                />
                <button
                  onClick={handleSimulate}
                  disabled={!simulatedCustomerText.trim()}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                >
                  Test Inbound
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400 text-sm">
          Select a conversation from the left to view messages.
        </div>
      )}
    </div>
  );
};
