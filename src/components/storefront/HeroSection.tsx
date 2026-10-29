import React from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Heart } from 'lucide-react';

interface HeroSectionProps {
  onOpenBooking: () => void;
  onExploreCollection: () => void;
}

export function HeroSection({ onOpenBooking, onExploreCollection }: HeroSectionProps) {
  return (
    <section id="hero" className="relative overflow-hidden pt-8 pb-16 lg:py-20 bg-[#FAF7F2]">
      {/* Subtle crochet texture ambient layer */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `url('/assets/aistudio/images__2__829810c9.jpg')`,
          backgroundRepeat: 'repeat',
          backgroundSize: '320px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Editorial Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
            {/* Kicker Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5EFEB] border border-[#E8DFD8] text-xs font-semibold text-[#4A2E2B]">
              <span className="w-2 h-2 rounded-full bg-[#C86D51] animate-pulse" />
              <span>Skinimalism & Bespoke Crochet Studio • Lagos, Nigeria</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#261C1A] leading-[1.12] tracking-tight font-medium">
              Skip the complicated routine.{' '}
              <span className="italic font-normal block text-[#4A2E2B]">
                Wake up with a healed barrier.
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-[#5A4844] max-w-xl leading-relaxed">
              Skincare consulting rooted in <strong className="text-[#261C1A] font-semibold">skinimalism</strong> and clinical barrier restoration, paired with lovingly <strong className="text-[#261C1A] font-semibold">handmade crochet beauty essentials</strong> and spa wear.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={onOpenBooking}
                className="px-7 py-4 bg-[#4A2E2B] hover:bg-[#3B2321] text-[#FAF7F2] font-semibold rounded-2xl text-base shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-3 group"
              >
                <span>Book a Consultation</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#D97757]" />
              </button>

              <button
                onClick={onExploreCollection}
                className="px-6 py-4 bg-[#F5EFEB] hover:bg-[#EFE7DE] border border-[#D5C5B8] text-[#4A2E2B] font-semibold rounded-2xl text-base transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Shop Crochet Essentials</span>
              </button>
            </div>

            {/* Credibility & Trust Markers */}
            <div className="pt-6 border-t border-[#E8DFD8] grid grid-cols-3 gap-4 text-xs font-medium text-[#5A4844]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C86D51] shrink-0" />
                <span>Barrier-Safe Protocols</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#C86D51] shrink-0" />
                <span>100% Breathable Cotton</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C86D51] shrink-0" />
                <span>Lagos & Nationwide Delivery</span>
              </div>
            </div>
          </div>

          {/* Right Column: High-Res Black Model in Handcrafted Crochet Gown */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Decorative Warm Terracotta Backdrop Card */}
              <div className="absolute -inset-3 sm:-inset-4 bg-gradient-to-tr from-[#C86D51]/15 to-[#4A2E2B]/10 rounded-3xl transform rotate-1 filter blur-sm" />

              {/* Main Image Frame */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                <img
                  src="/assets/aistudio/IMG_8769_white_bg.png"
                  alt="Zhat Beauty Handcrafted Crochet Gown and Barrier Glow"
                  className="w-full h-[460px] sm:h-[540px] lg:h-[580px] object-cover object-top hover:scale-[1.02] transition-transform duration-500"
                />

                {/* Bottom Overlay Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-[#E8DFD8] shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#C86D51]">
                        Handmade Signature
                      </p>
                      <h4 className="font-serif text-lg font-semibold text-[#261C1A]">
                        The Aphrodite Bell-Sleeve Gown
                      </h4>
                      <p className="text-xs text-[#6A5A55]">
                        Woven from 100% pure organic cotton yarn
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500 line-through block">₦58,000</span>
                      <span className="text-sm font-bold text-[#4A2E2B]">₦52,000</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Pill Tag */}
              <div className="absolute -top-3 -right-2 bg-[#4A2E2B] text-white px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D97757]" />
                <span>100% Melanin Barrier Friendly</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
