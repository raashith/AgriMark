'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { api } from '@/lib/api';
import { Listing, MarketPriceObservation } from '@/types';
import { ShoppingBag, Search, MapPin, CheckCircle2, AlertCircle, Grid2X2, List, Leaf, TrendingUp, ShoppingCart, ShieldCheck } from 'lucide-react';
import { CommodityImage } from '@/components/ui/CommodityImage';

const categories = ['All', 'Cereals', 'Pulses', 'Oilseeds', 'Vegetables', 'Fruits', 'Spices', 'Cash Crops', 'Others'];
const categoryTerms: Record<string, string[]> = {
  Cereals: ['rice', 'paddy', 'wheat', 'maize', 'corn', 'millet', 'bajra', 'jowar', 'ragi'],
  Pulses: ['gram', 'dal', 'lentil', 'chana', 'arhar', 'toor', 'moong', 'urad', 'pea'],
  Oilseeds: ['groundnut', 'peanut', 'mustard', 'soybean', 'sunflower', 'sesame', 'gingelly'],
  Vegetables: ['onion', 'tomato', 'potato', 'brinjal', 'eggplant', 'okra', 'cabbage', 'cauliflower', 'carrot', 'chilli', 'chili', 'garlic'],
  Fruits: ['banana', 'mango', 'grapes', 'orange', 'papaya', 'watermelon', 'coconut'],
  Spices: ['turmeric', 'red chilli', 'red chili', 'cumin', 'coriander', 'ginger', 'pepper'],
  'Cash Crops': ['sugarcane', 'cotton', 'coffee', 'tea'],
};

