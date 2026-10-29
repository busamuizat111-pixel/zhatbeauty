import React, { useState } from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  Copy,
  ExternalLink,
  HelpCircle,
  Info,
  Key,
  LogOut,
  RefreshCw,
  Send,
  ShieldCheck,
  Smartphone,
  Wifi,
} from 'lucide-react';
import { formatLagosDate } from '../../lib/formatters';
import { MessagingProviderType, WhatsAppConnectionInfo } from '../../types';

interface WhatsAppConnectionsViewProps {
  connection: WhatsAppConnectionInfo | null;
  onConnect: (provider: MessagingProviderType) => Promise<any>;
  onDisconnect: () => Promise<void>;
  onSendTestMessage: (phone: string, text: string) => Promise<any>;
}

export const WhatsAppConnectionsView: React.FC<WhatsAppConnectionsViewProps> = ({
  connection,
  onConnect,
  onDisconnect,
  onSendTestMessage,
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [testPhone, setTestPhone] = useState('+2348148924110');
  const [testText, setTestText] = useState('Hello from Zhat Beauty! Your skin barrier consultation is confirmed.');
  const [testResult, setTestResult] = useState<any>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedVerifyToken, setCopiedVerifyToken] = useState(false);

  const isConnected = connection?.status === 'connected';
  const isConnectingState = connection?.status === 'connecting' || isConnecting;

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await onConnect('meta_cloud');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleTestSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone.trim() || !testText.trim()) return;

    setIsSendingTest(true);
    setTestResult(null);
    try {
      const res = await onSendTestMessage(testPhone.trim(), testText.trim());
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setIsSendingTest(false);
    }
  };

  const webhookUrl = `${window.location.origin}/api/webhooks/whatsapp`;
  const defaultVerifyToken = 'zhat_beauty_secure_webhook_verify_token';

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const copyVerifyToken = () => {
    navigator.clipboard.writeText(defaultVerifyToken);
    setCopiedVerifyToken(true);
    setTimeout(() => setCopiedVerifyToken(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight font-serif">
              Meta WhatsApp Cloud API
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Official Integration
            </span>
          </div>
          <p className="text-sm text-stone-600 mt-1">
            Enterprise-grade WhatsApp Business Platform integration via Meta Graph API v21.0. Direct, reliable, and free from browser-bridge risks.
          </p>
        </div>

        <a
          href="https://developers.facebook.com/apps"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl transition-all shadow-2xs shrink-0 self-start sm:self-auto"
        >
          <span>Meta for Developers</span>
          <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
        </a>
      </div>

      {/* Connection Status Overview Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                isConnected
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  : 'bg-amber-50 text-amber-600 border border-amber-100'
              }`}
            >
              <Smartphone className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-stone-900">
                  Meta WhatsApp Business Platform
                </span>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                    isConnected
                      ? 'bg-emerald-100 text-emerald-800'
                      : isConnectingState
                      ? 'bg-blue-100 text-blue-800 animate-pulse'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {connection?.status || 'Ready'}
                </span>
              </div>
              <p className="text-xs text-stone-500 font-mono mt-0.5">
                {connection?.phoneNumber
                  ? `Active Phone / ID: ${connection.phoneNumber}`
                  : 'Ready to connect via Meta Cloud API credentials'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleConnect}
                  disabled={isConnectingState}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isConnectingState ? 'animate-spin' : ''}`} />
                  <span>Verify Status</span>
                </button>
                <button
                  onClick={onDisconnect}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={isConnectingState}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#4A3728] hover:bg-[#3D2C1E] text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Wifi className="w-4 h-4" />
                <span>{isConnectingState ? 'Testing Connection...' : 'Connect / Test Meta API'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Telemetry Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/60">
            <span className="text-stone-400 block text-[10px] uppercase font-bold">
              Integration Provider
            </span>
            <span className="font-bold text-stone-900">
              Official Meta Cloud API
            </span>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/60">
            <span className="text-stone-400 block text-[10px] uppercase font-bold">
              Account Architecture
            </span>
            <span className="font-semibold text-stone-800">
              Direct Graph API (No Bridge)
            </span>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/60">
            <span className="text-stone-400 block text-[10px] uppercase font-bold">
              Last Inbound Webhook
            </span>
            <span className="font-semibold text-stone-700">
              {connection?.lastMessageReceivedAt
                ? formatLagosDate(connection.lastMessageReceivedAt)
                : 'Ready for events'}
            </span>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/60">
            <span className="text-stone-400 block text-[10px] uppercase font-bold">
              Last Outbound Message
            </span>
            <span className="font-semibold text-stone-700">
              {connection?.lastMessageSentAt
                ? formatLagosDate(connection.lastMessageSentAt)
                : 'Ready to send'}
            </span>
          </div>
        </div>

        {connection?.errorDetails && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Meta Connection Notice:</p>
              <p className="mt-0.5">{connection.errorDetails}</p>
            </div>
          </div>
        )}
      </div>

      {/* Two Column Layout: Configuration Guide & Test Tool */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Official Meta Webhook Configuration & Credentials */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-5">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-[#8C6D58]" />
              <h2 className="font-bold text-stone-900 text-sm">
                Genuinely Required Environment Variables
              </h2>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              To operate exclusively via Meta's WhatsApp Cloud API, provide these 4 variables in your environment or <code className="bg-stone-100 px-1 py-0.5 rounded text-[11px]">.env</code>. No external bridge services or third-party web credentials are required.
            </p>

            <div className="space-y-3">
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-stone-900 text-[11px]">
                    META_WA_ACCESS_TOKEN
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Required
                  </span>
                </div>
                <p className="text-stone-600 text-[11px]">
                  Permanent System User token (or temporary access token) with <code className="bg-stone-200/60 px-1 rounded">whatsapp_business_messaging</code> permissions.
                </p>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-stone-900 text-[11px]">
                    META_WA_PHONE_NUMBER_ID
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Required
                  </span>
                </div>
                <p className="text-stone-600 text-[11px]">
                  The Phone Number ID generated by Meta under WhatsApp &gt; API Setup (e.g., <code className="bg-stone-200/60 px-1 rounded">109876543210123</code>), distinct from your display digits.
                </p>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-stone-900 text-[11px]">
                    META_WA_BUSINESS_ACCOUNT_ID
                  </span>
                  <span className="text-[10px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                    Recommended
                  </span>
                </div>
                <p className="text-stone-600 text-[11px]">
                  Your WhatsApp Business Account (WABA) ID found in your Meta Developer App overview.
                </p>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-stone-900 text-[11px]">
                    META_WA_VERIFY_TOKEN
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Required for Webhook
                  </span>
                </div>
                <p className="text-stone-600 text-[11px]">
                  Custom secret string you configure both in your app and in the Meta Developer Webhook challenge field.
                </p>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-stone-900 text-[11px]">
                    META_WA_APP_SECRET
                  </span>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    Security / Signature
                  </span>
                </div>
                <p className="text-stone-600 text-[11px]">
                  Found under Meta App Settings &gt; Basic. Used to cryptographically authenticate inbound payloads via <code className="bg-stone-200/60 px-1 rounded">X-Hub-Signature-256</code> HMAC.
                </p>
              </div>
            </div>

            {/* Webhook Configuration Section */}
            <div className="p-4 bg-[#F8F5F1] border border-[#E7DFD5] rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#4A3728]">
                <Info className="w-4 h-4 text-[#8C6D58] shrink-0" />
                <span>Meta Webhook Configuration Details</span>
              </div>

              <p className="text-xs text-stone-700 leading-relaxed">
                Paste these into your Meta Developer App under <strong>WhatsApp &gt; Configuration &gt; Webhook</strong>:
              </p>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Callback URL:
                </label>
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-stone-200 font-mono text-xs text-stone-800">
                  <span className="flex-1 truncate">{webhookUrl}</span>
                  <button
                    onClick={copyWebhook}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded font-sans text-xs font-semibold cursor-pointer shrink-0 transition-colors"
                  >
                    {copiedWebhook ? 'Copied!' : 'Copy URL'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Verify Token:
                </label>
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-stone-200 font-mono text-xs text-stone-800">
                  <span className="flex-1 truncate">{defaultVerifyToken}</span>
                  <button
                    onClick={copyVerifyToken}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded font-sans text-xs font-semibold cursor-pointer shrink-0 transition-colors"
                  >
                    {copiedVerifyToken ? 'Copied!' : 'Copy Token'}
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-stone-500 pt-1">
                Webhook Fields to Subscribe: Check the <code className="bg-stone-200 px-1 py-0.5 rounded font-mono">messages</code> field to receive customer messages in real time.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Send Test Message Tool */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-[#8C6D58]" />
              <h2 className="font-bold text-stone-900 text-sm">Send Test Message</h2>
            </div>
            <p className="text-xs text-stone-500">
              Dispatch an official WhatsApp message to any customer phone number to verify outbound delivery.
            </p>

            <form onSubmit={handleTestSend} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Recipient Phone (Nigeria)
                </label>
                <input
                  type="text"
                  required
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="e.g. +2348148924110"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-[#8C6D58] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Test Message Body
                </label>
                <textarea
                  rows={3}
                  required
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-[#8C6D58] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSendingTest}
                className="w-full py-2.5 bg-[#4A3728] hover:bg-[#3D2C1E] text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isSendingTest ? 'Sending via Meta Graph API...' : 'Dispatch Test WhatsApp Message'}
              </button>
            </form>

            {testResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  {testResult.success ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Message Dispatched Successfully</span>
                    </>
                  ) : (
                    <>
                      <AlertOctagon className="w-4 h-4 text-rose-600" />
                      <span>Dispatch Failed</span>
                    </>
                  )}
                </div>
                {testResult.messageId && (
                  <p className="font-mono text-[10px] text-stone-600 break-all">
                    Meta Message ID: {testResult.messageId}
                  </p>
                )}
                {testResult.error && (
                  <p className="text-rose-700 text-[11px] leading-relaxed">
                    {testResult.error}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Quick Architecture Note Card */}
          <div className="bg-stone-50 rounded-2xl border border-stone-200/80 p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-stone-900 text-xs font-bold">
              <HelpCircle className="w-4 h-4 text-[#8C6D58]" />
              <span>Why Meta Cloud API exclusively?</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Unlike unofficial libraries (whatsapp-web.js, Baileys) that simulate browser sessions and carry high risks of Meta banning business phone numbers, Meta Cloud API provides a direct HTTP API directly hosted by Meta with zero server overhead and guaranteed deliverability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
