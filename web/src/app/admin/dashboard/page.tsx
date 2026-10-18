'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import {
  Activity, AlertTriangle, ArrowRight, Boxes, CheckCircle2, Clock3,
  Database, RefreshCw, ShieldCheck, ShoppingBag, Users, Warehouse,
} from 'lucide-react';

type RecentListing = { id: string; title: string | null; status: string | null; created_at: string | null };
type RecentOrder = { id: string; status: string | null; created_at: string | null };
type AuditEvent = { id: string; action: string | null; created_at: string | null };
type OverviewResponse = {
  metrics: { users: number | null; farmers: number | null; active_listings: number | null; orders: number | null };
  recent_listings: RecentListing[];
  recent_orders: RecentOrder[];
  audit_events: AuditEvent[];
  latest_market_date: string | null;
  source_errors: string[];
};
type DashboardData = {
  users: number | null;
  farmers: number | null;
  activeListings: number | null;
  orders: number | null;
  recentListings: RecentListing[];
  recentOrders: RecentOrder[];
  auditEvents: AuditEvent[];
  latestMarketDate: string | null;
  errors: string[];
};

const initialData: DashboardData = {
  users: null, farmers: null, activeListings: null, orders: null,
  recentListings: [], recentOrders: [], auditEvents: [], latestMarketDate: null, errors: [],
};

