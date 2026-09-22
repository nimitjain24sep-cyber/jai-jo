'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Truck,
  Phone,
  ArrowRight,
  ShieldCheck,
  Search,
  Clock,
  MapPin,
  ShoppingBag,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

export default function CheckoutPage() {
  const {
    items,
    subtotal,
    deliveryFee,
    couponDiscount,
    appliedCoupon,
    total,
    clearCart,
  } = useCart();
  const { lang, t } = useLanguage();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    landmark: '',
    pincode: '457226',
    deliveryNote: '',
    contactLanguage: lang,
    paymentMethod: 'demo_upi' as 'cod' | 'demo_upi',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isPlacing, setIsPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Tracking State
  const [trackOrderId, setTrackOrderId] = useState('');
  const [trackPhone, setTrackPhone] = useState('');
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [trackResult, setTrackResult] = useState<any | null>(null);

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = t('requiredField');
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) errors.phone = t('validPhoneRequired');
    if (!formData.address.trim()) errors.address = t('requiredField');
    if (!/^\d{6}$/.test(formData.pincode)) errors.pincode = 'Valid 6-digit PIN required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (items.length === 0) return;

    try {
      setIsPlacing(true);
      const payload = {
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_email: formData.email,
        delivery_address: formData.address,
        landmark: formData.landmark,
        pincode: formData.pincode,
        delivery_note: formData.deliveryNote,
        contact_language: formData.contactLanguage,
        payment_method: formData.paymentMethod,
        coupon_code: appliedCoupon?.code,
        items: items.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to place order');
        return;
      }

      setPlacedOrder(data.order);
      setWhatsappUrl(data.whatsapp_url);
      clearCart();
    } catch (err: any) {
      alert('Error placing order: ' + err.message);
    } finally {
      setIsPlacing(false);
    }
  };

  // Track Order
  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackOrderId.trim() || !trackPhone.trim()) return;

    try {
      setTrackLoading(true);
      setTrackError(null);
      setTrackResult(null);

      const res = await fetch(
        `/api/orders/track?order_number=${encodeURIComponent(
          trackOrderId.trim()
        )}&phone=${encodeURIComponent(trackPhone.trim())}`
      );
      const data = await res.json();
      if (!res.ok) {
        setTrackError(data.error || 'Order lookup failed');
        return;
      }

      setTrackResult(data.order);
    } catch (err: any) {
      setTrackError('Error connecting to tracking service');
    } finally {
      setTrackLoading(false);
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('9294646050@ybl');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const jaoraNeighborhoods = [
    'Station Road',
    'Bajaj Khana',
    'Piploda Road',
    'Jawahar Path',
    'Church Road',
    'Hathikhana',
    'Court Colony',
    'Railway Station Area',
    'Hospital Road',
  ];

  const upiPayUrl = `upi://pay?pa=9294646050@ybl&pn=NIMIT%20JAIN&am=${Math.round(
    total
  )}&cu=INR&tn=Jai%20Jinendra%20Grocery%20Order`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      {/* 1. Checkout Success View */}
      {placedOrder ? (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-emerald-200 shadow-xl p-6 sm:p-10 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              {t('orderSuccessTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              {t('orderSuccessDesc')}
            </p>
          </div>

          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-gray-200 text-left space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between pb-2 border-b border-gray-200">
              <span className="text-slate-500 font-medium">{t('orderId')}:</span>
              <span className="font-mono font-bold text-emerald-900 text-base">
                {placedOrder.order_number}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t('orderStatus')}:</span>
              <span className="font-bold text-emerald-700 uppercase bg-emerald-100 px-2 py-0.5 rounded text-xs">
                {t('statusReceived')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t('estimatedDelivery')}:</span>
              <span className="font-bold text-slate-800">{t('estimatedDeliveryVal')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Delivery Address:</span>
              <span className="font-semibold text-slate-800 text-right max-w-xs truncate">
                {placedOrder.delivery_address}, Jaora ({placedOrder.pincode})
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200 text-base font-extrabold text-slate-900">
              <span>{t('total')}:</span>
              <span className="text-emerald-800">₹{placedOrder.total}</span>
            </div>
          </div>

          {/* If PhonePe UPI payment was chosen, show PhonePe QR Card */}
          {placedOrder.payment_method === 'demo_upi' && (
            <div className="bg-purple-50 border border-purple-200 p-5 rounded-2xl space-y-4 text-center">
              <div className="flex items-center justify-center gap-2 text-purple-900 font-bold text-sm">
                <span>📱 Scan & Pay via PhonePe QR</span>
              </div>

              <div className="flex flex-col items-center justify-center space-y-2">
                <img
                  src="/images/phonepe-qr.jpg"
                  alt="PhonePe QR Nimit Jain"
                  className="w-48 h-auto rounded-xl shadow-md border border-purple-300"
                />
                <span className="text-xs font-mono font-bold text-purple-950">
                  PAYEE: NIMIT JAIN
                </span>
              </div>

              <a
                href={`upi://pay?pa=9294646050@ybl&pn=NIMIT%20JAIN&am=${placedOrder.total}&cu=INR&tn=Order%20${placedOrder.order_number}`}
                className="w-full bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow transition"
              >
                <span>Tap to Pay ₹{placedOrder.total} on PhonePe / GPay / Paytm App</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          )}

          {/* WhatsApp CTA Button */}
          {whatsappUrl && (
            <div className="space-y-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 transition transform active:scale-95"
              >
                <Phone className="w-5 h-5" />
                <span>{t('whatsappOrderButton')}</span>
              </a>
              <p className="text-[11px] text-slate-400">
                Clicking opens WhatsApp with your pre-formatted order details for instant confirmation.
              </p>
            </div>
          )}

          <div className="pt-2 flex justify-center gap-4 text-xs font-semibold">
            <Link href="/shop" className="text-emerald-800 hover:underline">
              Continue Shopping
            </Link>
            <span>•</span>
            <button
              onClick={() => {
                setTrackOrderId(placedOrder.order_number);
                setTrackPhone(placedOrder.customer_phone);
                setPlacedOrder(null);
              }}
              className="text-amber-800 hover:underline"
            >
              Track This Order
            </button>
          </div>
        </div>
      ) : (
        /* 2. Standard Checkout Form */
        <div>
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              {t('checkoutTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Complete your Jaora local grocery delivery order
            </p>
          </div>

          {items.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto">
              <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">{t('emptyCart')}</h3>
              <p className="text-xs text-slate-500">{t('emptyCartSub')}</p>
              <Link
                href="/shop"
                className="inline-block bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition"
              >
                {t('startShopping')}
              </Link>
            </div>
          ) : (
            <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Form: Details & Payment */}
              <div className="lg:col-span-7 space-y-6">
                {/* Customer Information & Jaora Delivery Address */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-slate-900">
                      1. {t('customerInfo')} & Delivery Location
                    </h3>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Jaora+Madhya+Pradesh+457226"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                    >
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Find on Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        {t('fullName')} *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Ramesh Kumar Jain"
                        className={`w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:bg-white text-slate-800 ${
                          formErrors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.name && (
                        <span className="text-[11px] text-red-500 font-medium">
                          {formErrors.name}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          {t('mobileNumber')} *
                        </label>
                        <input
                          type="tel"
                          maxLength={10}
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="e.g. 9826012345"
                          className={`w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:bg-white text-slate-800 font-mono ${
                            formErrors.phone ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.phone && (
                          <span className="text-[11px] text-red-500 font-medium">
                            {formErrors.phone}
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Email (Optional)
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="customer@example.com"
                          className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl outline-none focus:bg-white text-slate-800"
                        />
                      </div>
                    </div>

                    {/* Quick Jaora Neighborhood Selectors */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-slate-600 block">
                        📍 Select Jaora Locality / Ward (Click to add):
                      </span>
                      <div className="flex flex-wrap gap-1.5 text-[10px]">
                        {jaoraNeighborhoods.map((area) => (
                          <button
                            key={area}
                            type="button"
                            onClick={() => {
                              const newAddr = formData.address
                                ? `${formData.address}, ${area}`
                                : `${area}, Jaora`;
                              setFormData({
                                ...formData,
                                address: newAddr,
                                landmark: formData.landmark || `Near ${area}`,
                              });
                            }}
                            className="bg-slate-100 hover:bg-emerald-100 border border-gray-300 hover:border-emerald-400 text-slate-700 hover:text-emerald-900 px-2 py-1 rounded-lg transition"
                          >
                            + {area}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        {t('deliveryAddress')} *
                      </label>
                      <textarea
                        rows={2}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="House / Flat No., Street, Ward / Mohalla, Jaora"
                        className={`w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:bg-white text-slate-800 ${
                          formErrors.address ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.address && (
                        <span className="text-[11px] text-red-500 font-medium">
                          {formErrors.address}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          {t('landmark')}
                        </label>
                        <input
                          type="text"
                          value={formData.landmark}
                          onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                          placeholder="Near Station / Jain Mandir / Bus Stand"
                          className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl outline-none focus:bg-white text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          {t('pincode')} *
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={formData.pincode}
                          onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                          className={`w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:bg-white text-slate-800 font-mono ${
                            formErrors.pincode ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        {t('deliveryNote')}
                      </label>
                      <input
                        type="text"
                        value={formData.deliveryNote}
                        onChange={(e) => setFormData({ ...formData, deliveryNote: e.target.value })}
                        placeholder="e.g. Please call before arriving or leave with neighbor"
                        className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl outline-none focus:bg-white text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Selection */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-base text-slate-900">
                    2. Select Payment Method
                  </h3>

                  <div className="space-y-3">
                    {/* Option 1: PhonePe / UPI QR */}
                    <label
                      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                        formData.paymentMethod === 'demo_upi'
                          ? 'border-purple-600 bg-purple-50/60 shadow-sm'
                          : 'border-gray-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="demo_upi"
                        checked={formData.paymentMethod === 'demo_upi'}
                        onChange={() => setFormData({ ...formData, paymentMethod: 'demo_upi' })}
                        className="mt-1 text-purple-700"
                      />
                      <div className="flex-1">
                        <span className="font-bold text-sm text-slate-900 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            📱 <span>PhonePe / UPI / QR Code Payment</span>
                          </span>
                          <span className="bg-purple-700 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                            INSTANT
                          </span>
                        </span>
                        <span className="text-xs text-slate-500">
                          Scan PhonePe QR code or tap to pay via PhonePe, GPay, or Paytm
                        </span>
                      </div>
                    </label>

                    {/* Option 2: COD */}
                    <label
                      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                        formData.paymentMethod === 'cod'
                          ? 'border-emerald-600 bg-emerald-50/50'
                          : 'border-gray-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === 'cod'}
                        onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                        className="mt-1 text-emerald-700"
                      />
                      <div>
                        <span className="font-bold text-sm text-slate-900 block">
                          💵 Cash on Delivery (COD)
                        </span>
                        <span className="text-xs text-slate-500">Pay cash to delivery person upon arrival in Jaora</span>
                      </div>
                    </label>
                  </div>

                  {/* PhonePe QR & Dynamic UPI Payment Card */}
                  {formData.paymentMethod === 'demo_upi' && (
                    <div className="p-5 bg-gradient-to-br from-purple-50 via-slate-50 to-indigo-50 border border-purple-200 rounded-2xl space-y-4 text-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-purple-200">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-purple-700 text-white flex items-center justify-center font-bold text-xs">
                            पे
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-xs">PhonePe Official Merchant QR</h4>
                            <p className="text-[10px] text-purple-900 font-mono font-bold">NIMIT JAIN</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyUpi}
                          className="bg-white hover:bg-purple-100 text-purple-900 font-bold text-[10px] px-2.5 py-1 rounded-lg border border-purple-300 flex items-center gap-1 transition"
                        >
                          {copiedUpi ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedUpi ? 'Copied!' : 'Copy UPI ID'}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                        {/* PhonePe Official QR Image */}
                        <div className="sm:col-span-6 bg-white p-3 rounded-xl border border-purple-200 flex flex-col items-center justify-center text-center shadow-sm">
                          <img
                            src="/images/phonepe-qr.jpg"
                            alt="PhonePe QR Code Nimit Jain"
                            className="w-44 h-auto rounded-lg shadow-sm border border-purple-200"
                          />
                          <span className="text-[10px] font-bold text-purple-950 mt-1">
                            ACCEPTED HERE • PHONEPE
                          </span>
                        </div>

                        {/* Direct Payment Link & Info */}
                        <div className="sm:col-span-6 space-y-3">
                          <div className="bg-white p-3 rounded-xl border border-purple-100 space-y-1.5 font-mono text-[11px]">
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-sans text-[10px]">Merchant:</span>
                              <span className="font-bold text-slate-800">NIMIT JAIN</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-sans text-[10px]">UPI ID:</span>
                              <span className="font-bold text-purple-900 bg-purple-50 px-1.5 py-0.5 rounded">9294646050@ybl</span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-gray-100 font-sans font-bold text-xs">
                              <span>Amount Payable:</span>
                              <span className="text-purple-900 text-sm">₹{Math.round(total)}</span>
                            </div>
                          </div>

                          <a
                            href={upiPayUrl}
                            className="w-full bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs py-3 px-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md transition transform active:scale-95 text-center"
                          >
                            <span>📲 Pay ₹{Math.round(total)} via PhonePe App</span>
                            <ArrowRight className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Summary Column */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-base text-slate-900 pb-2 border-b border-gray-100">
                    Order Summary ({items.length} {t('items')})
                  </h3>

                  {/* Items List */}
                  <div className="max-h-56 overflow-y-auto divide-y divide-gray-100 text-xs">
                    {items.map((it) => (
                      <div key={it.product.id} className="py-2.5 flex justify-between items-center">
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-slate-900 truncate">
                            {lang === 'hi' ? it.product.name_hi : it.product.name_en}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {it.product.unit} × {it.quantity}
                          </p>
                        </div>
                        <span className="font-bold text-slate-800 flex-shrink-0">
                          ₹{it.product.selling_price * it.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Breakdown */}
                  <div className="space-y-2 text-xs pt-2 border-t border-gray-100">
                    <div className="flex justify-between text-slate-600">
                      <span>{t('subtotal')}</span>
                      <span className="font-semibold text-slate-800">₹{Math.round(subtotal)}</span>
                    </div>

                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>
                          {t('discount')} ({appliedCoupon?.code})
                        </span>
                        <span>-₹{Math.round(couponDiscount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-600">
                      <span>{t('deliveryFee')}</span>
                      <span>
                        {deliveryFee === 0 ? (
                          <span className="text-emerald-700 font-bold">{t('free')}</span>
                        ) : (
                          `₹${deliveryFee}`
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-gray-200">
                      <span>{t('total')}</span>
                      <span className="text-emerald-800 text-lg">₹{Math.round(total)}</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isPlacing}
                    className="w-full bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-700/20 transition transform active:scale-98 disabled:opacity-50"
                  >
                    {isPlacing ? t('placingOrder') : `${t('placeOrder')} • ₹${Math.round(total)}`}
                  </button>

                  <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Safe local order placement directly with Jaora store</span>
                  </p>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* 3. Secure Order Lookup / Tracking Section */}
      <section id="track" className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-10 space-y-6">
        <div className="max-w-xl mx-auto text-center space-y-2">
          <div className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-3 py-1 rounded-full text-xs font-bold">
            <Search className="w-3.5 h-3.5 text-amber-700" />
            <span>{t('trackYourOrder')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {lang === 'hi' ? 'अपने ऑर्डर की स्थिति जानें' : 'Check Real-Time Order Status'}
          </h2>
          <p className="text-xs text-slate-500">
            {t('orderPrivacyNote')}
          </p>
        </div>

        {/* Tracking Lookup Form */}
        <form onSubmit={handleTrackSubmit} className="max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-12 gap-3">
          <input
            type="text"
            value={trackOrderId}
            onChange={(e) => setTrackOrderId(e.target.value)}
            placeholder={t('enterOrderId')}
            className="sm:col-span-5 p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-mono outline-none focus:bg-white text-slate-800"
          />
          <input
            type="tel"
            maxLength={10}
            value={trackPhone}
            onChange={(e) => setTrackPhone(e.target.value)}
            placeholder={t('enterPhone')}
            className="sm:col-span-4 p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-mono outline-none focus:bg-white text-slate-800"
          />
          <button
            type="submit"
            disabled={trackLoading}
            className="sm:col-span-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition"
          >
            {trackLoading ? '...' : t('trackBtn')}
          </button>
        </form>

        {trackError && (
          <div className="max-w-xl mx-auto p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 text-center font-medium">
            {trackError}
          </div>
        )}

        {/* Tracking Timeline Output */}
        {trackResult && (
          <div className="max-w-2xl mx-auto bg-slate-50 rounded-2xl p-6 border border-gray-200 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-2">
              <div>
                <span className="text-xs text-slate-500">Order Reference:</span>
                <h4 className="font-mono font-black text-emerald-900 text-base">
                  {trackResult.order_number}
                </h4>
              </div>
              <div className="sm:text-right">
                <span className="text-xs text-slate-500 block">Status:</span>
                <span className="inline-block bg-emerald-100 text-emerald-800 font-extrabold text-xs px-2.5 py-0.5 rounded-full uppercase">
                  {trackResult.order_status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* Visual Workflow Steps */}
            <div>
              <h5 className="text-xs font-bold text-slate-600 mb-4">Delivery Progress:</h5>
              <div className="grid grid-cols-5 gap-1 text-center">
                {trackResult.timeline?.map((step: any, idx: number) => {
                  const labels: Record<string, string> = {
                    received: 'Received',
                    confirmed: 'Confirmed',
                    preparing: 'Packing',
                    out_for_delivery: 'Out for Delivery',
                    delivered: 'Delivered',
                  };
                  return (
                    <div key={idx} className="flex flex-col items-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 ${
                          step.completed
                            ? 'bg-emerald-700 text-white'
                            : step.current
                            ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-200'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-700 leading-tight">
                        {labels[step.status] || step.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 4. Contact & Jaora Google Maps Location Section */}
      <section id="contact" className="bg-gradient-to-r from-emerald-50 via-white to-green-50 rounded-3xl border border-emerald-200 p-6 sm:p-10 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">{t('storeLocationTitle')}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('storeLocationVal')}
              </p>
            </div>

            <div className="space-y-1 text-xs text-slate-600">
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Store Hours: 8:00 AM - 9:30 PM (Everyday)</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-700" />
                <span>Support Phone / WhatsApp: <strong>9294646050</strong></span>
              </p>
            </div>

            <div className="pt-2">
              <a
                href="https://www.google.com/maps/search/?api=1&query=Jaora+Madhya+Pradesh+457226"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition"
              >
                <MapPin className="w-4 h-4" />
                <span>Open Jaora Location in Google Maps App</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Interactive Embedded Google Maps for Jaora City */}
          <div className="lg:col-span-7 h-64 sm:h-80 rounded-2xl overflow-hidden border border-gray-300 shadow-md">
            <iframe
              title="Jaora Madhya Pradesh Store Location"
              src="https://maps.google.com/maps?q=Jaora,+Madhya+Pradesh+457226&t=&z=14&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
