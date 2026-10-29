import React, { useState } from 'react';
import { StorefrontNavbar } from './StorefrontNavbar';
import { HeroSection } from './HeroSection';
import { PhilosophySection } from './PhilosophySection';
import { ServicesSection } from './ServicesSection';
import { CrochetCollectionSection } from './CrochetCollectionSection';
import { ConsultantStorySection } from './ConsultantStorySection';
import { ReviewsSection } from './ReviewsSection';
import { StorefrontFooter } from './StorefrontFooter';
import { BookingModal } from './BookingModal';
import { QuickOrderModal } from './QuickOrderModal';
import { OwnerAuthModal } from './OwnerAuthModal';
import { BusinessSettings, Product } from '../../types';

interface StorefrontViewProps {
  products: Product[];
  settings: BusinessSettings | null;
  onEnterAdminDashboard: () => void;
  onRefreshData: () => void;
  showToast: (msg: string) => void;
}

export function StorefrontView({
  products,
  settings,
  onEnterAdminDashboard,
  onRefreshData,
  showToast,
}: StorefrontViewProps) {
  // Modal states
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<{ name: string; fee: number }>({
    name: '1:1 Clinical Barrier Repair Consultation',
    fee: 25000,
  });

  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);

  const handleOpenBooking = (
    serviceName = '1:1 Clinical Barrier Repair Consultation',
    fee = 25000
  ) => {
    setSelectedService({ name: serviceName, fee });
    setIsBookingOpen(true);
  };

  const handleQuickOrder = (product: Product) => {
    setSelectedProduct(product);
    setIsQuickOrderOpen(true);
  };

  const handleScrollToCollection = () => {
    const el = document.getElementById('collection');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#261C1A] flex flex-col font-sans selection:bg-[#C86D51]/20 selection:text-[#4A2E2B]">
      {/* Top Navigation */}
      <StorefrontNavbar
        onOpenBooking={() => handleOpenBooking()}
        onOpenOwnerPortal={() => setIsOwnerModalOpen(true)}
        supportPhone={settings?.supportPhone}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* 1. Hero Section */}
        <HeroSection
          onOpenBooking={() => handleOpenBooking()}
          onExploreCollection={handleScrollToCollection}
        />

        {/* 2. The Philosophy (Skinimalism & Barrier Repair) */}
        <PhilosophySection />

        {/* 3. Services & Consultations Grid */}
        <ServicesSection
          onSelectService={(name, fee) => handleOpenBooking(name, fee)}
        />

        {/* 4. Crochet & Beauty Essentials Live Catalog */}
        <CrochetCollectionSection
          products={products}
          supportPhone={settings?.supportPhone}
          onQuickOrder={handleQuickOrder}
        />

        {/* 5. Consultant Story & 3-Stage Barrier Protocol */}
        <ConsultantStorySection />

        {/* 6. Real Nigerian Client Reviews */}
        <ReviewsSection />
      </main>

      {/* Storefront Footer with Lagos details & Owner login */}
      <StorefrontFooter
        settings={settings}
        onOpenOwnerPortal={() => setIsOwnerModalOpen(true)}
      />

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        defaultServiceName={selectedService.name}
        defaultFee={selectedService.fee}
        supportPhone={settings?.supportPhone}
        onBookingSuccess={() => {
          showToast('Consultation booking submitted! We have notified your WhatsApp.');
          onRefreshData();
        }}
      />

      {/* Quick Order Modal */}
      <QuickOrderModal
        product={selectedProduct}
        isOpen={isQuickOrderOpen}
        onClose={() => {
          setIsQuickOrderOpen(false);
          setSelectedProduct(null);
        }}
        supportPhone={settings?.supportPhone}
        onOrderSuccess={() => {
          showToast('Order logged! Please proceed with payment confirmation on WhatsApp.');
          onRefreshData();
        }}
      />

      {/* Owner Access Modal */}
      <OwnerAuthModal
        isOpen={isOwnerModalOpen}
        onClose={() => setIsOwnerModalOpen(false)}
        onAuthenticate={() => {
          showToast('Welcome back, Zhat! Owner Dashboard unlocked.');
          onEnterAdminDashboard();
        }}
      />
    </div>
  );
}
