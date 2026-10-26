'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { dataService } from '@/lib/data-service';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Users } from 'lucide-react';

export default function FPODashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ listings: 0, stockKg: 0, orders: 0 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!user?.id) { setLoading(false); return; }
      try {
        setLoadError(null);
        const [listings, lots, orders] = await Promise.all([
          dataService.getListings({ sellerId: user.id }),
          dataService.getProduceLots(user.id),
          dataService.getOrders(user.id, 'farmer'),
        ]);
        if (!active) return;
        setStats({
          listings: listings.filter((listing) => listing.status === 'active').length,
          stockKg: lots.reduce((sum, lot) => sum + Number(lot.available_quantity ?? lot.quantity_kg ?? lot.quantity ?? 0), 0),
          orders: orders.filter((order) => !['delivered', 'cancelled', 'rejected'].includes(order.status)).length,
        });
      } catch (error) {
        console.error('[FPO dashboard] Failed to load live dashboard data:', error);
        if (active) setLoadError('Could not load live FPO values. Check your connection or sign in again, then refresh.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [user?.id]);

  return (
    <ProtectedRoute allowedRoles={['fpo', 'admin']} requireAuth>
      <div className="space-y-6">
        <div className="bg-[#121a16] border border-[#1e2d26] p-6 rounded-2xl">
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" /> FPO & Co-operative Procurement Portal
          </h1>
          <p className="text-sm text-gray-400">Monitor your available produce, active listings and order workflow using live AgriMark records.</p>
        </div>
        {loadError && <div role="alert" className="rounded-xl border border-amber-700/50 bg-amber-950/30 px-4 py-3 text-sm text-amber-100">{loadError}</div>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-[#121a16] border border-[#1e2d26] rounded-2xl space-y-2">
            <span className="text-xs uppercase font-mono text-gray-400">Active listings</span>
            <p className="text-2xl font-bold text-emerald-400">{loading ? '—' : stats.listings}</p>
          </div>
          <div className="p-5 bg-[#121a16] border border-[#1e2d26] rounded-2xl space-y-2">
            <span className="text-xs uppercase font-mono text-gray-400">Available produce</span>
            <p className="text-2xl font-bold text-amber-400">{loading ? '—' : `${(stats.stockKg / 1000).toFixed(2)} t`}</p>
          </div>
          <div className="p-5 bg-[#121a16] border border-[#1e2d26] rounded-2xl space-y-2">
            <span className="text-xs uppercase font-mono text-gray-400">Open orders</span>
            <p className="text-2xl font-bold text-purple-400">{loading ? '—' : stats.orders}</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