export default function MarketplacePage() {
  const { t } = useI18n();
  const [listings, setListings] = useState<Listing[]>([]);
  const [prices, setPrices] = useState<MarketPriceObservation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [selectedState, setSelectedState] = useState('All States');
  const [sortBy, setSortBy] = useState('Latest');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [activeListing, setActiveListing] = useState<Listing | null>(null);
  const [orderQty, setOrderQty] = useState('');
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderMessage, setOrderMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetchMarketplaceData = async () => {
      setLoading(true);
      const [listingsRes, pricesRes] = await Promise.allSettled([
        api.getListings(),
        api.getMarketPrices(),
      ]);
      if (cancelled) return;
      if (listingsRes.status === 'fulfilled') setListings(listingsRes.value);
      if (pricesRes.status === 'fulfilled') setPrices(pricesRes.value);
      setLoading(false);
    };
    fetchMarketplaceData().catch((error) => {
      console.error('Marketplace load failed', error);
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const getCropName = (item: Listing) => item.crop_name || item.title || 'Produce';
  const getLocation = (item: Listing) => item.location || 'Location not provided';
  const getMinOrder = (item: Listing) => item.min_order_quantity_kg ?? item.min_order_quantity ?? 0;
  const getAvailableQty = (item: Listing) => item.quantity_available_kg ?? 0;
  const getPricePerKg = (item: Listing) => item.price_per_kg ?? item.price_per_unit ?? 0;
  const states = useMemo(() => ['All States', ...Array.from(new Set(listings.map((item) => {
    const parts = getLocation(item).split(',').map((part) => part.trim());
    return parts.length > 1 ? parts[parts.length - 1] : parts[0];
  }).filter((part) => part && part !== 'Location not provided'))).sort()], [listings]);

  const filteredListings = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return listings.filter((item) => {
      const crop = getCropName(item).toLowerCase();
      const title = (item.title || '').toLowerCase();
      const location = getLocation(item).toLowerCase();
      const matchesSearch = !search || crop.includes(search) || title.includes(search) || location.includes(search);
      const matchesCrop = selectedCrop === 'All' || selectedCrop === 'Others'
        ? selectedCrop === 'All' || !categories.slice(1, -1).some((cat) => (categoryTerms[cat] || []).some((term) => crop.includes(term)))
        : (categoryTerms[selectedCrop] || []).some((term) => crop.includes(term));
      const matchesState = selectedState === 'All States' || location.endsWith(selectedState.toLowerCase());
      return matchesSearch && matchesCrop && matchesState;
    }).sort((a, b) => {
      if (sortBy === 'Price: Low to High') return getPricePerKg(a) - getPricePerKg(b);
      if (sortBy === 'Price: High to Low') return getPricePerKg(b) - getPricePerKg(a);
      return 0;
    });
  }, [listings, searchTerm, selectedCrop, selectedState, sortBy]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeListing) return;
    const minOrder = getMinOrder(activeListing);
    const availableQty = getAvailableQty(activeListing);
    const qty = Number.parseFloat(orderQty);
    if (!qty || qty < minOrder) {
      setOrderMessage(`Error: Minimum order quantity is ${minOrder} KG.`);
      return;
    }
    if (qty > availableQty) {
      setOrderMessage(`Error: Requested quantity exceeds available inventory (${availableQty} KG).`);
      return;
    }
    setOrderSubmitting(true);
    setOrderMessage('');
    try {
      await api.placeOrder({ listing_id: activeListing.id, quantity: qty, unit: 'kg' });
      setOrderMessage('Order placed successfully!');
      window.setTimeout(() => {
        setActiveListing(null);
        setLoading(true);
        Promise.allSettled([api.getListings(), api.getMarketPrices()]).then(([listingResult, priceResult]) => {
          if (listingResult.status === 'fulfilled') setListings(listingResult.value);
          if (priceResult.status === 'fulfilled') setPrices(priceResult.value);
          setLoading(false);
        });
      }, 900);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Please try again.';
      setOrderMessage(`Error: ${message}`);
    } finally {
      setOrderSubmitting(false);
    }
  };

  const controlClass = 'rounded-xl border border-[#20362d] bg-[#080f0c] px-4 py-2.5 text-sm text-gray-200 outline-none transition focus:border-emerald-500';

  return (
    <div className="min-h-full space-y-5 text-gray-100">
      <section className="relative overflow-hidden rounded-2xl border border-[#1b3328] bg-gradient-to-r from-[#10281d] via-[#0d1b14] to-[#09110d] p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-8 -top-14 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-700/50 bg-emerald-950/70 px-3 py-1 text-xs font-bold text-emerald-300">
              <Leaf className="h-3.5 w-3.5" /> DIRECT FARM TRADE
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Fresh from the farm market</h1>
            <p className="mt-1.5 max-w-2xl text-sm text-gray-400">Explore verified produce lots, compare transparent prices, and order directly from farmers.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:min-w-[300px]">
            <div className="rounded-xl border border-white/5 bg-black/25 p-3">
              <div className="flex items-center gap-2 text-xs text-gray-400"><ShoppingBag className="h-4 w-4 text-emerald-400" /> Available lots</div>
              <p className="mt-1 text-2xl font-black text-white">{loading ? '—' : listings.length}</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/25 p-3">
              <div className="flex items-center gap-2 text-xs text-gray-400"><TrendingUp className="h-4 w-4 text-amber-400" /> Market signals</div>
              <p className="mt-1 text-2xl font-black text-white">{loading ? '—' : prices.length}</p>
            </div>
          </div>
        </div>
        <div className="relative mt-5 flex flex-col gap-3 lg:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-emerald-400" />
            <input aria-label="Search produce" type="search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search crops, mandis, listings..." className="w-full rounded-xl border border-[#244235] bg-[#06100b]/80 py-3 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 outline-none focus:border-emerald-400" />
          </div>
          <select aria-label="Filter by state" value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className={controlClass}>{states.map((state) => <option key={state}>{state}</option>)}</select>
          <select aria-label="Sort listings" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={controlClass}><option>Latest</option><option>Price: Low to High</option><option>Price: High to Low</option></select>
          <div className="flex shrink-0 items-center rounded-xl border border-[#20362d] bg-[#080f0c] p-1">
            <button aria-label="Grid view" aria-pressed={view === 'grid'} onClick={() => setView('grid')} className={`rounded-lg p-2.5 transition ${view === 'grid' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'}`}><Grid2X2 className="h-4 w-4" /></button>
            <button aria-label="List view" aria-pressed={view === 'list'} onClick={() => setView('list')} className={`rounded-lg p-2.5 transition ${view === 'list' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'}`}><List className="h-4 w-4" /></button>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => <button key={cat} onClick={() => setSelectedCrop(cat)} className={`shrink-0 rounded-xl border px-4 py-2 text-sm font-semibold transition ${selectedCrop === cat ? 'border-emerald-500 bg-emerald-500 text-[#05100a] shadow-[0_5px_20px_rgba(16,185,129,.12)]' : 'border-[#1c2f26] bg-[#0e1712] text-gray-300 hover:border-emerald-700 hover:text-emerald-200'}`}>{cat}</button>)}
        <span className="ml-auto hidden shrink-0 text-xs text-gray-500 sm:block">{filteredListings.length} listings</span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => <div key={n} className="animate-pulse overflow-hidden rounded-2xl border border-[#1b3026] bg-[#101a14]"><div className="h-40 bg-[#17281e]" /><div className="space-y-3 p-4"><div className="h-4 w-1/2 rounded bg-[#1c2d22]" /><div className="h-10 rounded bg-[#0a100c]" /><div className="h-9 rounded bg-[#0a100c]" /></div></div>)}
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#244034] bg-[#0d1711] px-6 py-14 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-emerald-500/70" />
          <h2 className="mt-3 text-lg font-bold text-white">No produce lots found</h2>
          <p className="mt-1 text-sm text-gray-400">Try another crop, location, or search phrase.</p>
          <button onClick={() => { setSearchTerm(''); setSelectedCrop('All'); setSelectedState('All States'); }} className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500">Clear filters</button>
        </div>
      ) : (
        <div className={view === 'grid' ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3' : 'space-y-3'}>
          {filteredListings.map((item) => {
            const cropName = getCropName(item);
            const location = getLocation(item);
            const minOrder = getMinOrder(item);
            const availableQty = getAvailableQty(item);
            const pricePerKg = getPricePerKg(item);
            return (
              <article key={item.id} className={`group overflow-hidden rounded-2xl border border-[#1b3026] bg-[#101914] transition hover:border-emerald-700/80 hover:shadow-[0_12px_35px_rgba(0,0,0,.22)] ${view === 'list' ? 'flex flex-col sm:flex-row' : 'flex flex-col'}`}>
                <div className={`relative overflow-hidden bg-[#0a110d] ${view === 'list' ? 'h-48 sm:h-auto sm:w-64 sm:shrink-0' : 'h-40 sm:h-44'}`}>
                  <CommodityImage name={item.crop_name} title={item.title} category={item.crop_category} className="h-full w-full" imageClassName="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                  <span className="absolute left-3 top-3 rounded-full border border-emerald-600/50 bg-[#04100bdc] px-2.5 py-1 text-[11px] font-bold text-emerald-300 backdrop-blur">{item.quality_grade || 'Quality verified'}</span>
                  <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/70 px-2.5 py-1 text-[10px] font-semibold text-gray-100 backdrop-blur"><ShieldCheck className="h-3 w-3 text-emerald-400" /> Farmer listing</span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 p-4">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="line-clamp-2 text-lg font-extrabold leading-tight text-white">{cropName}</h2>
                      <span className="shrink-0 rounded-lg border border-emerald-800/70 bg-emerald-950/50 px-2 py-1 text-[10px] font-bold text-emerald-300">{item.crop_category || 'Produce'}</span>
                    </div>
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-400"><MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-400" /><span className="truncate">{location}</span></p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-white/[0.04] bg-[#070e0a] p-3"><span className="text-[10px] uppercase tracking-wider text-gray-500">Price / kg</span><p className="mt-1 text-xl font-black leading-tight text-emerald-400">₹{pricePerKg.toLocaleString('en-IN', { maximumFractionDigits: 2 })}<span className="ml-1 text-xs font-medium text-gray-400">/kg</span></p></div>
                    <div className="rounded-xl border border-white/[0.04] bg-[#070e0a] p-3"><span className="text-[10px] uppercase tracking-wider text-gray-500">In stock</span><p className="mt-1 text-lg font-bold leading-tight text-white">{availableQty.toLocaleString('en-IN')} kg</p></div>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-[11px] text-gray-500"><span>Minimum order: {minOrder} kg</span><span className="inline-flex items-center gap-1 text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Available</span></div>
                  <button onClick={() => { setActiveListing(item); setOrderQty(String(minOrder)); setOrderMessage(''); }} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-500"><ShoppingCart className="h-4 w-4" /> Order this produce</button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {activeListing && (() => {
        const minOrder = getMinOrder(activeListing);
        const availableQty = getAvailableQty(activeListing);
        const pricePerKg = getPricePerKg(activeListing);
        const activeAddr = typeof window !== 'undefined' ? (require('@/lib/delivery-addresses').getActiveSelectedAddressSync()) : null;
        const addressText = activeAddr ? `${activeAddr.house_number}, ${activeAddr.street}, ${activeAddr.area}, ${activeAddr.city} (${activeAddr.postal_code})` : 'Default Delivery Address';
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div role="dialog" aria-modal="true" aria-labelledby="order-dialog-title" className="w-full max-w-md space-y-4 rounded-2xl border border-[#244034] bg-[#101914] p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#20362d] pb-3"><h3 id="order-dialog-title" className="text-lg font-bold text-emerald-300">Place Wholesale Order</h3><button aria-label="Close order dialog" onClick={() => setActiveListing(null)} className="text-gray-400 hover:text-white">✕</button></div>
              {orderMessage && <div role="status" className={`flex items-center gap-2 rounded-xl p-3 text-xs ${orderMessage.startsWith('Error') ? 'border border-red-800 bg-red-950/60 text-red-300' : 'border border-emerald-800 bg-emerald-950/60 text-emerald-300'}`}>{orderMessage.startsWith('Error') ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}<span>{orderMessage}</span></div>}
              <div className="space-y-2 rounded-xl border border-[#20362d] bg-[#070e0a] p-3 text-xs text-gray-300"><p><strong>Produce:</strong> {getCropName(activeListing)}</p><p><strong>Price:</strong> ₹{pricePerKg} / KG</p><p><strong>Available:</strong> {availableQty} KG</p><p><strong>Minimum:</strong> {minOrder} KG</p><p className="truncate text-emerald-400"><strong>Deliver to:</strong> {addressText}</p></div>
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div><label htmlFor="order-quantity" className="mb-1 block text-xs font-semibold uppercase text-gray-400">Order quantity (KG)</label><input id="order-quantity" type="number" required min={minOrder} max={availableQty} step="0.1" value={orderQty} onChange={(e) => setOrderQty(e.target.value)} className="w-full rounded-xl border border-[#20362d] bg-[#070e0a] px-4 py-2.5 text-white outline-none focus:border-emerald-500" /></div>
                <div className="flex items-center justify-between rounded-xl border border-emerald-800/50 bg-emerald-950/30 p-3 text-sm font-bold text-emerald-300"><span>Total amount</span><span>₹{((Number.parseFloat(orderQty) || 0) * pricePerKg).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                <div className="flex gap-3"><button type="button" onClick={() => setActiveListing(null)} className="flex-1 rounded-xl border border-[#20362d] bg-[#070e0a] py-2.5 font-semibold text-gray-300">Cancel</button><button type="submit" disabled={orderSubmitting} className="flex-1 rounded-xl bg-emerald-600 py-2.5 font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60">{orderSubmitting ? t('loading') : 'Confirm Order'}</button></div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
