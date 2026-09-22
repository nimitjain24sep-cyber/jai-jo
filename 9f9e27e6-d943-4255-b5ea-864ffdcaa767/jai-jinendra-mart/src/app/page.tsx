'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  ArrowRight,
  Phone,
  Clock,
  MapPin,
  CheckCircle2,
  Sparkles,
  Truck,
  ShieldCheck,
  Percent,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Product, Category } from '@/lib/types';
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
  const { lang, t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/products?limit=8&sort=featured'),
        ]);

        const catData = await catRes.json();
        const prodData = await prodRes.json();

        if (catData.categories) setCategories(catData.categories);
        if (prodData.products) setFeaturedProducts(prodData.products);
      } catch (e) {
        console.error('Failed to load home data', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-10 sm:space-y-14 pb-12">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-950 text-white py-12 sm:py-16 px-4 sm:px-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fde047_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/40 px-3.5 py-1.5 rounded-full text-amber-300 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Jaora, Madhya Pradesh (457226)</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              {t('heroHeading')}
            </h1>

            <p className="text-emerald-100 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {t('heroSubheading')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center lg:justify-start">
              <Link
                href="/shop"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition transform active:scale-95"
              >
                <span>{t('heroShopBtn')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="https://wa.me/919294646050?text=Hello%20Jai%20Jinendra%20Grocery%20Mart,%20I%20want%20to%20order%20groceries%20in%20Jaora."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-700/80 hover:bg-emerald-600 border border-emerald-500/30 text-white font-bold text-sm px-5 py-3.5 rounded-xl flex items-center justify-center gap-2 transition"
              >
                <Phone className="w-4 h-4 text-amber-300" />
                <span>{t('heroWhatsAppBtn')}</span>
              </a>
            </div>

            <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-emerald-200">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400" /> Same Day Home Delivery
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400" /> Cash on Delivery Available
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400" /> 100% Pure & Hygienic
              </span>
            </div>
          </div>

          {/* Hero Promotional Card */}
          <div className="lg:col-span-5">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 sm:p-6 rounded-3xl text-white shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/15">
                <span className="font-bold text-sm tracking-wide text-amber-300 uppercase">
                  ⭐ {lang === 'hi' ? 'आज का विशेष ऑफर' : "Today's Town Offer"}
                </span>
                <span className="text-[11px] bg-amber-500 text-slate-950 font-extrabold px-2.5 py-0.5 rounded-full">
                  FREE DELIVERY
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-xl sm:text-2xl font-black">
                  {lang === 'hi'
                    ? '₹499 से अधिक के ऑर्डर पर मुफ्त होम डिलीवरी'
                    : 'FREE Home Delivery on Orders Above ₹499'}
                </p>
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  {lang === 'hi'
                    ? 'जावरा शहर में स्टेशन रोड स्थित दुकान से 45-60 मिनट में आपके घर।'
                    : 'Dispatched from Station Road shop directly to any address across Jaora within 60 minutes.'}
                </p>
              </div>

              <div className="bg-emerald-950/60 p-3.5 rounded-2xl border border-emerald-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-emerald-300 block font-medium">Use Coupon Code:</span>
                  <span className="font-mono font-black text-amber-400 text-base tracking-wider">WELCOME50</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-emerald-200">Flat ₹50 OFF</span>
                  <span className="block text-[10px] text-slate-400">On cart above ₹300</span>
                </div>
              </div>

              <Link
                href="/shop"
                className="w-full bg-white hover:bg-slate-100 text-emerald-950 font-black text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition"
              >
                <span>{lang === 'hi' ? 'अभी राशन खरीदें' : 'Shop Groceries Now'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-800" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Jaora Delivery Trust Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-emerald-100/70 rounded-xl text-emerald-800">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">{t('trustFreshTitle')}</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{t('trustFreshDesc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-amber-100/70 rounded-xl text-amber-800">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">{t('trustDeliveryTitle')}</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{t('trustDeliveryDesc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-emerald-100/70 rounded-xl text-emerald-800">
              <Percent className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">{t('trustPricesTitle')}</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{t('trustPricesDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Category Browser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">{t('categoriesHeading')}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'hi' ? 'दालें, आटा, मसाले, तेल और दैनिक घरेलू जरूरतें' : 'Daily grocery staples, grains, spices & personal care'}
            </p>
          </div>
          <Link
            href="/shop"
            className="text-emerald-700 hover:text-emerald-800 font-bold text-xs flex items-center gap-1"
          >
            <span>{lang === 'hi' ? 'सभी देखें' : 'View All'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.id}`}
              className="group bg-white hover:bg-emerald-50/60 p-4 rounded-2xl border border-gray-200/80 hover:border-emerald-300 transition duration-200 text-center flex flex-col items-center shadow-sm"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-100/70 group-hover:bg-emerald-200/80 text-emerald-800 flex items-center justify-center font-bold text-base mb-2 group-hover:scale-110 transition duration-200">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="font-bold text-xs text-slate-800 group-hover:text-emerald-900 line-clamp-1">
                {lang === 'hi' ? cat.name_hi : cat.name_en}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {lang === 'hi' ? cat.name_en : cat.name_hi}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Featured Products Shelf */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-800 font-bold text-[10px] px-2 py-0.5 rounded uppercase">
                {lang === 'hi' ? 'सबसे ज्यादा बिकने वाला' : 'Top Selling'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {t('featuredHeading')}
            </h2>
          </div>
          <Link
            href="/shop"
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs px-3.5 py-1.5 rounded-full border border-emerald-200 transition"
          >
            {lang === 'hi' ? 'पूरा कैटलॉग देखें (50 उत्पाद)' : 'View All 50 Products'}
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-slate-100 h-64 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 5. Jaora Local Store Identity & Hours Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              {t('storeLocationTitle')}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              {lang === 'hi' ? 'जय जिनेन्द्र किराना मार्ट, जावरा' : 'Jai Jinendra Grocery Mart, Jaora'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 max-w-xl">
              📍 <strong>{t('storeLocationVal')}</strong>
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-semibold text-slate-800 pt-1">
              <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-amber-200 shadow-sm">
                <Clock className="w-4 h-4 text-amber-600" /> {t('storeHoursVal')}
              </span>
              <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-amber-200 shadow-sm">
                <Phone className="w-4 h-4 text-emerald-600" /> Call / WhatsApp: 9294646050
              </span>
            </div>
          </div>

          <a
            href="https://wa.me/919294646050"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-md transition flex items-center gap-2 flex-shrink-0"
          >
            <Phone className="w-4 h-4" />
            <span>{lang === 'hi' ? 'व्हाट्सएप पर ऑर्डर भेजें' : 'Order via WhatsApp'}</span>
          </a>
        </div>
      </section>
    </div>
  );
}
