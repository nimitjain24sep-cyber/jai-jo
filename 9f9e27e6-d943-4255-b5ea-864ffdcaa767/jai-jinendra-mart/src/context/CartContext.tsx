'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Coupon } from '@/lib/types';

export interface CartItemData {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItemData[];
  addToCart: (product: Product, quantity?: number) => { success: boolean; message?: string };
  updateQuantity: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  itemCount: number;
  subtotal: number;
  mrpTotal: number;
  savings: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  amountNeededForFreeDelivery: number;
  appliedCoupon: Coupon | null;
  couponDiscount: number;
  applyCouponCode: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const FREE_DELIVERY_THRESHOLD = 499;
const STANDARD_DELIVERY_FEE = 30;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemData[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('jjm_cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('jjm_cart', JSON.stringify(items));
    } catch (e) {}
  }, [items]);

  const addToCart = (product: Product, quantity: number = 1) => {
    if (product.stock_quantity <= 0) {
      return { success: false, message: 'Product is out of stock' };
    }

    const existingIndex = items.findIndex((i) => i.product.id === product.id);
    if (existingIndex > -1) {
      const currentQty = items[existingIndex].quantity;
      const newQty = currentQty + quantity;
      if (newQty > product.stock_quantity) {
        return {
          success: false,
          message: `Cannot add more. Only ${product.stock_quantity} available in stock.`,
        };
      }
      const updated = [...items];
      updated[existingIndex].quantity = newQty;
      setItems(updated);
      return { success: true };
    } else {
      if (quantity > product.stock_quantity) {
        return {
          success: false,
          message: `Cannot add ${quantity}. Only ${product.stock_quantity} available in stock.`,
        };
      }
      setItems([...items, { product, quantity }]);
      return { success: true };
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === productId);
      if (!existing) return prev;

      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        return prev.filter((i) => i.product.id !== productId);
      }
      if (newQty > existing.product.stock_quantity) {
        return prev;
      }
      return prev.map((i) => (i.product.id === productId ? { ...i, quantity: newQty } : i));
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.selling_price * item.quantity, 0);
  const mrpTotal = items.reduce((sum, item) => sum + item.product.mrp * item.quantity, 0);
  const savings = Math.max(0, mrpTotal - subtotal);

  const deliveryFee = subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
  const amountNeededForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);

  // Calculate coupon discount
  let couponDiscount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.min_order_amount) {
    if (appliedCoupon.discount_type === 'percentage') {
      const disc = (subtotal * appliedCoupon.discount_value) / 100;
      couponDiscount = appliedCoupon.max_discount ? Math.min(disc, appliedCoupon.max_discount) : disc;
    } else {
      couponDiscount = Math.min(appliedCoupon.discount_value, subtotal);
    }
  }

  const total = Math.max(0, subtotal - couponDiscount + deliveryFee);

  const applyCouponCode = async (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: cleanCode, subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon(data.coupon);
        return { success: true, message: data.message || 'Coupon applied!' };
      } else {
        return { success: false, message: data.message || 'Invalid coupon' };
      }
    } catch (e) {
      return { success: false, message: 'Could not validate coupon' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        itemCount,
        subtotal,
        mrpTotal,
        savings,
        deliveryFee,
        freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
        amountNeededForFreeDelivery,
        appliedCoupon,
        couponDiscount,
        applyCouponCode,
        removeCoupon,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
