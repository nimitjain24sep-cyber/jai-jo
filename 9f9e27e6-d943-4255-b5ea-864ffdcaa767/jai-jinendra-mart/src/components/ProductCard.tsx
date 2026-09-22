'use client';

import React, { useState } from 'react';
import { Plus, Minus, Check, Eye } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import ProductModal from './ProductModal';

export default function ProductCard({ product }: { product: Product }) {
  const { items, addToCart, updateQuantity } = useCart();
  const { lang, t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const cartItem = items.find((i) => i.product.id === product.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;

  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = !isOutOfStock && product.stock_quantity <= product.reorder_level;

  const handleAdd = () => {
    const res = addToCart(product, 1);
    if (res.success) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1200);
    }
  };

  const imgUrl =
    product.image_urls && product.image_urls[0]
      ? product.image_urls[0]
      : 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400';

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between overflow-hidden group">
        {/* Top Image & Badges */}
        <div className="relative w-full pt-[85%] bg-slate-50 overflow-hidden cursor-pointer" onClick={() => setIsModalOpen(true)}>
          <img
            src={imgUrl}
            alt={product.name_en}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-300"
            loading="lazy"
          />

          {/* Discount Badge */}
          {product.discount_percent > 0 && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-extrabold text-[10px] sm:text-xs px-2 py-0.5 rounded-md shadow-sm">
              {product.discount_percent}% OFF
            </div>
          )}

          {/* Quick View Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            className="absolute top-2 right-2 bg-white/95 hover:bg-white text-slate-700 p-2 rounded-full shadow-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition duration-200"
            title={t('viewDetails')}
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {/* Stock Tag */}
          {isOutOfStock ? (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
              <span className="bg-red-600 text-white font-bold text-xs px-3 py-1 rounded-full shadow">
                {t('outOfStock')}
              </span>
            </div>
          ) : isLowStock ? (
            <div className="absolute bottom-2 left-2 bg-red-50 border border-red-200 text-red-700 font-bold text-[10px] px-2 py-0.5 rounded">
              {t('onlyLeft', { n: product.stock_quantity })}
            </div>
          ) : null}
        </div>

        {/* Product Info */}
        <div className="p-3.5 flex-1 flex flex-col justify-between">
          <div>
            <span className="inline-block text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded mb-1.5">
              {product.unit}
            </span>
            <h3
              onClick={() => setIsModalOpen(true)}
              className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-2 cursor-pointer hover:text-emerald-700 leading-snug"
              title={product.name_en}
            >
              {lang === 'hi' ? product.name_hi : product.name_en}
            </h3>
          </div>

          {/* Pricing & Add to Cart Controls */}
          <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-1">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base sm:text-lg font-black text-emerald-900">
                  ₹{product.selling_price}
                </span>
                {product.mrp > product.selling_price && (
                  <span className="text-xs text-slate-400 line-through">
                    ₹{product.mrp}
                  </span>
                )}
              </div>
            </div>

            {/* Cart Button or Stepper */}
            <div>
              {isOutOfStock ? (
                <button
                  disabled
                  className="bg-slate-100 text-slate-400 text-xs font-semibold px-2.5 py-1.5 rounded-lg cursor-not-allowed"
                >
                  {t('outOfStock')}
                </button>
              ) : inCartQty > 0 ? (
                <div className="flex items-center border border-emerald-600 bg-emerald-50 rounded-lg overflow-hidden shadow-sm">
                  <button
                    onClick={() => updateQuantity(product.id, -1)}
                    className="px-2 py-1 text-emerald-800 hover:bg-emerald-100 transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 text-xs font-bold text-emerald-950">{inCartQty}</span>
                  <button
                    onClick={() => updateQuantity(product.id, 1)}
                    disabled={inCartQty >= product.stock_quantity}
                    className="px-2 py-1 text-emerald-800 hover:bg-emerald-100 disabled:opacity-30 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAdd}
                  className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition transform active:scale-95 shadow-sm ${
                    justAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                  }`}
                >
                  {justAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t('addToCart')}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {isModalOpen && (
        <ProductModal
          product={product}
          inCartQty={inCartQty}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
