'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { Listing } from '@/types';
import {
  Search, ShoppingCart, MapPin, PackageCheck, X, Minus, Plus,
  CheckCircle2, AlertCircle, SlidersHorizontal
} from 'lucide-react';

const categories = ['All', 'Vegetables', 'Fruits', 'Grains', 'Pulses', 'Other'];

function categoryFor(name: string) {
  const value = name.toLowerCase();
  if (/tomato|onion|potato|carrot|brinjal|chilli|spinach|vegetable/.test(value)) return 'Vegetables';
  if (/banana|mango|apple|orange|guava|papaya|fruit/.test(value)) return 'Fruits';
  if (/rice|paddy|wheat|maize|corn|bajra|ragi|millet|grain/.test(value)) return 'Grains';
  if (/pulse|dal|lentil|chickpea|gram|toor|urad|moong/.test(value)) return 'Pulses';
  return 'Other';
}

export default function BuyerStockPage() {
  const [items, setItems] = useState<Listing[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
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
  const getLocation = (item: Listing) => item.location || 'Location not provided';

  const filtered = useMemo(() => items.filter((item) => {
    const name = getName(item).toLowerCase();
    const location = getLocation(item).toLowerCase();
    const matchesSearch = !search || name.includes(search.toLowerCase()) || location.includes(search.toLowerCase());
    const matchesCategory = category === 'All' || categoryFor(name) === category;
    return matchesSearch && matchesCategory;
  }), [items, search, category]);

  const openOrder = (item: Listing) => {
    setSelected(item);
    setQuantity(getMin(item));
    setMessage('');
  };

  const submitOrder = async () => {
    if (!selected) return;
    const min = getMin(selected);
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
    <div className="min-h-full space-y-5">
      <section className="rounded-2xl border border-[#1e2d26] bg-[#121a16] p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-emerald-400">
              <PackageCheck className="h-5 w-5" />
              <span className="text-[11px] font-bold uppercase tracking-[0.16em]">AgriMark Stock</span>
            </div>
            <h1 className="text-xl font-bold text-white">Available Produce</h1>
            <p className="mt-1 text-xs text-gray-400">Browse produce currently stocked and listed by verified sellers.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <div className="rounded-xl border border-[#1e2d26] bg-[#0a0f0d] px-4 py-2">
              <p className="text-[10px] uppercase text-gray-500">Items</p>
              <p className="text-sm font-bold text-white">{items.length}</p>
            </div>
            <div className="rounded-xl border border-[#1e2d26] bg-[#0a0f0d] px-4 py-2">
              <p className="text-[10px] uppercase text-gray-500">Stock value</p>
              <p className="text-sm font-bold text-emerald-400">₹{stockValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search produce or location..."
              className="w-full rounded-xl border border-[#1e2d26] bg-[#0a0f0d] py-2.5 pl-9 pr-4 text-sm text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto rounded-xl border border-[#1e2d26] bg-[#0a0f0d] p-1.5">
            <SlidersHorizontal className="ml-2 h-4 w-4 shrink-0 text-gray-500" />
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition ${category === item ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:bg-[#18241f] hover:text-white'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

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

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => {
            const name = getName(item);
            const qty = getQty(item);
            const min = getMin(item);
            const price = getPrice(item);
            return (
              <article key={item.id} className="group rounded-2xl border border-[#1e2d26] bg-[#121a16] p-4 transition hover:-translate-y-0.5 hover:border-emerald-800/70">
                <div className="mb-4 flex h-32 items-center justify-center rounded-xl border border-[#1e2d26] bg-gradient-to-br from-[#183326] to-[#0a0f0d]">
                  <span className="text-4xl">{categoryFor(name) === 'Fruits' ? '🍎' : categoryFor(name) === 'Grains' ? '🌾' : categoryFor(name) === 'Pulses' ? '🫘' : '🥬'}</span>
                </div>
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
                  <span className="text-emerald-500">Available now</span>
                </div>
                <button onClick={() => openOrder(item)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-500">
                  <ShoppingCart className="h-4 w-4" /> Order this produce
                </button>
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
              <div className="rounded-xl bg-[#0a0f0d] p-3"><p className="text-gray-500">Minimum</p><p className="mt-1 font-bold text-white">{getMin(selected)} kg</p></div>
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
  );
}
