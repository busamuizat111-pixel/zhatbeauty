import React, { useState } from 'react';
import { ShoppingBag, MessageCircle, Sparkles, Check, Eye } from 'lucide-react';
import { Product } from '../../types';
import { formatNaira, generateWhatsAppOrderUrl } from '../../lib/formatters';

interface CrochetCollectionSectionProps {
  products: Product[];
  supportPhone?: string;
  onQuickOrder: (product: Product) => void;
}

export function CrochetCollectionSection({
  products,
  supportPhone = '+2348148924110',
  onQuickOrder,
}: CrochetCollectionSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Essentials' },
    { id: 'crochet_wear', label: 'Handmade Crochet Wear' },
    { id: 'crochet_acc', label: 'Crochet Beauty Accessories' },
    { id: 'skincare', label: 'Barrier Skincare' },
  ];

  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'crochet_wear') return p.category.toLowerCase().includes('crochet wear') || p.category.toLowerCase().includes('dress');
    if (selectedCategory === 'crochet_acc') return p.category.toLowerCase().includes('accessories') || p.name.toLowerCase().includes('scrubbie') || p.name.toLowerCase().includes('headband');
    if (selectedCategory === 'skincare') return p.category.toLowerCase().includes('skincare') || p.category.toLowerCase().includes('barrier');
    return true;
  });

  return (
    <section id="collection" className="py-20 bg-[#F5EFEB] relative overflow-hidden">
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `url('/assets/aistudio/images__2__829810c9.jpg')`,
          backgroundRepeat: 'repeat',
          backgroundSize: '280px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C86D51] font-bold block">
            Handcrafted & Formulated
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#261C1A] font-medium">
            The Crochet & Beauty Shop
          </h2>
          <p className="text-sm sm:text-base text-[#5A4844] leading-relaxed">
            Slow fashion crochet woven one stitch at a time with 100% organic cotton yarn, paired with gentle, barrier-repairing skin essentials.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#4A2E2B] text-white shadow-md'
                  : 'bg-white/80 hover:bg-white text-[#5A4844] border border-[#E8DFD8]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => {
            const hasStock = product.stockQuantity > 0;
            const waUrl = generateWhatsAppOrderUrl(supportPhone, {
              productName: product.name,
              sku: product.sku,
              price: product.price,
            });

            return (
              <div
                key={product.id}
                className="group bg-[#FAF7F2] rounded-3xl overflow-hidden border border-[#E8DFD8] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Product Image Frame */}
                <div className="relative aspect-square overflow-hidden bg-[#EFE7DE]">
                  <img
                    src={product.images[0] || '/assets/aistudio/images__2__829810c9.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    <span className="bg-[#4A2E2B]/90 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-1 rounded-full shadow-sm">
                      {product.category}
                    </span>
                    {product.stockQuantity <= 3 && product.stockQuantity > 0 && (
                      <span className="bg-[#C86D51] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                        Only {product.stockQuantity} left!
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Box */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px] font-mono font-medium text-[#7A6A65]">
                        {product.sku}
                      </span>
                      <span className="font-serif text-xl sm:text-2xl font-bold text-[#4A2E2B]">
                        {formatNaira(product.price)}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-semibold text-[#261C1A] leading-snug">
                      {product.name}
                    </h3>

                    <p className="text-xs text-[#5A4844] line-clamp-3 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 space-y-2">
                    {/* Quick Order / Enquiry modal trigger */}
                    <button
                      onClick={() => onQuickOrder(product)}
                      className="w-full py-3 bg-[#4A2E2B] hover:bg-[#3B2321] text-[#FAF7F2] rounded-xl text-xs sm:text-sm font-semibold tracking-wide shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4 text-[#D97757]" />
                      <span>Order Item / Reserve</span>
                    </button>

                    {/* Direct WhatsApp Order */}
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 bg-white hover:bg-[#F5EFEB] text-[#261C1A] border border-[#D5C5B8] rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                      <span>Chat on WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Shipping Notice Banner */}
        <div className="mt-14 bg-white rounded-2xl p-6 border border-[#E8DFD8] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5EFEB] flex items-center justify-center text-[#C86D51]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-semibold text-[#261C1A]">
                Custom Crochet Orders Welcome
              </h4>
              <p className="text-xs text-[#6A5A55]">
                Want a specific colour, bust/waist measurement, or bridal set? We hand-weave custom pieces.
              </p>
            </div>
          </div>
          <a
            href={`https://wa.me/${supportPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
              'Hello Zhat! I would like to request a bespoke custom crochet piece with custom measurements.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-[#4A2E2B] text-white rounded-xl text-xs font-semibold hover:bg-[#3B2321] transition-colors shrink-0"
          >
            Request Bespoke Piece
          </a>
        </div>
      </div>
    </section>
  );
}
