import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Copy,
  ExternalLink,
  Info,
  LogOut,
  QrCode,
  RefreshCw,
  Send,
  ShieldAlert,
  Smartphone,
  Wifi,
  WifiOff,
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
  const [selectedProvider, setSelectedProvider] = useState<MessagingProviderType>(
    connection?.provider || 'whatsapp_web'
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [testPhone, setTestPhone] = useState('+234');
  const [testText, setTestText] = useState('Hello from KasuwaDesk! This is a test message.');
  const [testResult, setTestResult] = useState<any>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const isConnected = connection?.status === 'connected';
  const isConnectingState = connection?.status === 'connecting' || isConnecting;

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await onConnect(selectedProvider);
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

  const webhookUrl = `${window.location.origin}/api/whatsapp/webhook`;

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          WhatsApp Connection Management
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Connect your business WhatsApp number using either an Unofficial Web session or Meta's official Cloud API.
        </p>
      </div>

      {/* Connection Status Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                isConnected
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-amber-50 text-amber-600'
              }`}
            >
              <Smartphone className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-slate-900">
                  {connection?.provider === 'meta_cloud'
                    ? 'Meta WhatsApp Cloud API (Official)'
                    : 'WhatsApp Web Persistent Adapter (Unofficial)'}
                </span>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                    isConnected
                      ? 'bg-emerald-100 text-emerald-800'
                      : isConnectingState
                      ? 'bg-blue-100 text-blue-800 animate-pulse'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {connection?.status || 'Ready'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {connection?.phoneNumber
                  ? `Connected Number: ${connection.phoneNumber}`
                  : 'No active WhatsApp session linked'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isConnected ? (
              <button
                onClick={onDisconnect}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect</span>
              </button>
            ) : (
              <button
                onClick={handleConnect}
                disabled={isConnectingState}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Wifi className="w-4 h-4" />
                <span>{isConnectingState ? 'Initiating...' : 'Connect WhatsApp'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Telemetry Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">
              Active Provider
            </span>
            <span className="font-bold text-slate-900 capitalize">
              {connection?.provider === 'meta_cloud' ? 'Meta Cloud API' : 'WhatsApp Web'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">
              Last Connected
            </span>
            <span className="font-semibold text-slate-700">
              {connection?.lastConnectedAt ? formatLagosDate(connection.lastConnectedAt) : 'Never'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">
              Last Inbound Msg
            </span>
            <span className="font-semibold text-slate-700">
              {connection?.lastMessageReceivedAt
                ? formatLagosDate(connection.lastMessageReceivedAt)
                : 'None recorded'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">
              Last Outbound Msg
            </span>
            <span className="font-semibold text-slate-700">
              {connection?.lastMessageSentAt
                ? formatLagosDate(connection.lastMessageSentAt)
                : 'None recorded'}
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Provider Selector & Test Tool */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Provider Configuration & Warnings */}
        <div className="lg:col-span-7 space-y-6">
          {/* Provider Selection Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h2 className="font-bold text-slate-900 text-sm">Choose Messaging Architecture</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A: WhatsApp Web */}
              <div
                onClick={() => setSelectedProvider('whatsapp_web')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedProvider === 'whatsapp_web'
                    ? 'border-emerald-600 bg-emerald-50/40'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900">Provider A: Web Adapter</span>
                  <span className="text-[10px] bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded">
                    Unofficial
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pairs via QR code using Puppeteer browser automation in a persistent Node.js service. No Meta developer account needed.
                </p>
              </div>

              {/* Option B: Meta Cloud API */}
              <div
                onClick={() => setSelectedProvider('meta_cloud')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedProvider === 'meta_cloud'
                    ? 'border-emerald-600 bg-emerald-50/40'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900">Provider B: Meta Cloud API</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                    Official
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Official WhatsApp Business Platform via Graph API. Zero risk of account restriction, 99.9% uptime, verified green badge support.
                </p>
              </div>
            </div>

            {/* Provider A Notice & Microservice Guidance */}
            {selectedProvider === 'whatsapp_web' && (
              <div className="space-y-3 pt-2">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-800">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Important Account Safety & Technical Notice</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    <li>
                      <strong>Unofficial Library:</strong> whatsapp-web.js reverse-engineers WhatsApp Web and is not endorsed or supported by Meta.
                    </li>
                    <li>
                      <strong>Account Restriction Risk:</strong> Sending large volumes of automated messages or spam via unofficial browser sessions may lead to WhatsApp temporarily or permanently banning your phone number.
                    </li>
                    <li>
                      <strong>Dedicated Microservice:</strong> Puppeteer must run inside a persistent Node.js daemon (source provided in <code>/services/whatsapp-web-service</code>), never in serverless Next.js edge functions.
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Provider B Notice & Webhook Configuration */}
            {selectedProvider === 'meta_cloud' && (
              <div className="space-y-3 pt-2">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-blue-800">
                    <Info className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Official Meta Webhook Setup</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    Set up this webhook in your Meta Developer App (<strong>WhatsApp &gt; Configuration</strong>):
                  </p>
                  <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-blue-200 font-mono text-[11px] text-slate-800 overflow-x-auto">
                    <span className="flex-1 truncate">{webhookUrl}</span>
                    <button
                      onClick={copyWebhook}
                      className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded font-sans text-xs font-semibold cursor-pointer shrink-0"
                    >
                      {copiedWebhook ? 'Copied!' : 'Copy URL'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Verify Token: Matches <code>META_WA_VERIFY_TOKEN</code> configured in your <code>.env</code>.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Send Test Message Tool */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-600" />
              <h2 className="font-bold text-slate-900 text-sm">Send Test Message</h2>
            </div>
            <p className="text-xs text-slate-500">
              Verify your active adapter by dispatching a test text to any Nigerian phone number.
            </p>

            <form onSubmit={handleTestSend} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recipient Phone Number (Nigeria)
                </label>
                <input
                  type="text"
                  required
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="e.g. +2348031234567"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Test Message Body
                </label>
                <textarea
                  rows={2}
                  required
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-emerald-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSendingTest}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isSendingTest ? 'Sending Test...' : 'Dispatch Test Message'}
              </button>
            </form>

            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs space-y-1 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
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
                  <p className="font-mono text-[10px] text-slate-600">
                    ID: {testResult.messageId}
                  </p>
                )}
                {testResult.error && <p className="text-rose-700">{testResult.error}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
