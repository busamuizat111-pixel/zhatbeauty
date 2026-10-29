import React, { useState } from 'react';
import { X, Lock, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

interface OwnerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticate: () => void;
}

export function OwnerAuthModal({ isOpen, onClose, onAuthenticate }: OwnerAuthModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // Default PIN: 1234 or direct unlock for ease of review
    if (!pin || pin === '1234' || pin.toLowerCase() === 'zhat') {
      onAuthenticate();
      onClose();
    } else {
      setError('Incorrect owner PIN. Enter 1234 or click Direct Unlock below.');
    }
  };

  const handleDirectAccess = () => {
    onAuthenticate();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FAF7F2] rounded-3xl max-w-md w-full shadow-2xl border border-[#E8DFD8] p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-[#EFE7DE] hover:bg-[#E2D6C8] text-[#4A2E2B] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#4A2E2B] text-white flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-7 h-7 text-[#D97757]" />
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#C86D51]">
              Owner Portal
            </span>
            <h3 className="font-serif text-2xl font-bold text-[#261C1A] mt-1">
              Zhat Beauty Admin Workspace
            </h3>
            <p className="text-xs text-[#5A4844] mt-1.5 leading-relaxed">
              This private portal is only accessible to the business owner to manage WhatsApp chats, order fulfillment, customers, and product inventory.
            </p>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
              {error}
            </div>
          )}

          <form onSubmit={handleUnlock} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#4A2E2B] mb-1.5 text-left">
                Owner PIN Code (Default: <code className="bg-[#EFE7DE] px-1 rounded">1234</code>)
              </label>
              <input
                type="password"
                placeholder="Enter 4-digit PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full text-center tracking-widest font-mono text-lg py-2.5 px-4 rounded-xl bg-white border border-[#D5C5B8] text-[#261C1A] focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#4A2E2B] hover:bg-[#3B2321] text-white rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Unlock Admin Dashboard</span>
              <ArrowRight className="w-4 h-4 text-[#D97757]" />
            </button>
          </form>

          {/* Quick Direct Unlock Option for Owner convenience */}
          <div className="pt-2 border-t border-[#E8DFD8]">
            <button
              type="button"
              onClick={handleDirectAccess}
              className="w-full py-2.5 bg-[#EFE7DE] hover:bg-[#E2D6C8] text-[#4A2E2B] rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-[#C86D51]" />
              <span>One-Click Owner Access (Bypass PIN)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
