'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Phone, MapPin, Clock, Shield, AlertTriangle, ChevronRight, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { lang, t } = useLanguage();
  const [activePolicy, setActivePolicy] = useState<'refund' | 'terms' | 'privacy' | null>(null);

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 mt-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Demo Warning Banner */}
        <div className="mb-8 p-3 rounded-xl bg-amber-950/70 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-300">
              {lang === 'hi' ? 'डेमो ई-कॉमर्स सिस्टम सूचना:' : 'DEMO E-COMMERCE NOTICE:'}
            </p>
            <p className="text-amber-200/90 leading-relaxed text-[11px] mt-0.5">
              {t('demoUpiWarning')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Store Info */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-black text-white text-sm">
                JJ
              </div>
              <h3 className="font-bold text-white text-base">
                {lang === 'hi' ? 'जय जिनेन्द्र किराना मार्ट' : 'Jai Jinendra Grocery Mart'}
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              {t('footerAbout')}
            </p>
            <div className="space-y-2 text-xs text-slate-300">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{t('storeLocationVal')}</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{t('storeHoursVal')}</span>
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white text-sm mb-3.5 tracking-wide">
              {t('footerQuickLinks')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-emerald-400 transition flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-slate-500" /> {t('navHome')}
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-emerald-400 transition flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-slate-500" /> {t('navShop')}
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-emerald-400 transition flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-slate-500" /> {t('navCheckout')}
                </Link>
              </li>
              <li>
                <Link href="/checkout#track" className="hover:text-emerald-400 transition flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-slate-500" /> {t('navTrack')}
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-emerald-400 transition flex items-center gap-1 text-slate-400">
                  <Shield className="w-3 h-3 text-slate-500" /> {t('navAdmin')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care & WhatsApp */}
          <div>
            <h4 className="font-bold text-white text-sm mb-3.5 tracking-wide">
              {t('footerCustomerCare')}
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              {lang === 'hi'
                ? 'जावरा में होम डिलीवरी या किसी भी उत्पाद की जानकारी के लिए तुरंत व्हाट्सएप करें:'
                : 'For fast doorstep delivery or inquiries in Jaora, WhatsApp directly:'}
            </p>
            <a
              href="https://wa.me/919294646050"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition"
            >
              <Phone className="w-4 h-4" /> WhatsApp: 9294646050
            </a>
            <div className="mt-3 text-[11px] text-slate-400">
              <span>{t('fssaiNotice')}</span>
            </div>
          </div>

          {/* Policies & Legal */}
          <div>
            <h4 className="font-bold text-white text-sm mb-3.5 tracking-wide">
              {t('footerLegal')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setActivePolicy('refund')}
                  className="hover:text-emerald-400 transition text-left"
                >
                  • {t('refundPolicy')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicy('terms')}
                  className="hover:text-emerald-400 transition text-left"
                >
                  • {t('termsPolicy')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicy('privacy')}
                  className="hover:text-emerald-400 transition text-left"
                >
                  • {t('privacyPolicy')}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} Jai Jinendra Grocery Mart, Jaora (MP). All rights reserved.</p>
          <p className="text-[11px] text-slate-400">
            {lang === 'hi'
              ? 'बिल्ट फॉर जावरा (मध्य प्रदेश) • सुरक्षित और शुद्ध'
              : 'Built for Jaora, Madhya Pradesh • Fresh & Authentic Local Groceries'}
          </p>
        </div>
      </div>

      {/* Policy Modal */}
      {activePolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white text-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setActivePolicy(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-emerald-950 mb-3">
              {activePolicy === 'refund' && t('refundPolicy')}
              {activePolicy === 'terms' && t('termsPolicy')}
              {activePolicy === 'privacy' && t('privacyPolicy')}
            </h3>
            <div className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
              {activePolicy === 'refund' && (
                <>
                  <p>
                    <strong>Doorstep Inspection:</strong> At Jai Jinendra Grocery Mart, our customers in Jaora can inspect groceries at the time of delivery. If any package is damaged or seal is broken, you can refuse that item or receive an immediate exchange.
                  </p>
                  <p>
                    <strong>Returns within 48 Hours:</strong> Packaged non-perishable goods (pulses, spices, oils) can be returned within 48 hours with original store receipt.
                  </p>
                  <p>
                    <strong>Perishables:</strong> Fresh milk, curd, and bread must be inspected upon delivery.
                  </p>
                </>
              )}
              {activePolicy === 'terms' && (
                <>
                  <p>
                    <strong>Service Area:</strong> Deliveries are strictly limited to Jaora town and surrounding nearby villages (PIN 457226).
                  </p>
                  <p>
                    <strong>Pricing & Taxes:</strong> All product prices in INR include applicable GST slabs (0%, 5%, 12%, or 18% as per Indian GST rules).
                  </p>
                  <p>
                    <strong>Demo Warning:</strong> Digital UPI and QR payments are currently in demonstration mode.
                  </p>
                </>
              )}
              {activePolicy === 'privacy' && (
                <>
                  <p>
                    <strong>Order Privacy:</strong> Order tracking requires both Order ID and matching 10-digit mobile number. We never expose your orders or contact info to third parties.
                  </p>
                  <p>
                    <strong>Contact Usage:</strong> Your mobile number is strictly used for delivery communication and WhatsApp order status updates.
                  </p>
                </>
              )}
            </div>
            <button
              onClick={() => setActivePolicy(null)}
              className="mt-5 w-full bg-emerald-800 text-white font-bold py-2 rounded-xl text-xs hover:bg-emerald-900"
            >
              {t('close')}
            </button>
          </div>
        </div>
      )}
    </footer>
  );
}
