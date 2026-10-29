import React, { useState } from 'react';
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageCircle,
  Plus,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { formatLagosDateOnly, getWhatsAppClickToChatUrl } from '../../lib/formatters';
import { Customer, FollowUp, FollowUpPriority } from '../../types';

interface FollowUpsViewProps {
  followUps: FollowUp[];
  customers: Customer[];
  onCreateFollowUp: (data: any) => Promise<void>;
  onUpdateFollowUp: (id: string, updates: Partial<FollowUp>) => Promise<void>;
  onDeleteFollowUp: (id: string) => Promise<void>;
}

export const FollowUpsView: React.FC<FollowUpsViewProps> = ({
  followUps,
  customers,
  onCreateFollowUp,
  onUpdateFollowUp,
  onDeleteFollowUp,
}) => {
  const [activeTab, setActiveTab] = useState<'today' | 'overdue' | 'upcoming' | 'completed'>('today');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completingFollowUp, setCompletingFollowUp] = useState<FollowUp | null>(null);
  const [outcomeText, setOutcomeText] = useState('');

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState('14:00');
  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState<FollowUpPriority>('medium');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const presets = [
    'Customer asked for price but has not ordered yet. Send gentle nudge.',
    'Customer promised to pay. Follow up on transfer alert.',
    'Order is packed and ready for pickup in store.',
    'Delivery rider dispatched. Follow up to confirm arrival.',
  ];

  const filteredFollowUps = followUps.filter((f) => {
    if (activeTab === 'completed') return f.status === 'completed';
    if (f.status === 'completed') return false;

    if (activeTab === 'today') return f.dueDate === todayStr;
    if (activeTab === 'overdue') return f.dueDate < todayStr;
    if (activeTab === 'upcoming') return f.dueDate > todayStr;
    return true;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedCustomerId) {
      setFormError('Please select a customer');
      return;
    }
    if (!reason.trim()) {
      setFormError('Follow-up reason is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateFollowUp({
        customerId: selectedCustomerId,
        dueDate,
        dueTime,
        reason: reason.trim(),
        priority,
      });
      setIsModalOpen(false);
      setReason('');
    } catch (err: any) {
      setFormError(err.message || 'Failed to create follow-up');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteSubmit = async () => {
    if (!completingFollowUp) return;
    await onUpdateFollowUp(completingFollowUp.id, {
      status: 'completed',
      outcome: outcomeText.trim() || 'Follow-up marked complete by merchant.',
    });
    setCompletingFollowUp(null);
    setOutcomeText('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Follow-up Reminders
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Never lose a sale. Track promises to pay, price inquiries, and delivery confirmations.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedCustomerId(customers[0]?.id || '');
            setReason('');
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Follow-up</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit text-xs font-medium">
        <button
          onClick={() => setActiveTab('today')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'today'
              ? 'bg-white text-emerald-900 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Due Today ({followUps.filter((f) => f.status === 'pending' && f.dueDate === todayStr).length})
        </button>
        <button
          onClick={() => setActiveTab('overdue')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'overdue'
              ? 'bg-white text-rose-900 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Overdue ({followUps.filter((f) => f.status === 'pending' && f.dueDate < todayStr).length})
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'upcoming'
              ? 'bg-white text-slate-900 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Upcoming ({followUps.filter((f) => f.status === 'pending' && f.dueDate > todayStr).length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-white text-slate-900 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Completed ({followUps.filter((f) => f.status === 'completed').length})
        </button>
      </div>

      {/* List */}
      {filteredFollowUps.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-2">
          <Clock className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-base font-bold text-slate-700">No follow-ups in this tab</p>
          <p className="text-xs text-slate-400">
            {activeTab === 'today'
              ? 'All daily reminders have been completed!'
              : 'No scheduled reminders matching this status.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFollowUps.map((f) => {
            const isOverdue = f.dueDate < todayStr && f.status === 'pending';
            const isCompleted = f.status === 'completed';

            return (
              <div
                key={f.id}
                className={`bg-white rounded-2xl border p-5 shadow-2xs space-y-3 transition-all ${
                  isOverdue ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{f.customerName}</span>
                      <span className="text-xs font-mono text-slate-500">{f.customerPhone}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{f.dueDate}</span>
                      <span>·</span>
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{f.dueTime} WAT</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      f.priority === 'high'
                        ? 'bg-rose-100 text-rose-800'
                        : f.priority === 'medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {f.priority}
                  </span>
                </div>

                <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                  {f.reason}
                </p>

                {isCompleted && f.outcome && (
                  <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                    <strong>Outcome:</strong> {f.outcome}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href={getWhatsAppClickToChatUrl(
                      f.customerPhone,
                      `Hello ${f.customerName}! Checking in with you from KasuwaDesk...`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Customer</span>
                  </a>

                  <div className="flex items-center gap-1.5">
                    {!isCompleted && (
                      <button
                        onClick={() => {
                          setCompletingFollowUp(f);
                          setOutcomeText('');
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark Done</span>
                      </button>
                    )}

                    <button
                      onClick={() => onDeleteFollowUp(f.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                      title="Delete reminder"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Outcome Recording Dialog */}
      {completingFollowUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              Record Outcome for {completingFollowUp.customerName}
            </h3>
            <p className="text-xs text-slate-500">
              Original reminder: "{completingFollowUp.reason}"
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                What was the outcome?
              </label>
              <textarea
                rows={3}
                value={outcomeText}
                onChange={(e) => setOutcomeText(e.target.value)}
                placeholder="e.g. Customer transferred ₦31,500. Order marked paid and rider scheduled."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-emerald-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setCompletingFollowUp(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteSubmit}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
              >
                Save Outcome & Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Schedule Follow-up Reminder</h2>
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

            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer *
                </label>
                <select
                  required
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-emerald-500"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Due Time (WAT) *
                  </label>
                  <input
                    type="time"
                    required
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as FollowUpPriority)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-emerald-500"
                >
                  <option value="high">High (Urgent Payment / Restock)</option>
                  <option value="medium">Medium (Standard Check-in)</option>
                  <option value="low">Low (General Inquiry)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Reason & Notes *
                  </label>
                  <span className="text-[10px] text-slate-400">Click a preset below</span>
                </div>
                <textarea
                  rows={2}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="What needs to be followed up with this customer?"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-emerald-500 resize-none"
                />

                {/* Presets */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {presets.map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setReason(preset)}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded cursor-pointer transition-colors text-left"
                    >
                      {preset.slice(0, 42)}...
                    </button>
                  ))}
                </div>
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
                  {isSubmitting ? 'Scheduling...' : 'Save Follow-up'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
