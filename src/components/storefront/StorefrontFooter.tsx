import React from 'react';
import { Lock, MapPin, Phone, Mail, MessageCircle, Heart, ArrowUp } from 'lucide-react';
import { BusinessSettings } from '../../types';

interface StorefrontFooterProps {
  settings: BusinessSettings | null;
  onOpenOwnerPortal: () => void;
}

export function StorefrontFooter({ settings, onOpenOwnerPortal }: StorefrontFooterProps) {
  const phone = settings?.supportPhone || '+234 814 892 4110';
  const cleanPhone = phone.replace(/[^0-9]/g, '');

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#261C1A] text-[#FAF7F2] pt-16 pb-12 border-t border-[#3B2A27]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#3B2A27]">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#C86D51] text-white flex items-center justify-center font-serif text-lg font-bold">
                Z
              </div>
              <span className="font-serif text-2xl font-semibold tracking-wider">
                ZHAT BEAUTY
              </span>
            </div>
            <p className="text-xs text-[#DFD3C3] leading-relaxed">
              Skincare consulting rooted in skinimalism and barrier repair, paired with bespoke handcrafted crochet wear and spa essentials. Hand-woven in Lagos, Nigeria.
            </p>
            <div className="pt-2">
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#128C7E] hover:bg-[#075E54] text-white text-xs font-semibold transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-lg font-semibold text-[#EFE7DE]">Explore</h4>
            <ul className="space-y-2 text-xs text-[#DFD3C3]">
              <li>
                <a href="#philosophy" className="hover:text-white transition-colors">
                  Skinimalism & Barrier Philosophy
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  1:1 Consultations & Audits
                </a>
              </li>
              <li>
                <a href="#collection" className="hover:text-white transition-colors">
                  Handcrafted Crochet Gowns & Scrubbies
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  About the Consultant
                </a>
              </li>
              <li>
                <a href="#reviews" className="hover:text-white transition-colors">
                  Client Reviews & Results
                </a>
              </li>
            </ul>
          </div>

          {/* Lagos Delivery & Rates */}
          <div className="space-y-3">
            <h4 className="font-serif text-lg font-semibold text-[#EFE7DE]">Delivery & Rates</h4>
            <ul className="space-y-2 text-xs text-[#DFD3C3]">
              <li className="flex justify-between">
                <span>Lagos Mainland:</span>
                <span className="font-semibold text-white">₦2,500</span>
              </li>
              <li className="flex justify-between">
                <span>Lagos Island & Lekki:</span>
                <span className="font-semibold text-white">₦3,500</span>
              </li>
              <li className="flex justify-between">
                <span>Abuja FCT (Flight Express):</span>
                <span className="font-semibold text-white">₦4,500</span>
              </li>
              <li className="flex justify-between">
                <span>Interstate (Nationwide):</span>
                <span className="font-semibold text-white">₦5,500</span>
              </li>
            </ul>
            <p className="text-[11px] text-[#A89890] pt-1">
              *All crochet items are individually boxed with breathable dust-bags.
            </p>
          </div>

          {/* Lagos Studio & Bank Info */}
          <div className="space-y-3">
            <h4 className="font-serif text-lg font-semibold text-[#EFE7DE]">Studio & Contact</h4>
            <div className="space-y-2 text-xs text-[#DFD3C3]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C86D51] shrink-0 mt-0.5" />
                <span>Suite 4B, Admiralty Way, Lekki Phase 1, Lagos</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C86D51] shrink-0" />
                <span>{phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C86D51] shrink-0" />
                <span>consult@zhatbeauty.com</span>
              </div>
            </div>

            <div className="pt-2 p-3 rounded-xl bg-[#342422] border border-[#4A3430] text-[11px] text-[#DFD3C3]">
              <p className="font-semibold text-white">Bank Transfer Details:</p>
              <p>GTBank | 0148924110</p>
              <p className="text-[#C86D51]">Zhat Beauty & Aesthetics</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar with discrete Owner Portal access */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A89890]">
          <p>© {new Date().getFullYear()} Zhat Beauty. All Rights Reserved. Lagos, Nigeria.</p>

          <div className="flex items-center gap-6">
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Back to Top</span>
            </button>

            {/* Discrete Owner Admin Access */}
            <button
              onClick={onOpenOwnerPortal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#342422] hover:bg-[#4A3430] text-[#EFE7DE] transition-colors cursor-pointer border border-[#4A3430]"
              title="Access KasuwaDesk Store Management System"
            >
              <Lock className="w-3 h-3 text-[#C86D51]" />
              <span className="font-medium">Owner Portal / Admin Login</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
