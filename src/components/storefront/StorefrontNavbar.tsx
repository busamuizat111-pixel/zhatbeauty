import React from 'react';
import { Lock, Sparkles, MessageCircle, ShoppingBag } from 'lucide-react';

interface StorefrontNavbarProps {
  onOpenBooking: () => void;
  onOpenOwnerPortal: () => void;
  supportPhone?: string;
}

export function StorefrontNavbar({
  onOpenBooking,
  onOpenOwnerPortal,
  supportPhone = '+2348148924110',
}: StorefrontNavbarProps) {
  const cleanPhone = supportPhone.replace(/[^0-9]/g, '');

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E8DFD8]">
      {/* Top Banner */}
      <div className="bg-[#4A2E2B] text-[#FAF7F2] text-xs py-2 px-4 text-center font-medium tracking-wide flex items-center justify-between sm:justify-center gap-4">
        <span className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#D97757]" />
          <span>Skinimalism & Bespoke Handcrafted Crochet • Lekki Phase 1, Lagos</span>
        </span>
        <button
          onClick={onOpenOwnerPortal}
          className="text-[11px] underline text-[#EFE7DE] hover:text-white flex items-center gap-1 cursor-pointer sm:hidden"
        >
          <Lock className="w-3 h-3" />
          <span>Owner</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#hero" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-[#4A2E2B] text-[#FAF7F2] flex items-center justify-center font-serif text-xl font-bold shadow-md group-hover:bg-[#3B2321] transition-colors">
            Z
          </div>
          <div>
            <span className="font-serif text-2xl sm:text-3xl font-semibold tracking-wider text-[#261C1A] block leading-none">
              ZHAT BEAUTY
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#C86D51] font-semibold block mt-0.5">
              Skinimalism & Crochet Studio
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#4A2E2B]">
          <a href="#philosophy" className="hover:text-[#C86D51] transition-colors">
            Philosophy
          </a>
          <a href="#services" className="hover:text-[#C86D51] transition-colors">
            Services & Consultations
          </a>
          <a href="#collection" className="hover:text-[#C86D51] transition-colors">
            Crochet & Beauty Essentials
          </a>
          <a href="#about" className="hover:text-[#C86D51] transition-colors">
            About Zhat
          </a>
          <a href="#reviews" className="hover:text-[#C86D51] transition-colors">
            Client Love
          </a>
        </nav>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          {/* Direct WhatsApp Chat */}
          <a
            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
              'Hello Zhat Beauty! I am reaching out from your website to inquire about your skincare consulting & crochet pieces.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#4A2E2B] bg-[#EFE7DE] hover:bg-[#E2D6C8] rounded-xl transition-colors"
            title="Chat directly on WhatsApp"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <span>WhatsApp Us</span>
          </a>

          {/* Book Consultation CTA */}
          <button
            onClick={onOpenBooking}
            className="px-4 sm:px-5 py-2.5 bg-[#4A2E2B] hover:bg-[#3B2321] text-[#FAF7F2] rounded-xl text-xs sm:text-sm font-semibold tracking-wide shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#D97757]" />
            <span>Book Consultation</span>
          </button>

          {/* Owner Portal Discrete Access */}
          <button
            onClick={onOpenOwnerPortal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-[#EFE7DE]/60 rounded-xl transition-colors cursor-pointer border border-[#E8DFD8]"
            title="Business Owner Admin Dashboard"
          >
            <Lock className="w-3.5 h-3.5 text-[#C86D51]" />
            <span>Owner Portal</span>
          </button>
        </div>
      </div>
    </header>
  );
}
