'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { Listing } from '@/types';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { CommodityImage } from '@/components/ui/CommodityImage';
import {
  Search, ShoppingCart, MapPin, PackageCheck, X, Minus, Plus,
  CheckCircle2, AlertCircle, Grid2X2, List, Leaf, TrendingUp, ShieldCheck
} from 'lucide-react';

const categories = ['All', 'Cereals', 'Pulses', 'Oilseeds', 'Vegetables', 'Fruits', 'Spices', 'Cash Crops', 'Others'];

function categoryFor(name: string) {
  const value = name.toLowerCase();
  if (/green chilli|green chili|tomato|onion|potato|carrot|brinjal|eggplant|okra|lady finger|spinach|cabbage|cauliflower|garlic|vegetable/.test(value)) return 'Vegetables';
  if (/red chilli|red chili|dry chilli|dry chili|turmeric|ginger|cumin|jeera|coriander|pepper|spice/.test(value)) return 'Spices';
  if (/banana|mango|apple|orange|guava|papaya|grapes|watermelon|coconut|fruit/.test(value)) return 'Fruits';
  if (/groundnut|peanut|mustard seed|soybean|sunflower seed|sesame|gingelly|oilseed/.test(value)) return 'Oilseeds';
  if (/pulse|dal|lentil|chickpea|gram|toor|urad|moong|arhar|pea/.test(value)) return 'Pulses';
  if (/sugarcane|cotton|coffee|tea leaves|cash crop/.test(value)) return 'Cash Crops';
  if (/rice|paddy|basmati|wheat|maize|corn|bajra|jowar|sorghum|ragi|millet|grain/.test(value)) return 'Cereals';
  return 'Others';
}

