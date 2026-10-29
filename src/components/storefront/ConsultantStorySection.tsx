import React from 'react';
import { Sparkles, Heart, CheckCircle, ShieldCheck } from 'lucide-react';

export function ConsultantStorySection() {
  const timeline = [
    {
      phase: 'Phase 1: Calm & Cease',
      days: 'Days 1 — 7',
      text: 'Stop all foaming cleansers, acids (AHA/BHA), retinoids, and exfoliating brushes. Introduce pure lipid cleansers and thermal water compresses.',
    },
    {
      phase: 'Phase 2: Replenish & Cushion',
      days: 'Days 8 — 21',
      text: 'Incorporate 5 essential ceramides, squalane elixir, and colloidal oatmeal to rebuild the intercellular lipid matrix and eliminate stinging.',
    },
    {
      phase: 'Phase 3: Fortify & Glow',
      days: 'Days 22 — 45+',
      text: 'The skin moisture barrier is fully restored. Transepidermal water loss drops, natural luminosity returns, and makeup glides on flawlessly.',
    },
  ];

  return (
    <section id="about" className="py-20 bg-[#FAF7F2] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Founder & Brand Narrative Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          {/* Left: Dual Editorial Photos of African Skin & Crochet Craft */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4 relative">
            <div className="space-y-4">
              <div className="rounded-3xl overflow-hidden shadow-lg border border-[#E8DFD8]">
                <img
                  src="/assets/aistudio/pexels-matilda-jacob-2151151510-35905868_7fa12598.jpg"
                  alt="Radiant healthy skin barrier"
                  className="w-full h-64 object-cover object-center hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="bg-[#4A2E2B] text-white p-5 rounded-3xl text-center space-y-1">
                <span className="font-serif text-3xl font-bold text-[#D97757]">98%</span>
                <p className="text-xs text-[#EFE7DE] leading-snug">
                  Of clients report complete cessation of skin stinging within 14 days
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-6">
              <div className="bg-[#F5EFEB] p-5 rounded-3xl border border-[#E8DFD8] text-center space-y-1">
                <span className="font-serif text-3xl font-bold text-[#4A2E2B]">100%</span>
                <p className="text-xs text-[#5A4844] leading-snug">
                  Organic cotton yarn hand-spun for hypersensitive skin
                </p>
              </div>
              <div className="rounded-3xl overflow-hidden shadow-lg border border-[#E8DFD8]">
                <img
                  src="/assets/aistudio/pexels-annygantuss-6759836_573e18aa.jpg"
                  alt="Glowing healed barrier African beauty"
                  className="w-full h-64 object-cover object-center hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>

          {/* Right: Narrative */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <span className="text-xs uppercase tracking-[0.25em] text-[#C86D51] font-bold block">
              Meet the Consultant & Maker
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#261C1A] font-medium leading-tight">
              Rooted in Lagos, Dedicated to Calm Skin and Mindful Craft
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-[#5A4844] leading-relaxed">
              <p>
                Zhat Beauty was born out of frustration with the hyper-active skincare marketing that told Nigerian women they needed a 12-step regime filled with 30% peeling acids and harsh bleaching agents. The result was widespread barrier breakdown, burning, and post-inflammatory hyperpigmentation.
              </p>
              <p>
                As a certified skincare consultant and passionate crochet artisan, I created Zhat Beauty to prove that <strong className="text-[#261C1A]">skinimalism heals</strong>. When you stop stripping your stratum corneum and nurture it with biocompatible ceramides, skin breathes and thrives.
              </p>
              <p>
                And because touch matters just as much as what you apply, our handcrafted crochet accessories—from face rounds to bell-sleeve robes—are crafted with breathable, tension-free organic fibres that feel like a tender hug to your skin.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-6">
              <div>
                <p className="font-serif text-xl font-bold text-[#261C1A]">Zhat</p>
                <p className="text-xs text-[#C86D51] font-semibold">
                  Founder, Skincare Consultant & Crochet Designer
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* The 3-Phase Barrier Restoration Framework */}
        <div className="bg-[#F5EFEB] rounded-3xl p-8 sm:p-12 border border-[#E8DFD8] relative">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#C86D51] font-bold">
              The Consultation Framework
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#261C1A]">
              How We Heal Your Barrier in 30 Days
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {timeline.map((step, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-[#E8DFD8] shadow-sm flex flex-col justify-between space-y-3"
              >
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#C86D51]">
                    {step.days}
                  </span>
                  <h4 className="font-serif text-lg font-semibold text-[#261C1A] mt-1">
                    {step.phase}
                  </h4>
                  <p className="text-xs text-[#5A4844] leading-relaxed mt-2">
                    {step.text}
                  </p>
                </div>
                <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-[#4A2E2B]">
                  <CheckCircle className="w-3.5 h-3.5 text-[#C86D51]" />
                  <span>Monitored on WhatsApp</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
