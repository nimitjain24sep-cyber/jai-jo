'use client';

import React from 'react';
import { X, Plus, Minus, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

interface ProductModalProps {
  product: Product;
  inCartQty: number;
  onClose: () => void;
}

export default function ProductModal({ product, inCartQty, onClose }: ProductModalProps) {
  const { addToCart, updateQuantity } = useCart();
  const { lang, t } = useLanguage();

  const isOutOfStock = product.stock_quantity <= 0;
  const imgUrl =
    product.image_urls && product.image_urls[0]
      ? product.image_urls[0]
      : 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-white/90 hover:bg-white text-slate-700 p-1.5 rounded-full shadow-md transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image */}
        <div className="relative w-full h-56 bg-slate-100 flex-shrink-0">
          <img src={imgUrl} alt={product.name_en} className="w-full h-full object-cover" />
          {product.discount_percent > 0 && (
            <span className="absolute bottom-3 left-3 bg-amber-500 text-white font-extrabold text-xs px-2.5 py-1 rounded shadow">
              {product.discount_percent}% OFF
            </span>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                {product.unit}
              </span>
              <span className="text-xs text-slate-500 font-mono">SKU: {product.sku}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {lang === 'hi' ? product.name_hi : product.name_en}
            </h2>
            {lang === 'hi' ? (
              <p className="text-xs text-slate-500 font-medium">{product.name_en}</p>
            ) : (
              <p className="text-xs text-slate-500 font-medium">{product.name_hi}</p>
            )}
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 p-3 bg-slate-50 rounded-xl border border-gray-100">
            <span className="text-2xl font-black text-emerald-900">₹{product.selling_price}</span>
            {product.mrp > product.selling_price && (
              <>
                <span className="text-sm text-slate-400 line-through">MRP ₹{product.mrp}</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  {t('savePercent', { n: product.discount_percent })}
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              {t('viewDetails')}
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              {lang === 'hi'
                ? product.description_hi || product.description_en
                : product.description_en}
            </p>
          </div>

          {/* Regulatory & Compliance Specs */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-gray-100">
            <div>
              <span className="text-slate-400 block">{t('hsn')}:</span>
              <span className="font-semibold text-slate-800">{product.hsn_code}</span>
            </div>
            <div>
              <span className="text-slate-400 block">{t('gstRate')}:</span>
              <span className="font-semibold text-slate-800">{product.gst_rate}% GST included</span>
            </div>
            <div>
              <span className="text-slate-400 block">Stock Available:</span>
              <span className="font-semibold text-slate-800">{product.stock_quantity} units</span>
            </div>
            <div>
              <span className="text-slate-400 block">Delivery Promise:</span>
              <span className="font-semibold text-emerald-700">Same Day (Jaora)</span>
            </div>
          </div>

          {/* Store Guarantees */}
          <div className="flex items-center justify-between text-[11px] text-slate-600 pt-2 border-t border-gray-100">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-700" /> 100% Quality
            </span>
            <span className="flex items-center gap-1">
              <Truck className="w-4 h-4 text-emerald-700" /> Fast Jaora Delivery
            </span>
            <span className="flex items-center gap-1">
              <RefreshCw className="w-4 h-4 text-emerald-700" /> Doorstep Check
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-slate-50 flex items-center justify-between gap-3">
          {isOutOfStock ? (
            <button
              disabled
              className="w-full bg-slate-200 text-slate-400 font-bold py-2.5 rounded-xl cursor-not-allowed"
            >
              {t('outOfStock')}
            </button>
          ) : inCartQty > 0 ? (
            <div className="w-full flex items-center justify-between bg-white border border-emerald-600 rounded-xl px-4 py-2">
              <span className="text-xs font-bold text-slate-700">In Cart:</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateQuantity(product.id, -1)}
                  className="p-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-bold text-sm text-emerald-900">{inCartQty}</span>
                <button
                  onClick={() => updateQuantity(product.id, 1)}
                  disabled={inCartQty >= product.stock_quantity}
                  className="p-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-30"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                addToCart(product, 1);
              }}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl shadow-md transition"
            >
              {t('addToCart')} • ₹{product.selling_price}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
