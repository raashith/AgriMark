'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/auth';
import { dataService } from '@/lib/data-service';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Sprout,
  MapPin,
  Eye,
  Layers,
  ShoppingCart,
  TrendingUp,
  FileText,
  CheckSquare,
  Bot,
  AlertTriangle,
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

        setStats({
          activeCrops: cultivations.length,
          totalFarms: farms.length,
          harvestableKg: totalStock,
          activeOrders: orders.filter((o) => o.status === 'confirmed' || o.status === 'in_transit').length,
          revenueInr: revenue,
          pendingTasks: pendingT,
          cultivationAcres: totalAcres,
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
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-[#121a16] border border-[#1e2d26] p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded-full text-xs font-mono font-bold text-emerald-400">
              <Sprout className="w-4 h-4" /> Farmer Operations OS
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white">
              Welcome back, {user?.full_name || 'Farmer'}!
            </h1>
            <p className="text-xs text-gray-300 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span>
                {user?.location || 'Location Not Specified'} • {stats.cultivationAcres} Acres Active Cultivation
              </span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/farmer/harvest"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition"
            >
              <Layers className="w-4 h-4" />
              <span>Record Harvest</span>
            </Link>
            <Link
              href="/farmer/sell"
              className="px-4 py-2.5 bg-[#0a0f0d] border border-[#1e2d26] hover:bg-[#18241f] text-gray-200 font-bold text-xs rounded-xl transition flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              <span>Create Listing</span>
            </Link>
          </div>
        </div>

        {/* Weather Alert Bar if advisory exists */}
        {weatherAlert && (
          <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-2xl flex items-center gap-3 text-amber-200 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="flex-1 font-medium">{weatherAlert}</span>
            <Link href="/weather" className="font-bold underline text-amber-300 hover:text-white shrink-0">
              View Weather Forecast
            </Link>
          </div>
        )}

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
          ) : (
            <>
              <div className="p-5 bg-[#121a16] border border-[#1e2d26] rounded-2xl space-y-2 shadow-md">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Active Cultivations</span>
                  <Sprout className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-2xl font-black text-white">{stats.activeCrops} Crops</p>
                <p className="text-[11px] text-emerald-400 font-mono">{stats.totalFarms} Farms Configured</p>
              </div>

              <div className="p-5 bg-[#121a16] border border-[#1e2d26] rounded-2xl space-y-2 shadow-md">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Produce Stock</span>
                  <Layers className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-2xl font-black text-white">{(stats.harvestableKg / 1000).toFixed(1)} Tons</p>
                <p className="text-[11px] text-gray-400 font-mono">Available Quantity</p>
              </div>

              <div className="p-5 bg-[#121a16] border border-[#1e2d26] rounded-2xl space-y-2 shadow-md">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Completed Revenue</span>
                  <FileText className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-2xl font-black text-emerald-400">₹{stats.revenueInr.toLocaleString()}</p>
                <p className="text-[11px] text-gray-400 font-mono">{stats.activeOrders} Active Orders</p>
              </div>

              <div className="p-5 bg-[#121a16] border border-[#1e2d26] rounded-2xl space-y-2 shadow-md">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Pending Farm Tasks</span>
                  <CheckSquare className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-2xl font-black text-amber-400">{stats.pendingTasks} Tasks</p>
                <p className="text-[11px] text-gray-400 font-mono">Action Required</p>
              </div>
            </>
          )}
        </div>

        {/* Quick Module Access Shortcuts */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Farm Operating Modules</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'My Farms', href: '/farmer/farms', icon: MapPin },
              { label: 'Crops', href: '/farmer/crops', icon: Sprout },
              { label: 'Field Logs', href: '/farmer/observations', icon: Eye },
              { label: 'Mandi Prices', href: '/market-prices', icon: TrendingUp },
              { label: 'Farm Finance', href: '/finance', icon: FileText },
              { label: 'AgriAI Helper', href: '/ai-assistant', icon: Bot },
            ].map((m, idx) => (
              <Link
                key={idx}
                href={m.href}
                className="p-4 bg-[#121a16] border border-[#1e2d26] hover:border-emerald-800 rounded-2xl transition space-y-2 group shadow-md text-center flex flex-col items-center justify-center"
              >
                <div className="p-2.5 bg-emerald-950/60 border border-emerald-800/40 rounded-xl text-emerald-400 group-hover:scale-110 transition">
                  <m.icon className="w-5 h-5" />
                </div>
                <span className="font-bold text-xs text-gray-200 group-hover:text-emerald-300">{m.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
