'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, ArrowUpDown, X, Filter } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Product, Category } from '@/lib/types';
import ProductCard from '@/components/ProductCard';

function ShopContent() {
  const { lang, t } = useLanguage();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(400);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [catRes, prodRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/products?limit=100'),
        ]);
        const catData = await catRes.json();
        const prodData = await prodRes.json();
        if (catData.categories) setCategories(catData.categories);
        if (prodData.products) setProducts(prodData.products);
      } catch (err) {
        console.error('Failed to load shop products', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Update selectedCategory if URL search param changes
  useEffect(() => {
    const urlCat = searchParams.get('category');
    if (urlCat) setSelectedCategory(urlCat);
    const urlSearch = searchParams.get('search');
    if (urlSearch) setSearchQuery(urlSearch);
  }, [searchParams]);

  // Client Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory !== 'all' && p.category_id !== selectedCategory) {
          return false;
        }
        // In-stock filter
        if (inStockOnly && p.stock_quantity <= 0) {
          return false;
        }
        // Max Price filter
        if (p.selling_price > maxPrice) {
          return false;
        }
        // Search filter (English, Hindi, SKU)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchEn = p.name_en.toLowerCase().includes(q);
          const matchHi = p.name_hi.includes(q);
          const matchSku = p.sku.toLowerCase().includes(q);
          const matchDesc =
            p.description_en?.toLowerCase().includes(q) || p.description_hi?.includes(q);
          if (!matchEn && !matchHi && !matchSku && !matchDesc) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.selling_price - b.selling_price;
        if (sortBy === 'price_desc') return b.selling_price - a.selling_price;
        if (sortBy === 'name') return a.name_en.localeCompare(b.name_en);
        // Default: featured first, then sort_order
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return a.sort_order - b.sort_order;
      });
  }, [products, selectedCategory, inStockOnly, maxPrice, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Shop Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {t('navShop')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {lang === 'hi'
              ? 'जावरा शहर में उपलब्ध 50 दैनिक किराना उत्पाद — शुद्ध आटा, दालें, मसाले, तेल और प्रसाधन'
              : 'Showing 50 daily grocery items delivered fast across Jaora, MP'}
          </p>
        </div>

        {/* Search & Mobile Filter Trigger */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full bg-white border border-gray-300 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm outline-none focus:border-emerald-600 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="md:hidden bg-white border border-gray-300 p-2 rounded-xl text-slate-700 hover:bg-slate-50 shadow-sm flex items-center gap-1.5 text-xs font-bold"
          >
            <Filter className="w-4 h-4 text-emerald-700" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-6">
        {/* Sidebar Filters (Desktop) */}
        <aside className="hidden md:block space-y-6">
          {/* Category Filter */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
              <span>{t('allCategories')}</span>
            </h3>
            <div className="space-y-1 text-xs">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-3 py-2 rounded-lg font-semibold transition ${
                  selectedCategory === 'all'
                    ? 'bg-emerald-800 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {t('allCategories')} ({products.length})
              </button>
              {categories.map((cat) => {
                const count = products.filter((p) => p.category_id === cat.id).length;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg font-semibold transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-800 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{lang === 'hi' ? cat.name_hi : cat.name_en}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900">{t('filterByPrice')}</h3>
            <div className="space-y-2">
              <input
                type="range"
                min={20}
                max={400}
                step={10}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-emerald-700 cursor-pointer"
              />
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>₹20</span>
                <span className="text-emerald-800">Up to ₹{maxPrice}</span>
              </div>
            </div>
          </div>

          {/* Stock Filter Toggle */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600"
              />
              <span>{t('inStockOnly')}</span>
            </label>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="md:col-span-3 space-y-4">
          {/* Top Sort Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-slate-600">
              {filteredProducts.length} {t('items')} found
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-slate-500 flex items-center gap-1 font-medium">
                <ArrowUpDown className="w-3.5 h-3.5" />
                {t('sortBy')}:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-gray-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 outline-none focus:border-emerald-600"
              >
                <option value="featured">{t('sortFeatured')}</option>
                <option value="price_asc">{t('sortPriceLow')}</option>
                <option value="price_desc">{t('sortPriceHigh')}</option>
                <option value="name">{t('sortName')}</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-slate-100 h-64 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-slate-400 space-y-3">
              <Search className="w-12 h-12 mx-auto text-slate-300" />
              <p className="font-bold text-slate-700 text-base">No grocery products matched</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try clearing your search keyword, adjusting the price slider, or selecting another category.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setMaxPrice(400);
                  setInStockOnly(false);
                }}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="w-80 bg-white h-full p-5 overflow-y-auto space-y-6 shadow-2xl flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <h3 className="font-bold text-base text-slate-900">Filters</h3>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div>
                <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-2">
                  {t('allCategories')}
                </h4>
                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setIsMobileFiltersOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg font-semibold ${
                      selectedCategory === 'all'
                        ? 'bg-emerald-800 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCategory(c.id);
                        setIsMobileFiltersOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg font-semibold ${
                        selectedCategory === c.id
                          ? 'bg-emerald-800 text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {lang === 'hi' ? c.name_hi : c.name_en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-2">
                  {t('filterByPrice')}
                </h4>
                <input
                  type="range"
                  min={20}
                  max={400}
                  step={10}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-emerald-700 cursor-pointer"
                />
                <div className="flex justify-between text-xs font-bold text-slate-700 mt-1">
                  <span>₹20</span>
                  <span className="text-emerald-800">Up to ₹{maxPrice}</span>
                </div>
              </div>

              {/* In Stock */}
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-700"
                />
                <span>{t('inStockOnly')}</span>
              </label>
            </div>

            <button
              onClick={() => setIsMobileFiltersOpen(false)}
              className="w-full bg-emerald-800 text-white font-bold py-2.5 rounded-xl text-xs"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading Jaora Grocery Mart...</div>}>
      <ShopContent />
    </Suspense>
  );
}
