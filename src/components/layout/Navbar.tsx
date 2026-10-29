import React, { useEffect, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
  ShieldAlert,
  Smartphone,
  Store,
  Wifi,
} from 'lucide-react';
import { formatLagosTimeOnly } from '../../lib/formatters';
import { BusinessSettings, WhatsAppConnectionInfo } from '../../types';

interface NavbarProps {
  settings: BusinessSettings | null;
  connection: WhatsAppConnectionInfo | null;
  onResetDemo: () => void;
  onNavigate: (tab: string) => void;
  onReturnToStorefront?: () => void;
  isResetting: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  connection,
  onResetDemo,
  onNavigate,
  onReturnToStorefront,
  isResetting,
}) => {
  const [lagosTime, setLagosTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      setLagosTime(formatLagosTimeOnly(new Date().toISOString()));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const isConnected = connection?.status === 'connected';

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      {/* Top Banner: DEMO MODE Alert with Clear Separation */}
      <div className="bg-[#261C1A] text-[#FAF7F2] px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="bg-[#C86D51] text-white font-bold px-2 py-0.5 rounded text-[10px] tracking-wide uppercase">
            Owner Admin Active
          </span>
          <span className="text-[#DFD3C3] hidden sm:inline">
            Zhat Beauty Store & WhatsApp Sales Management System. All live customer enquiries appear here.
          </span>
        </div>

        <div className="flex items-center gap-3">
          {onReturnToStorefront && (
            <button
              onClick={onReturnToStorefront}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white bg-[#C86D51] hover:bg-[#B55F45] px-2.5 py-0.5 rounded transition-colors cursor-pointer"
            >
              <span>← View Live Storefront</span>
            </button>
          )}

          <button
            onClick={onResetDemo}
            disabled={isResetting}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#DFD3C3] hover:text-white bg-black/30 hover:bg-black/50 px-2.5 py-0.5 rounded transition-colors cursor-pointer disabled:opacity-50"
            title="Reset demo products, orders, and messages back to original state"
          >
            <RefreshCw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Reset Demo Data</span>
          </button>

          <span className="text-[#D97757] font-mono text-[11px] hidden md:inline">
            🕒 Lagos: {lagosTime || '12:00 PM'} WAT
          </span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & Business Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4A2E2B] text-white flex items-center justify-center font-bold text-lg shadow-sm">
            ZB
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                Zhat Beauty
              </span>
              <span className="text-[10px] bg-amber-50 text-[#C86D51] font-semibold px-2 py-0.5 rounded-full border border-amber-200">
                Owner Workspace
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium truncate max-w-[200px] sm:max-w-xs flex items-center gap-1">
              <Store className="w-3 h-3 text-[#C86D51] shrink-0" />
              <span>{settings?.businessName || 'Zhat Beauty (Lekki Phase 1, Lagos)'}</span>
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Back to Storefront button for desktop */}
          {onReturnToStorefront && (
            <button
              onClick={onReturnToStorefront}
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#4A2E2B] bg-[#F5EFEB] hover:bg-[#EFE7DE] rounded-xl border border-[#D5C5B8] transition-colors cursor-pointer"
            >
              <Store className="w-4 h-4 text-[#C86D51]" />
              <span>View Customer Website</span>
            </button>
          )}

          {/* WhatsApp Connection status pill */}
          <button
            onClick={() => onNavigate('whatsapp')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              isConnected
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isConnected ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isConnected ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </span>
            <span className="hidden sm:inline">
              WhatsApp:{' '}
              <strong className="capitalize">
                {connection?.status || 'Ready'}
              </strong>
            </span>
            <span className="sm:hidden">{isConnected ? 'Online' : 'Offline'}</span>
          </button>

          {/* Currency Pill */}
          <div className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
            <span className="font-bold text-[#4A2E2B]">₦ NGN</span>
            <span className="text-slate-400">·</span>
            <span>Africa/Lagos</span>
          </div>
        </div>
      </div>
    </header>
  );
};