function formatDate(value?: string | null) {
  if (!value) return 'Date unavailable';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

function MetricCard({ label, value, detail, icon: Icon }: {
  label: string; value: number | null; detail: string; icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-[#1e2d26] bg-[#121a16] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="mt-2 text-3xl font-extrabold text-white tabular-nums">{value === null ? '—' : value.toLocaleString('en-IN')}</p>
        </div>
        <span className="rounded-xl bg-emerald-950/70 p-3 text-emerald-300"><Icon className="h-5 w-5" /></span>
      </div>
      <p className="mt-3 text-xs text-gray-500">{detail}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<DashboardData>(initialData);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  const loadAdminData = useCallback(async () => {
    if (authLoading) return;
    if (!user || user.role !== 'admin') {
      setData({ ...initialData, errors: ['Admin authentication required'] });
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const overview = await api.getAdminOperationsOverview() as OverviewResponse;
      setData({
        users: overview.metrics?.users ?? null,
        farmers: overview.metrics?.farmers ?? null,
        activeListings: overview.metrics?.active_listings ?? null,
        orders: overview.metrics?.orders ?? null,
        recentListings: overview.recent_listings || [],
        recentOrders: overview.recent_orders || [],
        auditEvents: overview.audit_events || [],
        latestMarketDate: overview.latest_market_date || null,
        errors: (overview.source_errors || []).map((source) => source + ': source unavailable or access denied'),
      });
    } catch (error) {
      console.error('[AgriMark admin dashboard] overview request failed', error);
      setData({
        ...initialData,
        errors: [error instanceof Error ? error.message : 'Admin overview service is unavailable'],
      });
    } finally {
      setLastChecked(new Date().toISOString());
      setLoading(false);
    }
  }, [authLoading, user]);

  useEffect(() => { void loadAdminData(); }, [loadAdminData]);

  const healthyChecks = [
    { label: 'User profiles', ok: data.users !== null },
    { label: 'Marketplace listings', ok: data.activeListings !== null },
    { label: 'Buyer orders', ok: data.orders !== null },
    { label: 'Audit trail', ok: !data.errors.some((error) => error.startsWith('admin_audit_log:')) },
    { label: 'Mandi data', ok: data.latestMarketDate !== null },
  ];
  const passedChecks = healthyChecks.filter((check) => check.ok).length;

  return (
    <ProtectedRoute allowedRoles={['admin']} requireAuth>
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="flex flex-col justify-between gap-4 rounded-3xl border border-[#1e2d26] bg-[#121a16] p-6 shadow-xl md:flex-row md:items-center md:p-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-800 bg-emerald-950/70 px-3 py-1 text-xs font-bold text-emerald-300">
              <ShieldCheck className="h-4 w-4" /> AgriMark Pilot Operations
            </div>
            <h1 className="text-2xl font-extrabold text-white md:text-3xl">Admin Command Center</h1>
            <p className="max-w-2xl text-sm text-gray-400">Monitor real marketplace records, buyer orders, mandi-data freshness and operational gaps. Failed data sources are shown as unavailable—not as zero.</p>
          </div>
          <button onClick={() => void loadAdminData()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-700 px-4 py-2.5 text-sm font-semibold text-emerald-200 hover:bg-emerald-950 disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh data
          </button>
        </section>

        {data.errors.length > 0 && (
          <section role="alert" className="rounded-2xl border border-amber-700/70 bg-amber-950/30 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-amber-100">Some operational data could not be loaded</h2>
                <p className="mt-1 text-sm text-amber-200/80">This is a data-source or permission issue to investigate. The dashboard does not substitute sample values.</p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-amber-100/80">
                  {data.errors.map((error) => <li key={error} className="break-words">{error}</li>)}
                </ul>
              </div>
            </div>
          </section>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Registered profiles" value={data.users} detail="Count from the profiles table" icon={Users} />
          <MetricCard label="Farmer profiles" value={data.farmers} detail="Profiles with farmer role" icon={Warehouse} />
          <MetricCard label="Active listings" value={data.activeListings} detail="Listings currently marked active" icon={Boxes} />
          <MetricCard label="Marketplace orders" value={data.orders} detail="Order count from marketplace_orders" icon={ShoppingBag} />
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-[#1e2d26] bg-[#121a16] p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold text-white"><ShoppingBag className="h-5 w-5 text-emerald-300" /> Recent buyer orders</h2>
                <p className="mt-1 text-xs text-gray-500">Latest records from the canonical marketplace_orders table</p>
              </div>
              <Link href="/buyer/orders" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 hover:text-emerald-200">Orders view <ArrowRight className="h-3.5 w-3.5" /></Link>
            </div>
            {loading ? <p className="py-8 text-center text-sm text-gray-400">Loading live orders…</p> : data.orders === null ? (
              <div className="rounded-xl border border-dashed border-amber-800 p-5 text-sm text-amber-200">Order records are unavailable. Check the production schema, RLS policies and database connection before pilot transactions.</div>
            ) : data.recentOrders.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[#26372e] p-5 text-sm text-gray-400">No order records found in the connected database. No sample orders are displayed.</p>
            ) : (
              <div className="divide-y divide-[#24332b]">
                {data.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0"><p className="truncate font-mono text-sm text-white">{order.id}</p><p className="mt-1 text-xs text-gray-500">{formatDate(order.created_at)}</p></div>
                    <span className="shrink-0 rounded-full border border-emerald-800 bg-emerald-950/60 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-200">{order.status || 'unknown'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#1e2d26] bg-[#121a16] p-5 md:p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white"><Activity className="h-5 w-5 text-emerald-300" /> Pilot readiness checks</h2>
            <p className="mt-1 text-xs text-gray-500">Availability checks only; these do not replace end-to-end testing.</p>
            <div className="mt-4 space-y-3">
              {healthyChecks.map((check) => (
                <div key={check.label} className="flex items-center justify-between gap-3 rounded-xl bg-[#0a0f0d] p-3">
                  <span className="text-sm text-gray-200">{check.label}</span>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${check.ok ? 'text-emerald-300' : 'text-amber-300'}`}>
                    {check.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    {check.ok ? 'Available' : 'Check required'}
                  </span>
                </div>
              ))}
              <div className="rounded-xl border border-[#26372e] p-3">
                <div className="flex items-center justify-between text-sm"><span className="text-gray-300">Data sources available</span><strong className="text-white">{passedChecks}/{healthyChecks.length}</strong></div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#25332b]"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(passedChecks / healthyChecks.length) * 100}%` }} /></div>
              </div>
              <div className="rounded-xl bg-[#0a0f0d] p-3">
                <p className="text-xs text-gray-500">Latest stored mandi observation</p>
                <p className="mt-1 text-sm font-semibold text-white">{data.latestMarketDate ? formatDate(data.latestMarketDate) : 'Unavailable — investigate data source'}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#1e2d26] bg-[#121a16] p-5 md:p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white"><Boxes className="h-5 w-5 text-emerald-300" /> Recently created listings</h2>
            <div className="mt-4">
              {loading ? <p className="py-6 text-sm text-gray-400">Loading listings…</p> : data.recentListings.length === 0 ? <p className="rounded-xl border border-dashed border-[#26372e] p-4 text-sm text-gray-400">No listing records are available to display.</p> : (
                <div className="divide-y divide-[#24332b]">
                  {data.recentListings.map((listing) => (
                    <div key={listing.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0"><p className="truncate text-sm font-semibold text-white">{listing.title || 'Untitled listing'}</p><p className="mt-1 text-xs text-gray-500">{formatDate(listing.created_at)}</p></div>
                      <span className="rounded-full border border-[#34483b] px-2.5 py-1 text-[10px] font-bold uppercase text-gray-300">{listing.status || 'unknown'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Link href="/buyer/marketplace" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-300 hover:text-emerald-200">Open marketplace <ArrowRight className="h-4 w-4" /></Link>
          </div>

          <div className="rounded-2xl border border-[#1e2d26] bg-[#121a16] p-5 md:p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white"><Database className="h-5 w-5 text-emerald-300" /> Recent audit activity</h2>
            <p className="mt-1 text-xs text-gray-500">Recent actions from admin_audit_log, when available to the current admin session.</p>
            <div className="mt-4">
              {loading ? <p className="py-6 text-sm text-gray-400">Loading audit events…</p> : data.errors.some((error) => error.startsWith('admin_audit_log:')) ? (
                <p className="rounded-xl border border-dashed border-amber-800 p-4 text-sm text-amber-200">Audit events could not be read. Verify the table and access policy; do not treat this as an empty audit trail.</p>
              ) : data.auditEvents.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[#26372e] p-4 text-sm text-gray-400">No audit events returned by the connected data source.</p>
              ) : (
                <div className="divide-y divide-[#24332b]">
                  {data.auditEvents.map((event) => (
                    <div key={event.id} className="flex items-start gap-3 py-3">
                      <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                      <div className="min-w-0"><p className="break-words text-sm text-white">{event.action || 'Unlabelled action'}</p><p className="mt-1 text-xs text-gray-500">{formatDate(event.created_at)}</p></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-1 border-t border-[#1e2d26] pt-4 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <span>Data is read from the connected AgriMark database; unavailable sources are flagged, never replaced with demo values.</span>
          <span>Last checked: {lastChecked ? formatDate(lastChecked) : 'Not checked yet'}</span>
        </footer>
      </div>
    </ProtectedRoute>
  );
}
