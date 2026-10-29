import React from 'react';
import { Feather, Shield, HeartHandshake, Sparkles } from 'lucide-react';

export function PhilosophySection() {
  const cards = [
    {
      step: '01',
      title: 'Less is More',
      subtitle: 'The Skinimalism Ethos',
      icon: Feather,
      description:
        'Your skin is a living, intelligent ecosystem, not a chemical lab. We strip away stripping 12-step routines and over-exfoliation, replacing them with focused, biocompatible essentials that respect melanin-rich skin.',
      bullet: 'No harsh peeling acids • No routine overwhelm',
    },
    {
      step: '02',
      title: 'Barrier First',
      subtitle: 'Cellular Moisture Defense',
      icon: Shield,
      description:
        'A compromised lipid barrier triggers stinging, redness, cystic breakouts, and severe dehydration in Nigerian humidity. We focus entirely on repairing your stratum corneum with ceramides, squalane, and colloidal oat.',
      bullet: 'Locks in moisture • Banishes stinging & redness',
    },
    {
      step: '03',
      title: 'Handmade with Care',
      subtitle: 'Artisanal Crochet Beauty',
      icon: HeartHandshake,
      description:
        'Commercial plastic washcloths and harsh loofahs create micro-tears in fragile skin. Our handcrafted crochet accessories use 100% pure organic cotton yarn to offer cloud-soft, hypoallergenic cleansing and tension-free spa comfort.',
      bullet: 'Zero micro-tears • Eco-friendly & washable',
    },
  ];

  return (
    <section id="philosophy" className="relative py-20 bg-[#F5EFEB] overflow-hidden">
      {/* Repeating crochet mesh texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.045] pointer-events-none"
        style={{
          backgroundImage: `url('/assets/aistudio/images__2__829810c9.jpg')`,
          backgroundRepeat: 'repeat',
          backgroundSize: '240px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C86D51] font-bold block">
            Our Core Foundation
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#261C1A] font-medium">
            Where Science Meets Craft
          </h2>
          <p className="text-sm sm:text-base text-[#5A4844] leading-relaxed">
            Healthy, radiant skin does not require twenty different products. It requires barrier respect, pure botanicals, and delicate artisanal care.
          </p>
        </div>

        {/* Minimalist 3-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="group relative bg-[#FAF7F2] rounded-3xl p-8 border border-[#E8DFD8] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Step indicator */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#EFE7DE] group-hover:bg-[#4A2E2B] group-hover:text-white transition-colors flex items-center justify-center text-[#4A2E2B]">
                    <Icon className="w-6 h-6 transition-transform group-hover:scale-110" />
                  </div>
                  <span className="font-serif text-2xl font-semibold text-[#C86D51]/70">
                    {card.step}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#C86D51] block">
                    {card.subtitle}
                  </span>
                  <h3 className="font-serif text-2xl font-semibold text-[#261C1A]">
                    {card.title}
                  </h3>
                  <p className="text-sm text-[#5A4844] leading-relaxed">
                    {card.description}
                  </p>
                </div>

                {/* Bottom Highlight */}
                <div className="mt-6 pt-4 border-t border-[#E8DFD8]/80 flex items-center gap-2 text-xs font-semibold text-[#4A2E2B]">
                  <Sparkles className="w-3.5 h-3.5 text-[#C86D51]" />
                  <span>{card.bullet}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Decorative Yarn Divider */}
        <div className="mt-16 flex items-center justify-center gap-3">
          <div className="h-[1px] w-24 bg-gradient-to-r from-transparent to-[#C86D51]" />
          <div className="w-3 h-3 rounded-full border-2 border-[#C86D51] bg-[#FAF7F2]" />
          <div className="w-2 h-2 rounded-full bg-[#4A2E2B]" />
          <div className="w-3 h-3 rounded-full border-2 border-[#C86D51] bg-[#FAF7F2]" />
          <div className="h-[1px] w-24 bg-gradient-to-l from-transparent to-[#C86D51]" />
        </div>
      </div>
    </section>
  );
}
