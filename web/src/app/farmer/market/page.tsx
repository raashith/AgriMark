'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight, BarChart3, Boxes, CheckCircle2, ChevronRight, MapPin,
  PackageOpen, Plus, Sparkles, Store, TrendingDown, TrendingUp
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/auth';
import { dataService } from '@/lib/data-service';
import { supabase } from '@/lib/supabase';

type MarketRow = {
  commodity_name: string | null;
  mandi_name: string | null;
  observed_at: string;
  modal_price: number;
  min_price: number;
  max_price: number;
};

export default function FarmerMarketPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [marketListings, setMarketListings] = useState<any[]>([]);
  const [lots, setLots] = useState<any[]>([]);
  const [marketRows, setMarketRows] = useState<MarketRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;
    let mounted = true;

    async function load() {
      setLoading(true);
      const [myListings, marketListingsData, myLots] = await Promise.all([
        dataService.getListings({ sellerId: userId }),
        dataService.getListings(),
        dataService.getProduceLots(userId),
      ]);

      const { data } = await supabase
        .from('national_market_price_observations')
        .select('commodity_name,mandi_name,observed_at,modal_price,min_price,max_price')
        .eq('price_signal_type', 'OBSERVED_MANDI')
        .order('observed_at', { ascending: false })
        .limit(24);

      if (!mounted) return;
      setListings(myListings || []);
      setMarketListings(marketListingsData || []);
      setLots(myLots || []);
      setMarketRows((data || []) as MarketRow[]);
      setLoading(false);
    }

    void load();
    return () => { mounted = false; };
  }, [user?.id]);

  const availableLots = lots.filter((lot) => !lot.is_listed && (lot.status ?? 'available') === 'available');
  const activeListings = listings.filter((listing) => listing.status === 'active');

  const latestByCommodity = useMemo(() => {
    const map = new Map<string, MarketRow>();
    for (const row of marketRows) {
      const key = row.commodity_name || 'Commodity';
      if (!map.has(key)) map.set(key, row);
    }
    return Array.from(map.values()).slice(0, 6);
  }, [marketRows]);

  const latest = marketRows[0];
  const previous = marketRows[1];
  const delta = latest && previous ? latest.modal_price - previous.modal_price : 0;
  const deltaPct = latest && previous && previous.modal_price
    ? (delta / previous.modal_price) * 100
    : 0;

  return (
    <ProtectedRoute allowedRoles={['farmer', 'fpo', 'admin', 'service_provider']}>
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[30px] border border-emerald-900/60 bg-[#07130e] shadow-[0_24px_80px_rgba(0,0,0,0.30)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_10%,rgba(52,211,153,0.18),transparent_34%),radial-gradient(circle_at_20%_100%,rgba(229,169,60,0.10),transparent_42%)]" />
          <div className="absolute inset-0 tech-grid opacity-30" />
          <div className="relative p-6 md:p-8 lg:p-10">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-800/70 bg-emerald-950/60 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                  <Store className="h-3.5 w-3.5" /> Farmer Market
                </div>
                <h1 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl">
                  Sell smarter. See the market before you sell.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300 md:text-base">
                  Turn verified harvest lots into buyer-ready listings while watching real mandi signals, price movement and your active sales.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/farmer/sell" className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-black text-[#04100B] shadow-lg shadow-emerald-950/30 hover:bg-emerald-400">
                    <Plus className="h-4 w-4" /> List produce
                  </Link>
                  <Link href="/market-prices" className="inline-flex items-center gap-2 rounded-xl border border-emerald-800 bg-[#0b1913] px-4 py-3 text-sm font-bold text-emerald-100 hover:bg-emerald-950/60">
                    <BarChart3 className="h-4 w-4" /> Full price intelligence
                  </Link>
                </div>
              </div>

              <div className="grid min-w-[280px] grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400">Ready to sell</p>
                  <p className="mt-2 text-3xl font-black text-white">{loading ? '—' : availableLots.length}</p>
                  <p className="mt-1 text-[11px] text-emerald-300">available lots</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400">Live listings</p>
                  <p className="mt-2 text-3xl font-black text-white">{loading ? '—' : activeListings.length}</p>
                  <p className="mt-1 text-[11px] text-amber-300">buyer-facing</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-[#0d1914] p-5">
            <p className="text-[10px] uppercase tracking-wider text-gray-500">Latest mandi modal</p>
            <p className="mt-2 text-3xl font-black text-emerald-300">{latest ? '₹' + latest.modal_price.toLocaleString('en-IN') : '—'}</p>
            <p className="mt-1 text-xs text-gray-500">{latest?.commodity_name || 'No observation'} / quintal</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0d1914] p-5">
            <p className="text-[10px] uppercase tracking-wider text-gray-500">Market movement</p>
            <p className={'mt-2 flex items-center gap-1 text-2xl font-black ' + (delta >= 0 ? 'text-emerald-300' : 'text-rose-300')}>
              {delta >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              {latest ? Math.abs(deltaPct).toFixed(1) + '%' : '—'}
            </p>
            <p className="mt-1 text-xs text-gray-500">vs latest available observation</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0d1914] p-5">
            <p className="text-[10px] uppercase tracking-wider text-gray-500">My marketplace stock</p>
            <p className="mt-2 text-3xl font-black text-white">{(lots.reduce((sum, l) => sum + Number(l.quantity_kg || l.quantity || 0), 0) / 1000).toFixed(1)}t</p>
            <p className="mt-1 text-xs text-gray-500">tracked across produce lots</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0d1914] p-5">
            <p className="text-[10px] uppercase tracking-wider text-gray-500">Market source</p>
            <p className="mt-2 text-lg font-black text-white">Agmarknet / DMI</p>
            <p className="mt-1 text-xs text-emerald-300">observed mandi signals</p>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-3xl border border-white/10 bg-[#0b1712] p-5 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">Market pulse</p>
                <h2 className="mt-1 text-xl font-bold text-white">What the market is saying</h2>
              </div>
              <Link href="/market-prices" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 hover:text-white">
                View all <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" />)}
              </div>
            ) : latestByCommodity.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-white/10 p-7 text-center text-sm text-gray-400">
                No mandi observations are available for this view yet.
              </div>
            ) : (
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {latestByCommodity.map((row) => (
                  <div key={row.commodity_name} className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-emerald-800/60 hover:bg-emerald-950/10">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-white">{row.commodity_name || 'Commodity'}</p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500"><MapPin className="h-3 w-3" />{row.mandi_name || 'Mandi'}</p>
                      </div>
                      <span className="rounded-full border border-emerald-900 bg-emerald-950/40 px-2 py-1 text-[10px] font-bold text-emerald-300">OBSERVED</span>
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-black text-emerald-300">₹{row.modal_price.toLocaleString('en-IN')}</p>
                        <p className="text-[11px] text-gray-500">modal / quintal</p>
                      </div>
                      <div className="text-right text-[11px] text-gray-500">
                        <p>Range ₹{row.min_price.toLocaleString('en-IN')}–₹{row.max_price.toLocaleString('en-IN')}</p>
                        <p className="mt-1">{row.observed_at.slice(0, 10)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-amber-900/30 bg-[#0b1712] p-6">
            <div className="flex items-center gap-2 text-amber-300">
              <Sparkles className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-[0.18em]">Sell decision</span>
            </div>
            <h2 className="mt-2 text-xl font-black text-white">Your next best action</h2>
            <p className="mt-3 text-sm leading-6 text-gray-400">
              Use the observed mandi signal as a reference, then compare it with buyer demand and your lot quality before publishing an asking price.
            </p>
            <div className="mt-5 rounded-2xl border border-amber-900/40 bg-amber-950/20 p-4">
              <p className="text-xs font-bold uppercase text-amber-300">Decision support</p>
              <p className="mt-2 text-sm text-amber-100">AgriMark shows observed prices separately from forecasts and does not guarantee a transaction price.</p>
            </div>
            <Link href="/farmer/sell" className="mt-5 flex items-center justify-between rounded-xl border border-amber-800/50 bg-amber-950/10 px-4 py-3 text-sm font-bold text-amber-100 hover:bg-amber-950/30">
              Create a listing <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="rounded-3xl border border-emerald-900/50 bg-[#0b1712] p-5 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">Live marketplace</p>
              <h2 className="mt-1 text-xl font-bold text-white">Demo market stock</h2>
              <p className="mt-1 text-sm text-gray-400">Real active listings loaded from AgriMark inventory for end-to-end testing.</p>
            </div>
            <span className="rounded-full border border-emerald-800 bg-emerald-950/50 px-3 py-1 text-[10px] font-bold uppercase text-emerald-300">{marketListings.length} active</span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {marketListings.slice(0, 6).map((listing) => (
              <div key={listing.id} className="rounded-2xl border border-white/10 bg-black/20 p-4 hover:border-emerald-700/60">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-white">{listing.title || 'Produce listing'}</p>
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                </div>
                <p className="mt-2 text-2xl font-black text-emerald-300">₹{Number(listing.price_per_kg || listing.price_per_unit || 0).toLocaleString('en-IN')}<span className="text-xs font-medium text-gray-500"> / kg</span></p>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>{listing.quality_grade || 'Grade A'}</span>
                  <span>{Number(listing.min_order_quantity || 50).toLocaleString('en-IN')} kg min</span>
                </div>
              </div>
            ))}
            {!loading && marketListings.length === 0 && (
              <div className="sm:col-span-2 lg:col-span-3 rounded-2xl border border-dashed border-white/10 p-7 text-center text-sm text-gray-400">No active marketplace stock is available.</div>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-[#0b1712] p-5 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">Ready to sell</p>
                <h2 className="mt-1 text-xl font-bold text-white">Available produce lots</h2>
              </div>
              <Link href="/farmer/harvest" className="text-xs font-bold text-emerald-300 hover:text-white">Manage harvest</Link>
            </div>
            <div className="mt-5 space-y-3">
              {availableLots.slice(0, 4).map((lot) => (
                <div key={lot.id} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-950 text-emerald-300"><Boxes className="h-5 w-5" /></div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">{lot.quality_grade || 'Verified produce'} lot</p>
                      <p className="mt-1 text-xs text-gray-500">{Number(lot.quantity_kg || lot.quantity || 0).toLocaleString('en-IN')} kg · Lot {lot.id.slice(0, 8)}</p>
                    </div>
                  </div>
                  <Link href={'/farmer/sell?lot_id=' + encodeURIComponent(lot.id)} className="shrink-0 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500">Sell</Link>
                </div>
              ))}
              {!loading && availableLots.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center">
                  <PackageOpen className="mx-auto h-7 w-7 text-gray-600" />
                  <p className="mt-2 text-sm text-gray-400">No unlisted lots are ready.</p>
                  <Link href="/farmer/harvest" className="mt-3 inline-flex text-xs font-bold text-emerald-300">Record harvest</Link>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0b1712] p-5 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-300">My sales channel</p>
                <h2 className="mt-1 text-xl font-bold text-white">Active listings</h2>
              </div>
              <Link href="/farmer/sell" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300">Add listing <Plus className="h-3.5 w-3.5" /></Link>
            </div>
            <div className="mt-5 space-y-3">
              {activeListings.slice(0, 4).map((listing) => (
                <div key={listing.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-white">{listing.title || listing.crop_name || 'Produce listing'}</p>
                      <p className="mt-1 text-xs text-gray-500">{listing.quality_grade || 'Quality not specified'} · {listing.location || listing.district || 'Location not specified'}</p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <div><span className="text-xl font-black text-white">₹{Number(listing.price_per_kg || listing.price_per_unit || 0).toLocaleString('en-IN')}</span><span className="text-xs text-gray-500"> / kg</span></div>
                    <span className="rounded-full bg-emerald-950/50 px-2 py-1 text-[10px] font-bold uppercase text-emerald-300">Active</span>
                  </div>
                </div>
              ))}
              {!loading && activeListings.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center">
                  <Store className="mx-auto h-7 w-7 text-gray-600" />
                  <p className="mt-2 text-sm text-gray-400">You have no active marketplace listings.</p>
                  <Link href="/farmer/sell" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-300">List your first lot <ArrowUpRight className="h-3.5 w-3.5" /></Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
}
