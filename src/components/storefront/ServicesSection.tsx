import React from 'react';
import { Calendar, CheckCircle2, Clock, MapPin, Sparkles, Video } from 'lucide-react';
import { formatNaira } from '../../lib/formatters';

interface ServicesSectionProps {
  onSelectService: (serviceName: string, fee: number) => void;
}

export function ServicesSection({ onSelectService }: ServicesSectionProps) {
  const services = [
    {
      id: 'srv_1',
      title: '1:1 Clinical Barrier Repair Consultation',
      subtitle: 'Virtual or Lekki Studio',
      price: 25000,
      duration: '45 Minutes',
      format: 'WhatsApp Video / In-Studio',
      featured: true,
      description:
        'A comprehensive deep-dive into your skin barrier health, current product ingredients, and triggers. Tailored specifically for melanin-rich skin recovering from over-exfoliation, burning, or stinging.',
      deliverables: [
        'Complete ingredient breakdown of what you currently own',
        'Custom 3-step minimal healing routine & product guide',
        '14 days of direct WhatsApp follow-up & routine adjustments',
        'Complimentary barrier care quick-reference PDF',
      ],
    },
    {
      id: 'srv_2',
      title: 'Skinimalism Shelf Detox & Product Audit',
      subtitle: 'Declutter & Simplify',
      price: 18000,
      duration: '30 Minutes',
      format: 'WhatsApp Video Call',
      featured: false,
      description:
        'Stop wasting money on viral skincare that clashes with your skin barrier. Bring your entire vanity to a virtual session where we systematically audit each bottle and rebuild your lean daily routine.',
      deliverables: [
        'Ingredient conflict & pore-clogging analysis',
        'Elimination plan for harsh scrubs and stripping toners',
        'Personalized morning & evening 3-product protocol',
        'Budget-friendly Nigerian pharmacy product recommendations',
      ],
    },
    {
      id: 'srv_3',
      title: 'Bridal Glow & Bespoke Crochet Styling Suite',
      subtitle: 'Pre-Wedding Luxury',
      price: 65000,
      duration: '8-Week Program',
      format: 'In-Studio & Concierge',
      featured: false,
      description:
        'The ultimate bridal ritual combining clinical skin preparation with bespoke handcrafted crochet bridal accessories (hairpiece, morning silk-yarn robe, or bridal slippers).',
      deliverables: [
        '8-week weekly barrier monitoring and radiance protocol',
        'Custom-measured handcrafted bridal crochet headwear or wrap',
        'Emergency wedding day barrier rescue kit',
        'Pre-traditional wedding skin consultation',
      ],
    },
  ];

  return (
    <section id="services" className="py-20 bg-[#FAF7F2] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C86D51] font-bold block">
            Tailored Consultations
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#261C1A] font-medium">
            Restore Your Natural Barrier
          </h2>
          <p className="text-sm sm:text-base text-[#5A4844] leading-relaxed">
            Personalized guidance from a certified skincare consultant who understands tropical climates, hyperpigmentation, and skin barrier physiology.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative ${
                service.featured
                  ? 'bg-[#F5EFEB] border-2 border-[#C86D51] shadow-xl'
                  : 'bg-white border border-[#E8DFD8] shadow-sm hover:shadow-lg'
              }`}
            >
              {service.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#C86D51] text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  <span>Most Recommended</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#C86D51]">
                      {service.subtitle}
                    </span>
                    <h3 className="font-serif text-2xl font-semibold text-[#261C1A] mt-1 leading-snug">
                      {service.title}
                    </h3>
                  </div>
                </div>

                {/* Price Display */}
                <div className="pt-2 pb-1">
                  <span className="font-serif text-3xl font-bold text-[#4A2E2B]">
                    {formatNaira(service.price)}
                  </span>
                  <span className="text-xs text-[#7A6A65] block mt-0.5">
                    Includes follow-up support
                  </span>
                </div>

                {/* Meta Tags */}
                <div className="flex items-center gap-4 text-xs font-semibold text-[#5A4844] pb-2 border-b border-[#E8DFD8]">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#C86D51]" />
                    <span>{service.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-[#C86D51]" />
                    <span>{service.format}</span>
                  </div>
                </div>

                <p className="text-sm text-[#5A4844] leading-relaxed">
                  {service.description}
                </p>

                {/* Deliverables Checklist */}
                <div className="space-y-2.5 pt-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#261C1A]">
                    What's Included:
                  </p>
                  {service.deliverables.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-[#4A3834]">
                      <CheckCircle2 className="w-4 h-4 text-[#C86D51] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-8">
                <button
                  onClick={() => onSelectService(service.title, service.price)}
                  className={`w-full py-3.5 rounded-2xl text-sm font-semibold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-lg ${
                    service.featured
                      ? 'bg-[#4A2E2B] hover:bg-[#3B2321] text-white'
                      : 'bg-[#F5EFEB] hover:bg-[#EFE7DE] text-[#4A2E2B] border border-[#D5C5B8]'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-[#D97757]" />
                  <span>Book This Consultation</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