export default function BuyerMarketPage() {
  const [items, setItems] = useState<Listing[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedState, setSelectedState] = useState('All States');
  const [sortBy, setSortBy] = useState('Latest');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Listing | null>(null);
  const [quantity, setQuantity] = useState(0);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const listings = await api.getListings();
      setItems(listings.filter((item) => (item.quantity_available_kg ?? 0) > 0));
    } catch (error) {
      console.error('Failed to load buyer stock', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const getName = (item: Listing) => item.crop_name || item.title || 'Fresh Produce';
  const getPrice = (item: Listing) => item.price_per_kg ?? item.price_per_unit ?? 0;
  const getQty = (item: Listing) => item.quantity_available_kg ?? 0;
  const getMin = (item: Listing) => item.min_order_quantity_kg ?? item.min_order_quantity ?? 1;
  // If remaining stock is below the seller's normal minimum, allow the buyer to clear the remaining stock.
  const getEffectiveMin = (item: Listing) => Math.min(getMin(item), getQty(item));
  const getLocation = (item: Listing) => item.location || 'Location not provided';

  const states = useMemo(() => ['All States', ...Array.from(new Set(items.map((item) => {
    const parts = getLocation(item).split(',').map((part) => part.trim());
    return parts.length > 1 ? parts[parts.length - 1] : parts[0];
  }).filter((part) => part && part !== 'Location not provided'))).sort()], [items]);

  const filtered = useMemo(() => items.filter((item) => {
    const name = getName(item).toLowerCase();
    const location = getLocation(item).toLowerCase();
    const matchesSearch = !search || name.includes(search.toLowerCase()) || location.includes(search.toLowerCase());
    const matchesCategory = category === 'All' || categoryFor(name) === category;
    const matchesState = selectedState === 'All States' || location.endsWith(selectedState.toLowerCase());
    return matchesSearch && matchesCategory && matchesState;
  }).sort((a, b) => {
    if (sortBy === 'Price: Low to High') return getPrice(a) - getPrice(b);
    if (sortBy === 'Price: High to Low') return getPrice(b) - getPrice(a);
    return 0;
  }), [items, search, category, selectedState, sortBy]);

  const openOrder = (item: Listing) => {
    setSelected(item);
    setQuantity(getEffectiveMin(item));
    setMessage('');
  };

  const submitOrder = async () => {
    if (!selected) return;
    const min = getEffectiveMin(selected);
    const max = getQty(selected);
    if (quantity < min || quantity > max) {
      setMessage(`Order between ${min} KG and ${max} KG.`);
      return;
    }
    setSubmitting(true);
    setMessage('');
    try {
      await api.placeOrder({ listing_id: selected.id, quantity, unit: 'kg' });
      setMessage('Order placed successfully.');
      await load();
      setTimeout(() => setSelected(null), 900);
    } catch (error: any) {
      setMessage(error?.message || 'Unable to place this order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const stockValue = items.reduce((sum, item) => sum + getQty(item) * getPrice(item), 0);

  return (
    <ProtectedRoute allowedRoles={['buyer', 'admin']} requireAuth>
      <div className="min-h-full space-y-5">
      <section className="relative overflow-hidden rounded-2xl border border-[#1b3328] bg-gradient-to-r from-[#10281d] via-[#0d1b14] to-[#09110d] p-5 shadow-xl sm:p-6">
        <div className="pointer-events-none absolute -right-8 -top-14 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-700/50 bg-emerald-950/70 px-3 py-1 text-xs font-bold text-emerald-300">
              <Leaf className="h-3.5 w-3.5" /> DIRECT FARM TRADE
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Fresh from the farm market</h1>
            <p className="mt-1.5 max-w-2xl text-sm text-gray-400">Discover verified seller produce, compare prices, and order directly from Indian farmers.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:min-w-[300px]">
            <div className="rounded-xl border border-white/5 bg-black/25 p-3">
              <div className="flex items-center gap-2 text-xs text-gray-400"><PackageCheck className="h-4 w-4 text-emerald-400" /> Available lots</div>
              <p className="mt-1 text-2xl font-black text-white">{items.length}</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/25 p-3">
              <div className="flex items-center gap-2 text-xs text-gray-400"><TrendingUp className="h-4 w-4 text-amber-400" /> Stock value</div>
              <p className="mt-1 text-2xl font-black text-white">₹{stockValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            </div>
          </div>
        </div>
        <div className="relative mt-5 flex flex-col gap-3 lg:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-emerald-400" />
            <input
              aria-label="Search produce"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search crops, mandis, listings..."
              className="w-full rounded-xl border border-[#244235] bg-[#06100b]/80 py-3 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 outline-none focus:border-emerald-400"
            />
          </div>
          <select aria-label="Filter by state or region" value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className="rounded-xl border border-[#20362d] bg-[#080f0c] px-4 py-2.5 text-sm text-gray-200 outline-none transition focus:border-emerald-500">
            {states.map((state) => <option key={state}>{state}</option>)}
          </select>
          <select aria-label="Sort produce listings" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-xl border border-[#20362d] bg-[#080f0c] px-4 py-2.5 text-sm text-gray-200 outline-none transition focus:border-emerald-500">
            <option>Latest</option><option>Price: Low to High</option><option>Price: High to Low</option>
          </select>
          <div className="flex shrink-0 items-center rounded-xl border border-[#20362d] bg-[#080f0c] p-1">
            <button type="button" aria-label="Grid view" aria-pressed={view === 'grid'} onClick={() => setView('grid')} className={`rounded-lg p-2.5 transition ${view === 'grid' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              <Grid2X2 className="h-4 w-4" />
            </button>
            <button type="button" aria-label="List view" aria-pressed={view === 'list'} onClick={() => setView('list')} className={`rounded-lg p-2.5 transition ${view === 'list' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((item) => (
          <button
            key={item}
            onClick={() => setCategory(item)}
            className={`shrink-0 rounded-xl border px-4 py-2 text-sm font-semibold transition ${category === item ? 'border-emerald-500 bg-emerald-500 text-[#05100a] shadow-[0_5px_20px_rgba(16,185,129,.12)]' : 'border-[#1c2f26] bg-[#0e1712] text-gray-300 hover:border-emerald-700 hover:text-emerald-200'}`}
          >
            {item}
          </button>
        ))}
        <span className="ml-auto hidden shrink-0 text-xs text-gray-500 sm:block">{filtered.length} listings</span>
      </div>

      {loading ? (
        <section aria-label="Loading market" className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl border border-[#1e2d26] bg-[#121a16] p-5">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-emerald-500/[0.06] to-transparent" />
            <div className="relative flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-800/40 bg-emerald-950/40">
                <PackageCheck className="h-5 w-5 animate-pulse text-emerald-400" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-32 animate-pulse rounded-full bg-[#24352d]" />
                <div className="h-2.5 w-52 animate-pulse rounded-full bg-[#1b2a23]" />
              </div>
              <div className="ml-auto hidden items-center gap-2 sm:flex">
                <div className="h-8 w-20 animate-pulse rounded-xl bg-[#18241f]" />
                <div className="h-8 w-24 animate-pulse rounded-xl bg-[#18241f]" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((card) => (
              <article key={card} className="relative overflow-hidden rounded-2xl border border-[#1e2d26] bg-[#121a16] p-4">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.1s_infinite] bg-gradient-to-r from-transparent via-white/[0.025] to-transparent" />
                <div className="relative">
                  <div className="h-32 animate-pulse rounded-xl border border-[#1e2d26] bg-[#0d1712]" />
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-28 animate-pulse rounded-full bg-[#24352d]" />
                      <div className="h-2.5 w-36 animate-pulse rounded-full bg-[#1b2a23]" />
                    </div>
                    <div className="h-6 w-16 animate-pulse rounded-full bg-[#1b2a23]" />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="h-16 animate-pulse rounded-xl bg-[#0a0f0d]" />
                    <div className="h-16 animate-pulse rounded-xl bg-[#0a0f0d]" />
                  </div>
                  <div className="mt-3 h-2.5 w-40 animate-pulse rounded-full bg-[#1b2a23]" />
                  <div className="mt-4 h-10 animate-pulse rounded-xl bg-emerald-950/60" />
                </div>
              </article>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-500/80">
            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400" />
            <span>Syncing live produce</span>
            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400 [animation-delay:250ms]" />
          </div>
        </section>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#294238] bg-[#121a16] py-16 text-center">
          <PackageCheck className="mx-auto mb-3 h-8 w-8 text-gray-600" />
          <p className="text-sm font-semibold text-gray-300">No stocked items match your search.</p>
          <p className="mt-1 text-xs text-gray-500">Try another crop or category.</p>
        </div>
      ) : (
        <div className={view === 'grid' ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3' : 'space-y-3'}>
          {filtered.map((item) => {
            const name = getName(item);
            const qty = getQty(item);
            const min = getEffectiveMin(item);
            const price = getPrice(item);
            return (
              <article key={item.id} className={`group overflow-hidden rounded-2xl border border-[#1e2d26] bg-[#121a16] transition hover:border-emerald-800/70 hover:shadow-xl ${view === 'list' ? 'flex flex-col sm:flex-row' : 'flex flex-col'}`}>
                <div className={`relative overflow-hidden border-b border-[#1e2d26] bg-[#0a110d] ${view === 'list' ? 'h-48 sm:h-auto sm:w-64 sm:shrink-0' : 'h-40'}`}>
                  <CommodityImage
                    name={item.crop_name}
                    title={item.title}
                    category={item.crop_category || categoryFor(name)}
                    className="h-full w-full"
                    imageClassName="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/70 px-2.5 py-1 text-[10px] font-semibold text-gray-100 backdrop-blur">
                    <ShieldCheck className="h-3 w-3 text-emerald-400" /> Farmer listing
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-white">{name}</h2>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-gray-500"><MapPin className="h-3 w-3 text-emerald-500" />{getLocation(item)}</p>
                  </div>
                  <span className="rounded-full border border-emerald-800/50 bg-emerald-950/50 px-2 py-1 text-[10px] font-bold text-emerald-300">
                    {item.quality_grade || 'Verified'}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-[#0a0f0d] p-3">
                    <p className="text-[10px] uppercase text-gray-500">Price</p>
                    <p className="mt-1 text-sm font-bold text-emerald-400">₹{price.toLocaleString('en-IN')}<span className="text-[10px] text-gray-500"> / kg</span></p>
                  </div>
                  <div className="rounded-xl bg-[#0a0f0d] p-3">
                    <p className="text-[10px] uppercase text-gray-500">In stock</p>
                    <p className="mt-1 text-sm font-bold text-white">{qty.toLocaleString('en-IN')} kg</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px] text-gray-500">
                  <span>Minimum order: {min} kg</span>
                  <span className="inline-flex items-center gap-1 text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Available now</span>
                </div>
                <button onClick={() => openOrder(item)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-500">
                  <ShoppingCart className="h-4 w-4" /> Order this produce
                </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#294238] bg-[#121a16] p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Quick order</p>
                <h3 className="mt-1 text-lg font-bold text-white">{getName(selected)}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-lg p-2 text-gray-400 hover:bg-[#18241f] hover:text-white"><X className="h-4 w-4" /></button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-xl bg-[#0a0f0d] p-3"><p className="text-gray-500">Price</p><p className="mt-1 font-bold text-emerald-400">₹{getPrice(selected)}/kg</p></div>
              <div className="rounded-xl bg-[#0a0f0d] p-3"><p className="text-gray-500">Stock</p><p className="mt-1 font-bold text-white">{getQty(selected)} kg</p></div>
              <div className="rounded-xl bg-[#0a0f0d] p-3"><p className="text-gray-500">Minimum</p><p className="mt-1 font-bold text-white">{getEffectiveMin(selected)} kg</p></div>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold text-gray-300">Order quantity</p>
              <div className="flex items-center rounded-xl border border-[#1e2d26] bg-[#0a0f0d] p-1">
                <button onClick={() => setQuantity(Math.max(getMin(selected), quantity - getMin(selected)))} className="rounded-lg p-2 text-gray-400 hover:bg-[#18241f] hover:text-white"><Minus className="h-4 w-4" /></button>
                <input type="number" value={quantity} min={getMin(selected)} max={getQty(selected)} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full bg-transparent text-center text-sm font-bold text-white outline-none" />
                <button onClick={() => setQuantity(Math.min(getQty(selected), quantity + getMin(selected)))} className="rounded-lg p-2 text-gray-400 hover:bg-[#18241f] hover:text-white"><Plus className="h-4 w-4" /></button>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-800/40 bg-emerald-950/30 p-3">
              <span className="text-xs text-gray-400">Order total</span>
              <span className="text-lg font-bold text-emerald-400">₹{(quantity * getPrice(selected)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>

            {message && (
              <div className={`mt-3 flex items-center gap-2 rounded-xl p-3 text-xs ${message.includes('successfully') ? 'bg-emerald-950/50 text-emerald-300' : 'bg-red-950/50 text-red-300'}`}>
                {message.includes('successfully') ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                {message}
              </div>
            )}

            <button disabled={submitting} onClick={submitOrder} className="mt-4 w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50">
              {submitting ? 'Placing order...' : 'Confirm order'}
            </button>
          </div>
        </div>
      )}
      </div>
    </ProtectedRoute>
  );
}

// Production buyer market requires an authenticated buyer or admin.
