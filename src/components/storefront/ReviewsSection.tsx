import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

export function ReviewsSection() {
  const reviews = [
    {
      name: 'Chioma Adebayo',
      location: 'Lekki Phase 1, Lagos',
      service: '1:1 Barrier Consultation & Aphrodite Crochet Gown',
      rating: 5,
      review:
        'My skin was on fire after using a viral AHA toner. Every moisturiser stung. Within 5 days of Zhat’s skinimalism protocol and Ceramide Balm, the redness disappeared completely. And the bell-sleeve crochet gown she made for my birthday dinner had everyone asking where I got it!',
    },
    {
      name: 'Zainab Danjuma',
      location: 'Ikeja GRA, Lagos',
      service: 'Skin Barrier Rescue & Crochet Spa Set',
      rating: 5,
      review:
        'The crochet facial scrubbies are genuinely life-changing. Commercial washcloths always felt too rough on my delicate cheeks. These feel like plush cotton clouds. Zhat is so patient on WhatsApp and checks in regularly.',
    },
    {
      name: 'Fatima Al-Hassan',
      location: 'Maitama, Abuja',
      service: 'Virtual Routine Audit & Bespoke Crochet Piece',
      rating: 5,
      review:
        'I had 14 products in my routine and constant cystic breakouts. Zhat stripped my shelf down to just 3 bio-compatible products. In 3 weeks my skin cleared up without a single harsh peel. Worth every kobo!',
    },
  ];

  return (
    <section id="reviews" className="py-20 bg-[#F5EFEB] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C86D51] font-bold block">
            Real Stories & Results
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#261C1A] font-medium">
            Healed Barriers, Happy Clients
          </h2>
          <p className="text-sm sm:text-base text-[#5A4844] leading-relaxed">
            See what our clients across Lagos, Abuja, and nationwide say about their skin transformation and bespoke crochet orders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-8 border border-[#E8DFD8] shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Rating Stars */}
                <div className="flex items-center gap-1 text-[#D97757]">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                <Quote className="w-8 h-8 text-[#C86D51]/30" />

                <p className="text-sm text-[#4A3834] leading-relaxed italic">
                  "{rev.review}"
                </p>
              </div>

              <div className="pt-6 border-t border-[#E8DFD8] mt-6 flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-base font-semibold text-[#261C1A]">
                    {rev.name}
                  </h4>
                  <p className="text-xs text-[#7A6A65]">{rev.location}</p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-[#128C7E]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Client</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
