import React, { useState } from 'react';
import {
  AlertTriangle,
  Bot,
  Building,
  Check,
  CreditCard,
  Database,
  HelpCircle,
  Plus,
  RefreshCw,
  Save,
  Sliders,
  Trash2,
  Truck,
} from 'lucide-react';
import { formatNaira } from '../../lib/formatters';
import { AutomatedRule, BusinessSettings } from '../../types';

interface SettingsViewProps {
  settings: BusinessSettings | null;
  onUpdateSettings: (settings: Partial<BusinessSettings>) => Promise<void>;
  onResetDemo: () => void;
  isResetting: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetDemo,
  isResetting,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'bank' | 'delivery' | 'automation' | 'database'>('profile');
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [businessName, setBusinessName] = useState(settings?.businessName || '');
  const [businessAddress, setBusinessAddress] = useState(settings?.businessAddress || '');
  const [supportPhone, setSupportPhone] = useState(settings?.supportPhone || '');
  const [contactEmail, setContactEmail] = useState(settings?.contactEmail || '');

  // Bank
  const [bankName, setBankName] = useState(settings?.bankDetails.bankName || 'Access Bank');
  const [accountNumber, setAccountNumber] = useState(settings?.bankDetails.accountNumber || '');
  const [accountName, setAccountName] = useState(settings?.bankDetails.accountName || '');

  // Delivery
  const [lagosMainland, setLagosMainland] = useState(settings?.deliveryRates.lagosMainland || 2500);
  const [lagosIsland, setLagosIsland] = useState(settings?.deliveryRates.lagosIsland || 3500);
  const [abujaFct, setAbujaFct] = useState(settings?.deliveryRates.abujaFct || 4500);
  const [interstate, setInterstate] = useState(settings?.deliveryRates.interstate || 5500);

