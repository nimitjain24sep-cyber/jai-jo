'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, ShoppingCart, Search, Phone } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

export default function MobileBottomDock() {
  const pathname = usePathname();
  const { itemCount, subtotal, setIsCartOpen } = useCart();
  const { lang, t } = useLanguage();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-safe">
      <div className="grid grid-cols-5 items-center text-center py-2 px-1">
        {/* 1. Home */}
        <Link
          href="/"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition ${
            pathname === '/' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>{t('navHome')}</span>
        </Link>

        {/* 2. Shop */}
        <Link
          href="/shop"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition ${
            pathname === '/shop' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span>{t('navShop')}</span>
        </Link>

        {/* 3. Cart Trigger */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center gap-0.5 text-[10px] font-semibold text-slate-700 relative"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-800 text-white flex items-center justify-center shadow-md -mt-3 border-2 border-white">
              <ShoppingCart className="w-4 h-4" />
            </div>
            {itemCount > 0 && (
              <span className="absolute -top-3.5 -right-1.5 bg-amber-500 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full border border-white shadow">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-emerald-900 font-extrabold text-[10px]">
            {subtotal > 0 ? `₹${Math.round(subtotal)}` : t('cart')}
          </span>
        </button>

        {/* 4. Track Order */}
        <Link
          href="/checkout#track"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition ${
            pathname.includes('checkout') ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Search className="w-5 h-5" />
          <span>{t('navTrack')}</span>
        </Link>

        {/* 5. WhatsApp Support */}
        <a
          href="https://wa.me/919294646050?text=Hello%20Jai%20Jinendra%20Grocery%20Mart,%20I%20need%20help%20with%20my%20order."
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-0.5 text-[10px] font-semibold text-emerald-800"
        >
          <Phone className="w-5 h-5 text-emerald-700" />
          <span>Help</span>
        </a>
      </div>
    </div>
  );
}
