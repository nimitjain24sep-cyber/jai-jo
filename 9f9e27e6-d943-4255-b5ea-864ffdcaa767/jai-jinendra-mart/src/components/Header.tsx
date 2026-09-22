'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Search, Phone, Shield, Globe, Menu, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const { lang, toggleLang, t } = useLanguage();
  const { itemCount, subtotal, setIsCartOpen } = useCart();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileNavOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur shadow-sm border-b border-gray-100">
      {/* 1. Top Announcement Bar */}
      <div className="bg-gradient-to-r from-emerald-800 via-green-800 to-emerald-900 text-white text-xs py-1.5 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <p className="font-medium tracking-wide flex items-center justify-center gap-1.5">
            <span>{t('announcement')}</span>
          </p>
          <div className="flex items-center gap-3 text-[11px] text-emerald-100">
            <span className="hidden md:inline">🕒 8:00 AM - 9:30 PM</span>
            <a
              href="https://wa.me/919294646050"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 bg-emerald-700/80 hover:bg-emerald-600 px-2 py-0.5 rounded text-white transition font-medium"
            >
              <Phone className="w-3 h-3" /> WhatsApp 9294646050
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Shell */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3 md:gap-6">
          {/* Logo & Store Identity */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center shadow-md text-white font-bold text-lg group-hover:scale-105 transition">
              JJ
            </div>
            <div>
              <span className="block font-extrabold text-base sm:text-lg text-emerald-950 leading-tight">
                {lang === 'hi' ? 'जय जिनेन्द्र किराना मार्ट' : 'Jai Jinendra Grocery Mart'}
              </span>
              <span className="block text-[11px] text-amber-700 font-semibold tracking-wide">
                📍 Jaora (457226), MP • {lang === 'hi' ? 'शुद्ध व ताज़ा' : 'Fresh & Pure'}
              </span>
            </div>
          </Link>

          {/* Search Bar (Desktop) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-lg items-center relative"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full bg-slate-50 border border-gray-300 focus:border-emerald-600 focus:bg-white pl-4 pr-10 py-2 rounded-full text-sm outline-none transition text-slate-800 shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-1.5 p-1.5 bg-emerald-700 text-white rounded-full hover:bg-emerald-800 transition"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Right Action Icons & Toggles */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Switcher */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-full transition shadow-sm"
              title="Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-700" />
              <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>

            {/* Admin Link */}
            <Link
              href="/admin"
              className="hidden lg:flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-emerald-800 px-2 py-1.5 rounded-md hover:bg-slate-100 transition"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{t('navAdmin')}</span>
            </Link>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white px-3.5 py-2 rounded-full font-semibold text-sm shadow-md transition transform active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">{t('cart')}</span>
              {itemCount > 0 && (
                <span className="bg-amber-500 text-slate-950 font-extrabold text-xs px-2 py-0.5 rounded-full shadow-sm">
                  {itemCount}
                </span>
              )}
              {subtotal > 0 && (
                <span className="hidden md:inline text-xs font-bold text-emerald-100">
                  ₹{Math.round(subtotal)}
                </span>
              )}
            </button>

            {/* Mobile Nav Toggle */}
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="md:hidden p-2 text-slate-700 hover:text-emerald-800"
              aria-label="Toggle navigation"
            >
              {isMobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-2.5 md:hidden flex items-center relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full bg-slate-50 border border-gray-300 focus:border-emerald-600 pl-4 pr-10 py-2 rounded-full text-xs outline-none text-slate-800"
          />
          <button
            type="submit"
            className="absolute right-1.5 p-1 bg-emerald-700 text-white rounded-full hover:bg-emerald-800"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Desktop Route Links */}
        <nav className="hidden md:flex items-center justify-start gap-8 mt-3 pt-2 border-t border-gray-100 text-sm font-semibold text-slate-700">
          <Link href="/" className="hover:text-emerald-700 transition">
            {t('navHome')}
          </Link>
          <Link href="/shop" className="hover:text-emerald-700 transition text-emerald-800 font-bold">
            {t('navShop')} (50 {t('items')})
          </Link>
          <Link href="/checkout" className="hover:text-emerald-700 transition">
            {t('navCheckout')}
          </Link>
          <Link href="/checkout#track" className="hover:text-emerald-700 transition text-amber-800">
            🔍 {t('navTrack')}
          </Link>
          <Link href="/checkout#contact" className="hover:text-emerald-700 transition text-slate-600">
            {t('navContact')}
          </Link>
        </nav>

        {/* Mobile Collapsible Menu */}
        {isMobileNavOpen && (
          <div className="md:hidden pt-3 pb-2 mt-2 border-t border-gray-100 flex flex-col gap-2 text-sm font-medium">
            <Link
              href="/"
              onClick={() => setIsMobileNavOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-emerald-50 text-slate-800"
            >
              🏠 {t('navHome')}
            </Link>
            <Link
              href="/shop"
              onClick={() => setIsMobileNavOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-emerald-50 font-bold text-emerald-800"
            >
              🛒 {t('navShop')} (50 {t('items')})
            </Link>
            <Link
              href="/checkout"
              onClick={() => setIsMobileNavOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-emerald-50 text-slate-800"
            >
              💳 {t('navCheckout')}
            </Link>
            <Link
              href="/checkout#track"
              onClick={() => setIsMobileNavOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-emerald-50 text-amber-800 font-semibold"
            >
              🔍 {t('navTrack')}
            </Link>
            <Link
              href="/admin"
              onClick={() => setIsMobileNavOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 flex items-center gap-1.5"
            >
              <Shield className="w-4 h-4 text-emerald-700" /> {t('navAdmin')}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