  // Automation
  const [isAutomationEnabled, setIsAutomationEnabled] = useState(
    settings?.automationSettings.isEnabled ?? true
  );
  const [rules, setRules] = useState<AutomatedRule[]>(
    settings?.automationSettings.rules || []
  );
  const [handoffKeywordsInput, setHandoffKeywordsInput] = useState(
    settings?.automationSettings.handoffKeywords?.join(', ') || 'human, agent, staff, talk to human'
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setIsSaved(false);

    try {
      await onUpdateSettings({
        businessName,
        businessAddress,
        supportPhone,
        contactEmail,
        bankDetails: {
          bankName,
          accountNumber,
          accountName,
        },
        deliveryRates: {
          lagosMainland: Number(lagosMainland),
          lagosIsland: Number(lagosIsland),
          abujaFct: Number(abujaFct),
          interstate: Number(interstate),
        },
        automationSettings: {
          isEnabled: isAutomationEnabled,
          autoReplyGreeting: true,
          sendBankDetailsOnDemand: true,
          handoffKeywords: handoffKeywordsInput.split(',').map((w) => w.trim()).filter(Boolean),
          rules,
        },
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const addCustomRule = () => {
    const newRule: AutomatedRule = {
      id: `rule_${Date.now()}`,
      category: 'custom',
      triggerKeywords: ['discount', 'promo'],
      responseTemplate: 'We offer a 5% discount on bulk purchases of 3 or more items! Let us know what you want to combine.',
      isActive: true,
    };
    setRules([...rules, newRule]);
  };

  const removeRule = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Business Settings & Automation
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Configure Nigerian payment details, delivery rates, automated responses, and database connectivity.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold border-b border-slate-200">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Store Profile
        </button>
        <button
          onClick={() => setActiveTab('bank')}
          className={`px-4 py-2.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'bank'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Bank Transfer Details
        </button>
        <button
          onClick={() => setActiveTab('delivery')}
          className={`px-4 py-2.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'delivery'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Delivery Rates (NGN)
        </button>
        <button
          onClick={() => setActiveTab('automation')}
          className={`px-4 py-2.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'automation'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Automated Store Assistant
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`px-4 py-2.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'database'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Database & Demo Mode
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
        {/* Tab 1: Profile */}
        {activeTab === 'profile' && (
          <div className="space-y-4 max-w-xl">
            <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-600" />
              <span>Nigerian Store Profile</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Business / Store Name *
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Store Physical Address
              </label>
              <input
                type="text"
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                placeholder="e.g. Shop 14, Admiralty Way, Lekki Phase 1, Lagos"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Support Phone / WhatsApp
                </label>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  placeholder="+234 803 555 7890"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="sales@kasuwawears.ng"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Bank Details */}
        {activeTab === 'bank' && (
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <h2 className="font-bold text-sm text-slate-900">
                Official Nigerian Bank Transfer Details
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              These details are automatically attached to WhatsApp order invoices and shared when customers ask for account details.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bank Name *
              </label>
              <input
                type="text"
                required
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. Access Bank, GTBank, Zenith Bank, Kuda"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Number * (NUBAN)
              </label>
              <input
                type="text"
                required
                maxLength={10}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="0123456789"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-emerald-500 font-mono text-base"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Name *
              </label>
              <input
                type="text"
                required
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="e.g. Kasuwa Lifestyle Enterprises"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-emerald-500"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Delivery Rates */}
        {activeTab === 'delivery' && (
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" />
              <h2 className="font-bold text-sm text-slate-900">Standard Delivery Rates (₦ NGN)</h2>
            </div>
            <p className="text-xs text-slate-500">
              Default dispatch rates applied when creating orders and quoted by the automated WhatsApp assistant.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lagos Mainland (₦)
                </label>
                <input
                  type="number"
                  min="0"
                  value={lagosMainland}
                  onChange={(e) => setLagosMainland(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lagos Island (₦)
                </label>
                <input
                  type="number"
                  min="0"
                  value={lagosIsland}
                  onChange={(e) => setLagosIsland(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Abuja FCT Express (₦)
                </label>
                <input
                  type="number"
                  min="0"
                  value={abujaFct}
                  onChange={(e) => setAbujaFct(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Interstate Waybill (₦)
                </label>
                <input
                  type="number"
                  min="0"
                  value={interstate}
                  onChange={(e) => setInterstate(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-emerald-500 font-bold"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Automated Store Assistant */}
        {activeTab === 'automation' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-emerald-600" />
                  <span>Rules-Based Automated Assistant</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Responds to customer inquiries using your live catalogue and settings as source of truth.
                </p>
              </div>

              {/* Master Toggle */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAutomationEnabled}
                  onChange={(e) => setIsAutomationEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
                <span className="ml-2 text-xs font-bold text-slate-700">
                  {isAutomationEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            </div>

            {/* Human Handoff Configuration */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Human Handoff Keywords (Comma-separated)
              </label>
              <p className="text-[11px] text-slate-500">
                When a customer writes any of these words, the bot pauses and flags the conversation for immediate staff attention:
              </p>
              <input
                type="text"
                value={handoffKeywordsInput}
                onChange={(e) => setHandoffKeywordsInput(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-emerald-500 font-mono"
              />
            </div>

            {/* Default Automated Rules */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Custom Response Rules
                </h3>
                <button
                  type="button"
                  onClick={addCustomRule}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Custom Rule</span>
                </button>
              </div>

              {rules.map((rule, idx) => (
                <div
                  key={rule.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 capitalize">
                      Rule #{idx + 1} ({rule.category})
                    </span>
                    <button
                      type="button"
                      onClick={() => removeRule(rule.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                      Trigger Keywords (Comma-separated)
                    </span>
                    <input
                      type="text"
                      value={rule.triggerKeywords.join(', ')}
                      onChange={(e) => {
                        const updated = [...rules];
                        updated[idx].triggerKeywords = e.target.value.split(',').map((s) => s.trim());
                        setRules(updated);
                      }}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                      Response Template
                    </span>
                    <textarea
                      rows={2}
                      value={rule.responseTemplate}
                      onChange={(e) => {
                        const updated = [...rules];
                        updated[idx].responseTemplate = e.target.value;
                        setRules(updated);
                      }}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Database & Demo Mode */}
        {activeTab === 'database' && (
          <div className="space-y-5 max-w-xl">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <h2 className="font-bold text-sm text-slate-900">Database & Demo Mode Architecture</h2>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs text-emerald-900">
              <span className="font-bold block">Current Storage Mode: In-Memory (Demo Mode)</span>
              <p className="leading-relaxed text-emerald-800">
                KasuwaDesk is running with isolated in-memory sample records for Nigerian SMEs (fashion items, customers, orders). No external database credentials are required to test all features.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
              <span className="font-bold text-slate-900 block">Connecting Production MongoDB:</span>
              <p className="text-slate-600 leading-relaxed">
                To connect your real persistent MongoDB instance, set the following environment variable in your deployment environment or <code>.env</code>:
              </p>
              <div className="bg-slate-900 text-slate-100 p-2.5 rounded-lg font-mono text-[11px] overflow-x-auto">
                MONGODB_URI="mongodb+srv://user:pass@cluster0.mongodb.net/kasuwadesk"
              </div>
              <p className="text-[11px] text-slate-500">
                All Mongoose schemas in <code>/src/server/models</code> enforce strict tenant isolation via <code>businessId</code>.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-900 block">Reset Demo Records</span>
                <span className="text-[11px] text-slate-500">
                  Restore pristine sample products, orders, and messages.
                </span>
              </div>
              <button
                type="button"
                onClick={onResetDemo}
                disabled={isResetting}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                <span>Reset Demo Data</span>
              </button>
            </div>
          </div>
        )}

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          {isSaved && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" />
              <span>Settings Saved Successfully!</span>
            </span>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
