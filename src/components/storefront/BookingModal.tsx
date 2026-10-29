import React, { useState } from 'react';
import { X, Calendar, Sparkles, MessageCircle, CheckCircle, Clock, MapPin } from 'lucide-react';
import { api } from '../../lib/api';
import { formatNaira } from '../../lib/formatters';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultServiceName?: string;
  defaultFee?: number;
  supportPhone?: string;
  onBookingSuccess?: () => void;
}

export function BookingModal({
  isOpen,
  onClose,
  defaultServiceName = '1:1 Clinical Barrier Repair Consultation',
  defaultFee = 25000,
  supportPhone = '+2348148924110',
  onBookingSuccess,
}: BookingModalProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+234');
  const [service, setService] = useState(defaultServiceName);
  const [format, setFormat] = useState('WhatsApp Video');
  const [primaryConcern, setPrimaryConcern] = useState('Damaged Barrier / Stinging with Water');
  const [preferredDate, setPreferredDate] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || phone.trim().length < 8) {
      setError('Please provide your name and a valid WhatsApp phone number.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Create or update customer in backend CRM
      const customer = await api.createCustomer({
        name: fullName.trim(),
        phone: phone.trim(),
        preferredChannel: 'whatsapp',
        productsOfInterest: [service],
        notes: `Consultation Booking: ${service} (${format}). Concern: ${primaryConcern}. Date: ${preferredDate}. Client notes: ${notes}`,
        status: 'lead',
        consentGiven: true,
      });

      // 2. Create official Enquiry in the system
      await api.createEnquiry({
        customerId: customer.id,
        customerName: fullName.trim(),
        customerPhone: phone.trim(),
        productName: service,
        status: 'awaiting_response',
        initialMessage: `New consultation booking request: ${service} (${format}) for ${preferredDate || 'soonest slot'}. Skin concern: ${primaryConcern}. Notes: ${notes || 'None'}`,
        notes: `Booked via website landing page. Format: ${format}. Concern: ${primaryConcern}`,
      });

      setSubmitted(true);
      if (onBookingSuccess) onBookingSuccess();

      // Launch WhatsApp chat with prefilled message
      const cleanPhone = supportPhone.replace(/[^0-9]/g, '');
      const waText = encodeURIComponent(
        `Hello Zhat Beauty! I just booked a consultation on your website:\n\n` +
          `• Name: ${fullName.trim()}\n` +
          `• Service: ${service}\n` +
          `• Format: ${format}\n` +
          `• Primary Concern: ${primaryConcern}\n` +
          `• Preferred Date: ${preferredDate || 'Next available slot'}\n` +
          `• Notes: ${notes || 'None'}\n\n` +
          `Please confirm availability and share payment details for my appointment.`
      );

      setTimeout(() => {
        window.open(`https://wa.me/${cleanPhone}?text=${waText}`, '_blank');
      }, 1000);
    } catch (err: any) {
      console.error('Booking failed:', err);
      setError(err.message || 'Failed to submit booking. Please try chatting directly on WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FAF7F2] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E8DFD8] p-6 sm:p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-[#EFE7DE] hover:bg-[#E2D6C8] text-[#4A2E2B] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-3xl font-semibold text-[#261C1A]">
              Booking Request Received!
            </h3>
            <p className="text-sm text-[#5A4844] max-w-sm mx-auto leading-relaxed">
              Thank you, <strong className="text-[#261C1A]">{fullName}</strong>! We have logged your consultation request in our calendar.
            </p>
            <div className="p-4 rounded-2xl bg-white border border-[#E8DFD8] text-xs text-left space-y-1.5 text-[#5A4844]">
              <p>
                <strong>Service:</strong> {service}
              </p>
              <p>
                <strong>Format:</strong> {format}
              </p>
              <p>
                <strong>WhatsApp:</strong> {phone}
              </p>
            </div>
            <p className="text-xs text-[#7A6A65]">
              WhatsApp is opening so you can chat directly with our certified consultant.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 bg-[#4A2E2B] text-white rounded-xl text-sm font-semibold hover:bg-[#3B2321] transition-colors cursor-pointer mt-4"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#C86D51] font-bold block mb-1">
                Zhat Beauty Consulting
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#261C1A]">
                Book Your Consultation
              </h3>
              <p className="text-xs text-[#5A4844] mt-1">
                Take the first step toward a restored, calm moisture barrier.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                {error}
              </div>
            )}

            {/* Service Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#4A2E2B] mb-1.5">
                Select Consultation / Service
              </label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#D5C5B8] text-sm text-[#261C1A] focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
              >
                <option value="1:1 Clinical Barrier Repair Consultation">
                  1:1 Clinical Barrier Repair Consultation (₦25,000)
                </option>
                <option value="Skinimalism Shelf Detox & Product Audit">
                  Skinimalism Shelf Detox & Product Audit (₦18,000)
                </option>
                <option value="Bridal Glow & Bespoke Crochet Styling Suite">
                  Bridal Glow & Bespoke Crochet Styling Suite (₦65,000)
                </option>
              </select>
            </div>

            {/* Format: Virtual or In-Person */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#4A2E2B] mb-1.5">
                Session Format
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormat('WhatsApp Video')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                    format === 'WhatsApp Video'
                      ? 'bg-[#4A2E2B] text-white border-[#4A2E2B]'
                      : 'bg-white text-[#4A2E2B] border-[#D5C5B8]'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('Lekki Studio (In-Person)')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                    format === 'Lekki Studio (In-Person)'
                      ? 'bg-[#4A2E2B] text-white border-[#4A2E2B]'
                      : 'bg-white text-[#4A2E2B] border-[#D5C5B8]'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Lekki Studio</span>
                </button>
              </div>
            </div>

            {/* Customer Name & WhatsApp Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4A2E2B] mb-1.5">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chioma Adebayo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#D5C5B8] text-sm text-[#261C1A] placeholder-[#9E8E87] focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4A2E2B] mb-1.5">
                  WhatsApp Phone (+234) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+234 803 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#D5C5B8] text-sm text-[#261C1A] placeholder-[#9E8E87] focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
                />
              </div>
            </div>

            {/* Primary Skin Concern */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#4A2E2B] mb-1.5">
                Primary Skin Concern
              </label>
              <select
                value={primaryConcern}
                onChange={(e) => setPrimaryConcern(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#D5C5B8] text-sm text-[#261C1A] focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
              >
                <option value="Damaged Barrier / Stinging with Water">
                  Damaged Barrier / Stinging with Water or Moisture
                </option>
                <option value="Over-exfoliation from chemical peeling acids">
                  Over-exfoliation from chemical peeling acids / toners
                </option>
                <option value="Redness, Flaking & Extreme Dehydration">
                  Redness, Flaking & Extreme Dehydration
                </option>
                <option value="Routine Overwhelm (Need a lean 3-step routine)">
                  Routine Overwhelm (Need a lean 3-step routine)
                </option>
                <option value="Pre-Wedding Bridal Skin Prep">
                  Pre-Wedding Bridal Skin Prep
                </option>
                <option value="Bespoke Crochet Sizing & Wear Consult">
                  Bespoke Crochet Sizing & Wear Consult
                </option>
              </select>
            </div>

            {/* Preferred Date & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4A2E2B] mb-1.5">
                  Preferred Date (Optional)
                </label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#D5C5B8] text-sm text-[#261C1A] focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4A2E2B] mb-1.5">
                  Current Products Used
                </label>
                <input
                  type="text"
                  placeholder="e.g. Salicylic acid, retinol"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#D5C5B8] text-sm text-[#261C1A] placeholder-[#9E8E87] focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#4A2E2B] hover:bg-[#3B2321] text-white rounded-2xl text-sm font-semibold tracking-wide shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Confirming Booking...</span>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>Confirm Booking & Open WhatsApp</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
