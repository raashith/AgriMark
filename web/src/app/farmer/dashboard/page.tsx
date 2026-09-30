'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/auth';
import { dataService } from '@/lib/data-service';
import {
  Sprout, Layers, TrendingUp, CheckSquare, Gauge, CloudRain, Droplets, LineChart,
  PackageOpen, ArrowUpRight, Activity, Sparkles, Bot,
} from 'lucide-react';

const statCards = [
  { label: 'Active Cultivations', key: 'activeCrops', suffix: 'crops', icon: Sprout },
  { label: 'Produce Stock', key: 'harvestableKg', suffix: 'tons', icon: Layers },
  { label: 'Revenue', key: 'revenueInr', suffix: 'tracked value', icon: TrendingUp },
  { label: 'Pending Tasks', key: 'pendingTasks', suffix: 'actions', icon: CheckSquare },
  { label: 'Humidity Signal', key: 'avgHealth', suffix: 'latest reading', icon: Gauge },
] as const;

export default function FarmerDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeCrops: 0, totalFarms: 0, harvestableKg: 0, activeOrders: 0, revenueInr: 0,
    pendingTasks: 0, cultivationAcres: 0, avgHealth: 0, latestRainfall: 0,
    latestHumidity: 0, latestTemperature: 0,
  });
  const [weatherLocation, setWeatherLocation] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (!user?.id) { setLoading(false); return; }
      try {
        const [farms, cultivations, lots, orders, tasks] = await Promise.all([
          dataService.getFarms(user.id),
          dataService.getCultivations(undefined, user.id),
          dataService.getProduceLots(user.id),
          dataService.getOrders(user.id, 'farmer'),
          dataService.getTasks(user.id),
        ]);
        const farmWithCoords = farms.find((f) => f.latitude != null && f.longitude != null);
        const weather = farmWithCoords
          ? await dataService.getLiveWeather(Number(farmWithCoords.latitude), Number(farmWithCoords.longitude))
          : null;
        if (!isMounted) return;
        const totalAcres = farms.reduce((acc, f) => acc + (f.area_acres || 0), 0);
        const totalStock = lots.reduce((acc, l) => acc + (l.quantity_kg || 0), 0);
        const revenue = orders
          .filter((o) => o.status === 'delivered' || o.status === 'confirmed' || o.payment_status === 'escrowed')
          .reduce((acc, o) => acc + (o.total_price || o.total_amount || 0), 0);
        const pendingT = tasks.filter((t) => t.status === 'pending').length;
        const latestRainfall = Number(weather?.data?.rain_1h_mm || 0);
        const latestHumidity = Number(weather?.data?.humidity_pct || 0);
        const latestTemperature = Number(weather?.data?.temperature_c || 0);
        setStats({
          activeCrops: cultivations.length,
          totalFarms: farms.length,
          harvestableKg: totalStock,
          activeOrders: orders.filter((o) => o.status === 'confirmed' || o.status === 'in_transit').length,
          revenueInr: revenue,
          pendingTasks: pendingT,
          cultivationAcres: totalAcres,
          avgHealth: latestHumidity,
          latestRainfall,
          latestHumidity,
          latestTemperature,
        });
        setWeatherLocation(weather?.data?.location_name || null);
      } catch {
        // Keep the shell usable even when one service is unavailable.
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    void loadData();
    return () => { isMounted = false; };
  }, [user]);

  return (
    <ProtectedRoute allowedRoles={['farmer', 'fpo', 'admin', 'service_provider']}>
      <div className="space-y-6">
        <section className="rounded-[26px] border border-[#24382e] bg-[#07110d] overflow-hidden shadow-[0_24px_90px_rgba(0,0,0,0.32)]">
          <div className="relative p-6 md:p-8">
            <div className="pointer-events-none absolute inset-0 tech-grid opacity-40" />
            <div className="pointer-events-none absolute -top-24 right-0 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="relative z-10">
              <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#3e7b54]/60 bg-[#1b4d3e]/35 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#9bc7a2]">
                    <Activity className="h-3.5 w-3.5" /> Live Farm Operations
                  </div>
                  <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#f7f5ee] md:text-[34px]">
                    Welcome back, {user?.full_name?.split(' ')[0] || 'Farmer'}.
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-[#adbdb2] md:text-base">
                    See what needs attention today.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link href="/farmer/harvest" className="inline-flex items-center gap-2 rounded-xl bg-[#3e7b54] px-4 py-2.5 text-sm font-bold text-[#f7f5ee] hover:bg-[#4b8f62] transition">
                      <PackageOpen className="h-4 w-4" /> Record Harvest
                    </Link>
                    <Link href="/ai-assistant" className="inline-flex items-center gap-2 rounded-xl border border-[#3e7b54]/70 bg-[#0c120f] px-4 py-2.5 text-sm font-semibold text-[#f7f5ee] hover:border-[#e5a93c]/60 transition">
                      <Sparkles className="h-4 w-4 text-[#e5a93c]" /> Ask AgriAI
                    </Link>
                  </div>
                </div>
                <div className="grid min-w-[280px] grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-gray-400">Field footprint</p>
                    <p className="mt-1 text-2xl font-black text-[#f7f5ee]">{stats.cultivationAcres.toFixed(1)} <span className="text-sm font-semibold text-gray-400">ac</span></p>
                    <p className="mt-1 text-[11px] text-[#52a67a]">{stats.totalFarms} farms configured</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-gray-400">Inventory</p>
                    <p className="mt-1 text-2xl font-black text-[#f7f5ee]">{(stats.harvestableKg / 1000).toFixed(1)} <span className="text-sm font-semibold text-gray-400">t</span></p>
                    <p className="mt-1 text-[11px] text-[#e5a93c]">{stats.activeOrders} active orders</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 xl:grid-cols-5">
          {statCards.map((card) => {
            const Icon = card.icon;
            const raw = stats[card.key];
            const value = card.key === 'harvestableKg'
              ? (Number(raw) / 1000).toFixed(1)
              : card.key === 'revenueInr'
                ? `₹${Number(raw).toLocaleString()}`
                : String(raw);
            return (
              <div key={card.label} className="rounded-[18px] border border-white/10 bg-[#0e1712] p-4 shadow-lg">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-[#adbdb2]">{card.label}</span>
                  <Icon className="h-4 w-4 text-[#52a67a]" />
                </div>
                <div className="mt-4">
                  <span className="text-[28px] font-black text-[#f7f5ee]">{loading ? '—' : value}</span>
                  <span className="ml-2 text-[11px] text-[#adbdb2]">{card.suffix}</span>
                </div>
              </div>
            );
          })}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.45fr_0.85fr]">
          <div className="rounded-[20px] border border-white/10 bg-[#0e1712] p-5 md:p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#3e7b54]">Field Intelligence</p>
            <h2 className="mt-1 text-[21px] font-bold text-[#f7f5ee]">Crop & field health</h2>
            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-[#0c120f] p-4">
                <p className="text-[11px] font-semibold text-[#adbdb2]">Crop activity</p>
                <p className="mt-2 text-[28px] font-black text-[#3e7b54]">{stats.activeCrops}</p>
                <p className="mt-1 text-[11px] text-[#adbdb2]">active cultivations</p>
              </div>
              <div className="rounded-2xl bg-[#0c120f] p-4">
                <p className="text-[11px] font-semibold text-[#adbdb2]">Humidity signal</p>
                <p className="mt-2 text-[28px] font-black text-sky-300">{stats.latestHumidity}%</p>
                <p className="mt-1 text-[11px] text-[#adbdb2]">latest reading</p>
              </div>
              <div className="rounded-2xl bg-[#0c120f] p-4">
                <p className="text-[11px] font-semibold text-[#adbdb2]">Rainfall</p>
                <p className="mt-2 text-[28px] font-black text-sky-300">{stats.latestRainfall} <span className="text-sm">mm</span></p>
                <p className="mt-1 text-[11px] text-[#adbdb2]">latest available reading</p>
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-white/5 bg-black/20 p-4">
              <div className="flex items-center justify-between text-xs text-[#adbdb2]">
                <span>Connected farm status</span>
                <span>{stats.totalFarms} farm{stats.totalFarms === 1 ? '' : 's'} configured</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-white/[0.03] p-3"><p className="text-[10px] uppercase text-gray-500">Area</p><p className="mt-1 font-bold text-white">{stats.cultivationAcres.toFixed(1)} ac</p></div>
                <div className="rounded-xl bg-white/[0.03] p-3"><p className="text-[10px] uppercase text-gray-500">Temperature</p><p className="mt-1 font-bold text-white">{stats.latestTemperature ? `${stats.latestTemperature}°C` : '—'}</p></div>
                <div className="rounded-xl bg-white/[0.03] p-3"><p className="text-[10px] uppercase text-gray-500">Weather</p><p className="mt-1 font-bold text-[#52a67a] truncate">{weatherLocation || 'GPS required'}</p></div>
              </div>
            </div>
          </div>

          <div className="rounded-[20px] border border-white/10 bg-[#0e1712] p-5 md:p-6">
            <div className="flex items-center gap-2"><CloudRain className="h-5 w-5 text-sky-300" /><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300">Weather Today</p><h2 className="mt-1 text-xl font-bold text-[#f7f5ee]">{weatherLocation || 'Your farm region'}</h2></div></div>
            <p className="mt-5 text-xs text-[#adbdb2]">Live weather</p>
            <p className="mt-1 text-[34px] font-black text-[#f7f5ee]">{stats.latestTemperature ? `${stats.latestTemperature}°C` : '— °C'}</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-[14px] bg-[#0c120f] p-4"><Droplets className="h-4 w-4 text-cyan-300" /><p className="mt-3 text-lg font-bold text-white">{stats.latestHumidity}%</p><p className="text-[11px] text-[#adbdb2]">humidity</p></div>
              <div className="rounded-[14px] bg-[#0c120f] p-4"><CloudRain className="h-4 w-4 text-sky-300" /><p className="mt-3 text-lg font-bold text-white">{stats.latestRainfall} mm</p><p className="text-[11px] text-[#adbdb2]">rainfall</p></div>
            </div>
            <Link href="/weather" className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-sky-300 hover:text-white">Open weather & climate <ArrowUpRight className="h-3.5 w-3.5" /></Link>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-[20px] border border-white/10 bg-[#0e1712] p-5"><div className="flex items-center gap-2"><LineChart className="h-5 w-5 text-emerald-300" /><h3 className="font-bold text-white">Market & selling</h3></div><p className="mt-2 text-sm text-gray-400">Track listings, stock readiness and mandi prices.</p><div className="mt-4 flex flex-wrap gap-2"><Link href="/market-prices" className="rounded-xl bg-[#1b4d3e] px-3 py-2 text-xs font-bold text-white">Mandi Prices</Link><Link href="/farmer/sell" className="rounded-xl border border-[#3e7b54] px-3 py-2 text-xs font-semibold text-[#f7f5ee]">Create Listing</Link></div></div>
          <div className="rounded-[20px] border border-white/10 bg-[#0e1712] p-5"><div className="flex items-center gap-2"><Bot className="h-5 w-5 text-violet-300" /><h3 className="font-bold text-white">AgriAI Assistant</h3></div><p className="mt-2 text-sm text-gray-400">Ask crop, field, harvest or market questions.</p><Link href="/ai-assistant" className="mt-4 inline-flex items-center gap-2 rounded-xl border border-violet-800/60 bg-violet-950/20 px-3 py-2 text-xs font-semibold text-violet-200">Open AI Assistant <ArrowUpRight className="h-3.5 w-3.5" /></Link></div>
          <div className="rounded-[20px] border border-white/10 bg-[#0e1712] p-5"><div className="flex items-center gap-2"><CheckSquare className="h-5 w-5 text-amber-300" /><h3 className="font-bold text-white">Task center</h3></div><p className="mt-2 text-sm text-gray-400">{stats.pendingTasks} pending farm actions are tracked for your workspace.</p><Link href="/tasks" className="mt-4 inline-flex items-center gap-2 rounded-xl border border-amber-800/60 bg-amber-950/20 px-3 py-2 text-xs font-semibold text-amber-200">Open tasks <ArrowUpRight className="h-3.5 w-3.5" /></Link></div>
        </section>
      </div>
    </ProtectedRoute>
  );
}
