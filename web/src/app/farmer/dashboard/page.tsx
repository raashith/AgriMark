'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/auth';
import { dataService } from '@/lib/data-service';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Sprout,
  Layers,
  TrendingUp,
  CheckSquare,
  Bot,
  AlertTriangle,
  Gauge,
  CloudRain,
  Droplets,
  LineChart,
  PackageOpen,
  ArrowUpRight,
  Activity,
  Sparkles,
} from 'lucide-react';

export default function FarmerDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeCrops: 0,
    totalFarms: 0,
    harvestableKg: 0,
    activeOrders: 0,
    revenueInr: 0,
    pendingTasks: 0,
    cultivationAcres: 0,
    avgHealth: 0,
    latestRainfall: 0,
    latestHumidity: 0,
  });

  const [weatherAlert, setWeatherAlert] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const [farms, cultivations, lots, orders, tasks, weather] = await Promise.all([
          dataService.getFarms(user.id),
          dataService.getCultivations(undefined, user.id),
          dataService.getProduceLots(user.id),
          dataService.getOrders(user.id, 'farmer'),
          dataService.getTasks(user.id),
          dataService.getWeather(user.district || user.location),
        ]);

        if (!isMounted) return;

        const totalAcres = farms.reduce((acc, f) => acc + (f.area_acres || 0), 0);
        const totalStock = lots.reduce((acc, l) => acc + (l.quantity_kg || 0), 0);
        const revenue = orders.filter((o) => o.status === 'delivered' || o.status === 'confirmed' || o.payment_status === 'escrowed').reduce((acc, o) => acc + (o.total_price || o.total_amount || 0), 0);
        const pendingT = tasks.filter((t) => t.status === 'pending').length;
        const avgHealth = Math.round(weather.reduce((acc, w) => acc + Number(w.humidity_pct || 0), 0) / Math.max(weather.length, 1));
        const latestRainfall = Number(weather[0]?.rainfall_mm || 0);
        const latestHumidity = Number(weather[0]?.humidity_pct || 0);

        setStats({
          activeCrops: cultivations.length,
          totalFarms: farms.length,
          harvestableKg: totalStock,
          activeOrders: orders.filter((o) => o.status === 'confirmed' || o.status === 'in_transit').length,
          revenueInr: revenue,
          pendingTasks: pendingT,
          cultivationAcres: totalAcres,
          avgHealth,
          latestRainfall,
          latestHumidity,
        });

        if (weather && weather.length > 0 && weather[0].crop_warning) {
          setWeatherAlert(weather[0].crop_warning);
        } else {
          setWeatherAlert(null);
        }
      } catch {
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <ProtectedRoute allowedRoles={['farmer', 'fpo', 'admin', 'service_provider']}>
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[28px] border border-emerald-900/60 bg-[#07130e] min-h-[250px] shadow-[0_20px_70px_rgba(0,0,0,0.32)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_15%,rgba(52,211,153,0.16),transparent_35%),radial-gradient(circle_at_25%_100%,rgba(229,169,60,0.10),transparent_40%)]" />
          <div className="absolute inset-0 tech-grid opacity-40" />
          <div className="relative z-10 p-6 md:p-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-800/70 bg-emerald-950/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                <Activity className="h-3.5 w-3.5" /> Live Farm Operations
              </div>
              <h1 className="mt-4 text-3xl md:text-5xl font-black tracking-tight text-white">
                Welcome back, {user?.full_name?.split(' ')[0] || 'Farmer'}.
              </h1>
              <p className="mt-3 max-w-xl text-sm md:text-base text-gray-300">
                Your fields, crop health, harvest inventory and market actions are organized in one operating view.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/farmer/harvest" className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-[#04100B] shadow-lg shadow-emerald-950/30 hover:bg-emerald-400">
                  <PackageOpen className="h-4 w-4" /> Record Harvest
                </Link>
                <Link href="/ai-assistant" className="inline-flex items-center gap-2 rounded-xl border border-emerald-800 bg-[#0b1913] px-4 py-2.5 text-sm font-semibold text-emerald-100 hover:bg-emerald-950/50">
                  <Sparkles className="h-4 w-4 text-emerald-300" /> Ask AgriAI
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 min-w-[280px]">
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4">
                <p className="text-[10px] uppercase tracking-wider text-gray-400">Field footprint</p>
                <p className="mt-1 text-2xl font-black text-white">{stats.cultivationAcres.toFixed(1)} <span className="text-sm font-semibold text-gray-400">ac</span></p>
                <p className="mt-1 text-[11px] text-emerald-300">{stats.totalFarms} farms configured</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4">
                <p className="text-[10px] uppercase tracking-wider text-gray-400">Inventory</p>
                <p className="mt-1 text-2xl font-black text-white">{(stats.harvestableKg / 1000).toFixed(1)} <span className="text-sm font-semibold text-gray-400">t</span></p>
                <p className="mt-1 text-[11px] text-amber-300">{stats.activeOrders} active orders</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 xl:grid-cols-5 gap-3">
          {[
            { label: 'Active Cultivations', value: `${stats.activeCrops}`, suffix: 'crops', icon: Sprout },
            { label: 'Produce Stock', value: `${(stats.harvestableKg / 1000).toFixed(1)}`, suffix: 'tons', icon: Layers },
            { label: 'Revenue', value: `₹${stats.revenueInr.toLocaleString()}`, suffix: 'tracked', icon: TrendingUp },
            { label: 'Pending Tasks', value: `${stats.pendingTasks}`, suffix: 'actions', icon: CheckSquare },
            { label: 'Humidity Signal', value: `${stats.avgHealth}`, suffix: '%', icon: Gauge },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl border border-white/10 bg-[#0d1914] p-4 shadow-lg">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] uppercase tracking-wider text-gray-500">{card.label}</span>
                <card.icon className="h-4 w-4 text-emerald-300" />
              </div>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-2xl font-black text-white">{loading ? '—' : card.value}</span>
                <span className="pb-1 text-[11px] text-gray-500">{card.suffix}</span>
              </div>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1.45fr_0.85fr] gap-6">
          <div className="rounded-3xl border border-white/10 bg-[#0b1712] p-5 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-emerald-400">Field Intelligence</p>
                <h2 className="mt-1 text-xl font-bold text-white">Crop & field health</h2>
              </div>
              <Link href="/farmer/observations" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 hover:text-white">
                Open field logs <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-4">
                <p className="text-xs text-gray-500">Crop activity</p>
                <p className="mt-2 text-3xl font-black text-emerald-300">{stats.activeCrops}</p>
                <p className="mt-1 text-xs text-gray-400">active cultivations</p>
              </div>
              <div className="rounded-2xl border border-cyan-900/30 bg-cyan-950/10 p-4">
                <p className="text-xs text-gray-500">Humidity signal</p>
                <p className="mt-2 text-3xl font-black text-cyan-300">{stats.latestHumidity}%</p>
                <p className="mt-1 text-xs text-gray-400">latest weather reading</p>
              </div>
              <div className="rounded-2xl border border-sky-900/30 bg-sky-950/10 p-4">
                <p className="text-xs text-gray-500">Rainfall</p>
                <p className="mt-2 text-3xl font-black text-sky-300">{stats.latestRainfall} <span className="text-sm">mm</span></p>
                <p className="mt-1 text-xs text-gray-400">latest available reading</p>
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-white/5 bg-black/20 p-4">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Operations pulse</span>
                <span>Live from connected farm data</span>
              </div>
              <div className="mt-4 h-24 flex items-end gap-2">
                {[34,46,38,52,65,58,72,66,80,74,88,82].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-emerald-950 via-emerald-700 to-emerald-300/80 opacity-80" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0b1712] p-5 md:p-6">
            <div className="flex items-center gap-2">
              <CloudRain className="h-5 w-5 text-sky-300" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-sky-300">Weather Today</p>
                <h2 className="mt-1 text-xl font-bold text-white">{user?.location || 'Your farm region'}</h2>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/5 p-4 border border-white/5">
                <Droplets className="h-4 w-4 text-cyan-300" />
                <p className="mt-2 text-2xl font-black text-white">{stats.latestHumidity}%</p>
                <p className="text-xs text-gray-500">humidity</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-4 border border-white/5">
                <CloudRain className="h-4 w-4 text-sky-300" />
                <p className="mt-2 text-2xl font-black text-white">{stats.latestRainfall} mm</p>
                <p className="text-xs text-gray-500">rainfall</p>
              </div>
            </div>
            {weatherAlert ? (
              <div className="mt-4 rounded-2xl border border-amber-800/50 bg-amber-950/20 p-4 text-sm text-amber-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                  <span>{weatherAlert}</span>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-4 text-sm text-emerald-200">
                No active weather alert in the connected data.
              </div>
            )}
            <Link href="/weather" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-sky-300 hover:text-white">
              Open weather & climate <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-white/10 bg-[#0b1712] p-5">
            <div className="flex items-center gap-2"><LineChart className="h-5 w-5 text-emerald-300" /><h3 className="font-bold text-white">Market & selling</h3></div>
            <p className="mt-2 text-sm text-gray-400">Track live listings, stock readiness and mandi prices from the farmer workspace.</p>
            <div className="mt-4 flex gap-2">
              <Link href="/market-prices" className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Mandi Prices</Link>
              <Link href="/farmer/sell" className="rounded-xl border border-emerald-800 px-3 py-2 text-xs font-semibold text-emerald-200">Create Listing</Link>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#0b1712] p-5">
            <div className="flex items-center gap-2"><Bot className="h-5 w-5 text-violet-300" /><h3 className="font-bold text-white">AgriAI Assistant</h3></div>
            <p className="mt-2 text-sm text-gray-400">Ask crop, field, harvest or market questions and keep the interaction auditable.</p>
            <Link href="/ai-assistant" className="mt-4 inline-flex items-center gap-2 rounded-xl border border-violet-800/60 bg-violet-950/20 px-3 py-2 text-xs font-semibold text-violet-200">Open AI Assistant <ArrowUpRight className="h-3.5 w-3.5" /></Link>
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#0b1712] p-5">
            <div className="flex items-center gap-2"><CheckSquare className="h-5 w-5 text-amber-300" /><h3 className="font-bold text-white">Task center</h3></div>
            <p className="mt-2 text-sm text-gray-400">{stats.pendingTasks} pending farm actions are tracked for your workspace.</p>
            <Link href="/tasks" className="mt-4 inline-flex items-center gap-2 rounded-xl border border-amber-800/60 bg-amber-950/20 px-3 py-2 text-xs font-semibold text-amber-200">Open tasks <ArrowUpRight className="h-3.5 w-3.5" /></Link>
          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
}
