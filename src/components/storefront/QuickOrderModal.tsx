import React, { useState } from 'react';
import { X, ShoppingBag, CheckCircle, MessageCircle, Truck } from 'lucide-react';
import { Product } from '../../types';
import { api } from '../../lib/api';
import { formatNaira, generateWhatsAppOrderUrl } from '../../lib/formatters';

interface QuickOrderModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  supportPhone?: string;
  onOrderSuccess?: () => void;
}

export function QuickOrderModal({
  product,
  isOpen,
  onClose,
  supportPhone = '+2348148924110',
  onOrderSuccess,
}: QuickOrderModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('+234');
  const [deliveryArea, setDeliveryArea] = useState<'mainland' | 'island' | 'abuja' | 'interstate'>('island');
  const [address, setAddress] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const deliveryRates = {
    mainland: 2500,
    island: 3500,
    abuja: 4500,
    interstate: 5500,
  };

  const deliveryFee = deliveryRates[deliveryArea];
  const subtotal = product.price * quantity;
  const totalAmount = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || phone.trim().length < 8) {
      setError('Please provide your name and a valid WhatsApp phone number.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Create or find customer in CRM
      const customer = await api.createCustomer({
        name: customerName.trim(),
        phone: phone.trim(),
        preferredChannel: 'whatsapp',
        productsOfInterest: [product.name],
        deliveryAddress: address ? `${address} (${deliveryArea})` : undefined,
        status: 'lead',
        consentGiven: true,
      });

      // 2. Create Order in CRM backend
      const order = await api.createOrder({
        customerId: customer.id,
        items: [
          {
            productId: product.id,
            productName: `${product.name}${selectedVariant ? ` (${selectedVariant})` : ''}`,
            sku: product.sku,
            unitPrice: product.price,
            quantity: quantity,
            subtotal: subtotal,
          },
        ],
        subtotal: subtotal,
        discount: 0,
        deliveryFee: deliveryFee,
        totalAmount: totalAmount,
        paymentStatus: 'unpaid',
        fulfillmentStatus: 'processing',
        deliveryAddress: address.trim() || 'Address to be confirmed via WhatsApp',
        deliveryCity: deliveryArea === 'abuja' ? 'Abuja' : deliveryArea === 'interstate' ? 'Interstate' : 'Lagos',
        notes: `Website direct order. Selected variant: ${selectedVariant || 'Standard'}. Area: ${deliveryArea}`,
      });

      setOrderComplete(order);
      if (onOrderSuccess) onOrderSuccess();

      // Launch WhatsApp with order receipt
      const cleanPhone = supportPhone.replace(/[^0-9]/g, '');
      const waText = encodeURIComponent(
        `Hello Zhat Beauty! I placed an order on your website:\n\n` +
          `• Order Reference: ${order.reference}\n` +
          `• Item: ${product.name} (Qty: ${quantity})\n` +
          `• Variant: ${selectedVariant || 'Standard'}\n` +
          `• Customer: ${customerName.trim()} (${phone.trim()})\n` +
          `• Delivery: ${address || deliveryArea} (Fee: ${formatNaira(deliveryFee)})\n` +
          `• Total Amount: ${formatNaira(totalAmount)}\n\n` +
          `Please provide your GTBank account details so I can complete payment and send the transfer receipt!`
      );

      setTimeout(() => {
        window.open(`https://wa.me/${cleanPhone}?text=${waText}`, '_blank');
      }, 1000);
    } catch (err: any) {
      console.error('Failed to create order:', err);
      setError(err.message || 'Failed to place order. You can chat directly on WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FAF7F2] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E8DFD8] p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-[#EFE7DE] hover:bg-[#E2D6C8] text-[#4A2E2B] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {orderComplete ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-3xl font-semibold text-[#261C1A]">
              Order Logged!
            </h3>
            <p className="text-sm text-[#5A4844] leading-relaxed">
              Reference: <strong className="font-mono text-[#4A2E2B]">{orderComplete.reference}</strong>
            </p>
            <div className="p-4 rounded-2xl bg-white border border-[#E8DFD8] text-xs text-left space-y-2 text-[#5A4844]">
              <p>
                <strong>Item:</strong> {product.name} x {quantity}
              </p>
              <p>
                <strong>Delivery Area:</strong> {deliveryArea.toUpperCase()} ({formatNaira(deliveryFee)})
              </p>
              <p className="text-sm font-bold text-[#4A2E2B] pt-1 border-t border-[#E8DFD8]">
                Total Payable: {formatNaira(totalAmount)}
              </p>
            </div>
            <p className="text-xs text-[#7A6A65]">
              Opening WhatsApp with your order details so you can make your transfer to Zhat Beauty...
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 bg-[#4A2E2B] text-white rounded-xl text-sm font-semibold hover:bg-[#3B2321] transition-colors cursor-pointer mt-4"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#C86D51] font-bold block mb-1">
                Order & Reserve
              </span>
              <h3 className="font-serif text-2xl font-semibold text-[#261C1A]">
                {product.name}
              </h3>
              <p className="text-base font-serif font-bold text-[#4A2E2B] mt-0.5">
                {formatNaira(product.price)} each
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                {error}
              </div>
            )}

            {/* Variant selection if available */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4A2E2B] mb-1">
                  {product.variants[0].name}
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants[0].options.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedVariant(opt)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer transition-colors ${
                        selectedVariant === opt || (!selectedVariant && i === 0)
                          ? 'bg-[#4A2E2B] text-white border-[#4A2E2B]'
                          : 'bg-white text-[#4A2E2B] border-[#D5C5B8]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4A2E2B] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chioma Adebayo"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C5B8] text-sm text-[#261C1A] focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4A2E2B] mb-1">
                  WhatsApp Phone *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+234 803 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C5B8] text-sm text-[#261C1A] focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
                />
              </div>
            </div>

            {/* Delivery Location Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#4A2E2B] mb-1">
                Delivery Location
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'island', label: 'Island/Lekki', fee: 3500 },
                  { id: 'mainland', label: 'Mainland', fee: 2500 },
                  { id: 'abuja', label: 'Abuja FCT', fee: 4500 },
                  { id: 'interstate', label: 'Interstate', fee: 5500 },
                ].map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => setDeliveryArea(loc.id as any)}
                    className={`p-2 rounded-xl text-center border text-xs cursor-pointer transition-colors ${
                      deliveryArea === loc.id
                        ? 'bg-[#4A2E2B] text-white border-[#4A2E2B]'
                        : 'bg-white text-[#4A2E2B] border-[#D5C5B8]'
                    }`}
                  >
                    <span className="block font-semibold">{loc.label}</span>
                    <span className="block text-[10px] opacity-80">₦{loc.fee.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Street Address */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#4A2E2B] mb-1">
                Delivery Address
              </label>
              <input
                type="text"
                placeholder="Street address, Estate, or Landmark"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C5B8] text-sm text-[#261C1A] focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
              />
            </div>

            {/* Quantity and Order Summary */}
            <div className="p-4 rounded-2xl bg-[#F5EFEB] border border-[#E8DFD8] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span>Quantity:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 rounded-lg bg-white border border-[#D5C5B8] flex items-center justify-center font-bold"
                  >
                    -
                  </button>
                  <span className="font-bold text-sm w-4 text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-white border border-[#D5C5B8] flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex justify-between text-[#5A4844]">
                <span>Items Subtotal:</span>
                <span>{formatNaira(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#5A4844]">
                <span>Delivery Fee:</span>
                <span>{formatNaira(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#4A2E2B] pt-1 border-t border-[#D5C5B8]">
                <span>Total Amount:</span>
                <span>{formatNaira(totalAmount)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#4A2E2B] hover:bg-[#3B2321] text-white rounded-2xl text-sm font-semibold tracking-wide shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Logging Order...</span>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>Submit Order & Open WhatsApp</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
