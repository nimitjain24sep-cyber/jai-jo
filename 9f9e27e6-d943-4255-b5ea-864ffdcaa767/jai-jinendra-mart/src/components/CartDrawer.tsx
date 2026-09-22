'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, Tag, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

export default function CartDrawer() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    isCartOpen,
    setIsCartOpen,
    subtotal,
    deliveryFee,
    freeDeliveryThreshold,
    amountNeededForFreeDelivery,
    appliedCoupon,
    couponDiscount,
    applyCouponCode,
    removeCoupon,
    total,
  } = useCart();

  const { lang, t } = useLanguage();
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = await applyCouponCode(couponInput);
    setCouponMsg({ text: res.message, isError: !res.success });
  };

  const freeProgress = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-700" />
            <h2 className="font-bold text-slate-800 text-base">
              {t('cart')} ({items.length} {t('items')})
            </h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Bar */}
        <div className="bg-emerald-50 px-4 py-2.5 border-b border-emerald-100">
          {amountNeededForFreeDelivery > 0 ? (
            <div>
              <p className="text-xs font-semibold text-emerald-900">
                {t('freeDeliveryThresholdNote', { amount: Math.round(amountNeededForFreeDelivery) })}
              </p>
              <div className="w-full bg-emerald-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${freeProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs font-bold text-emerald-800 flex items-center gap-1">
              {t('freeDeliveryEligible')}
            </p>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-gray-100">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-400">
              <ShoppingBag className="w-16 h-16 stroke-1 text-slate-300 mb-3" />
              <p className="font-bold text-slate-700 text-base">{t('emptyCart')}</p>
              <p className="text-xs text-slate-400 mt-1 mb-4">{t('emptyCartSub')}</p>
              <Link
                href="/shop"
                onClick={() => setIsCartOpen(false)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2 px-5 rounded-full transition"
              >
                {t('startShopping')}
              </Link>
            </div>
          ) : (
            items.map((item) => {
              const p = item.product;
              const imgUrl = p.image_urls?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200';
              return (
                <div key={p.id} className="py-3 flex gap-3 items-center">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 border border-gray-200">
                    <img src={imgUrl} alt={p.name_en} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-xs text-slate-900 truncate">
                      {lang === 'hi' ? p.name_hi : p.name_en}
                    </h4>
                    <p className="text-[11px] text-slate-500">{p.unit}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-emerald-800 text-xs">
                        ₹{p.selling_price * item.quantity}
                      </span>
                      {p.mrp > p.selling_price && (
                        <span className="text-[10px] text-slate-400 line-through">
                          ₹{p.mrp * item.quantity}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                    <button
                      onClick={() => updateQuantity(p.id, -1)}
                      className="p-1 hover:bg-slate-100 text-slate-600 transition"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2 text-xs font-bold text-slate-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(p.id, 1)}
                      disabled={item.quantity >= p.stock_quantity}
                      className="p-1 hover:bg-slate-100 text-slate-600 disabled:opacity-30 transition"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(p.id)}
                    className="text-slate-300 hover:text-red-600 p-1 transition"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer & Checkout Action */}
        {items.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-slate-50 space-y-3">
            {/* Coupon Section */}
            {!appliedCoupon ? (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Coupon (WELCOME50, JAORA10)"
                    className="w-full bg-white border border-gray-300 rounded-lg text-xs pl-8 pr-2 py-2 outline-none uppercase font-semibold text-slate-700"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg transition"
                >
                  {t('applyCoupon')}
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between bg-emerald-100/70 border border-emerald-300 px-3 py-1.5 rounded-lg text-xs">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-700" /> {appliedCoupon.code} Applied (-₹
                  {Math.round(couponDiscount)})
                </span>
                <button
                  onClick={removeCoupon}
                  className="text-emerald-800 hover:text-red-700 font-bold underline text-[11px]"
                >
                  Remove
                </button>
              </div>
            )}

            {couponMsg && (
              <p
                className={`text-[11px] font-medium ${
                  couponMsg.isError ? 'text-red-600' : 'text-emerald-700'
                }`}
              >
                {couponMsg.text}
              </p>
            )}

            {/* Price Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-600 pt-1">
              <div className="flex justify-between">
                <span>{t('subtotal')}</span>
                <span className="font-semibold text-slate-800">₹{Math.round(subtotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>{t('discount')}</span>
                  <span>-₹{Math.round(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{t('deliveryFee')}</span>
                <span className="font-semibold text-slate-800">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-700 font-bold">{t('free')}</span>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-gray-200">
                <span>{t('total')}</span>
                <span className="text-emerald-800 text-base">₹{Math.round(total)}</span>
              </div>
            </div>

            {/* Proceed to Checkout Button */}
            <Link
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="w-full bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 transition transform active:scale-98"
            >
              <span>{t('proceedToCheckout')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
