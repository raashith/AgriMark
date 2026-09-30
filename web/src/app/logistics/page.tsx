'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { dataService } from '@/lib/data-service';
import { LogisticsRequest } from '@/types';
import {
  Truck, MapPin, PackageCheck, Navigation, Clock3, CheckCircle2,
  Radio, ArrowRight, RefreshCw, Phone, Route, ShieldCheck, AlertTriangle
} from 'lucide-react';

const statusMeta: Record<LogisticsRequest['status'], { label: string; tone: string }> = {
  requested: { label: 'Pickup requested', tone: 'text-amber-300 bg-amber-950/40 border-amber-800/50' },
  assigned: { label: 'Driver assigned', tone: 'text-sky-300 bg-sky-950/40 border-sky-800/50' },
  in_transit: { label: 'In transit', tone: 'text-emerald-300 bg-emerald-950/40 border-emerald-800/50' },
  delivered: { label: 'Delivered', tone: 'text-gray-300 bg-gray-900/50 border-gray-700' },
};

export default function LogisticsPage() {
  const [requests, setRequests] = useState<LogisticsRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (silent = false) => {
    if (silent) setRefreshing(true); else setLoading(true);
    try {
      setRequests(await dataService.getLogisticsRequests());
    } finally {
      if (silent) setRefreshing(false); else setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const active = useMemo(
    () => requests.filter((r) => r.status !== 'delivered'),
    [requests],
  );
  const inTransit = requests.filter((r) => r.status === 'in_transit').length;
  const assigned = requests.filter((r) => r.status === 'assigned').length;
  const delivered = requests.filter((r) => r.status === 'delivered').length;
  const totalKg = active.reduce((sum, r) => sum + Number(r.weight_kg || 0), 0);

  return (
    <div className="min-h-full space-y-5">
      <section className="overflow-hidden rounded-2xl border border-[#1e2d26] bg-[#121a16] shadow-sm">
        <div className="relative p-5 md:p-6">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-800/50 bg-emerald-950/50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                <Radio className="h-3.5 w-3.5" /> Logistics Operations
              </div>
              <h1 className="text-xl font-bold text-white md:text-2xl">Move produce. Track every trip.</h1>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-gray-400">
                One control center for pickup assignments, fleet movement, delivery status and shipment traceability.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => void load(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl border border-[#294238] bg-[#0a0f0d] px-3 py-2 text-xs font-semibold text-gray-300 hover:border-emerald-700 hover:text-white disabled:opacity-50"
              >
                <RefreshCw className={refreshing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} /> Refresh
              </button>
              <Link href="/logistics/deliveries" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500">
                Delivery board <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 border-t border-[#1e2d26] md:grid-cols-4">
          {[
            ['Active jobs', active.length, Truck],
            ['In transit', inTransit, Navigation],
            ['Assigned', assigned, Clock3],
            ['Delivered', delivered, CheckCircle2],
          ].map(([label, value, Icon]) => {
            const I = Icon as typeof Truck;
            return (
              <div key={String(label)} className="border-r border-[#1e2d26] px-4 py-3 last:border-r-0">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  <I className="h-3.5 w-3.5 text-emerald-500" /> {label}
                </div>
                <p className="mt-1 text-lg font-bold text-white">{value as number}</p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_300px]">
        <section className="rounded-2xl border border-[#1e2d26] bg-[#121a16] p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Live shipment queue</h2>
              <p className="mt-0.5 text-[11px] text-gray-500">Real logistics requests from AgriMark.</p>
            </div>
            <span className="rounded-full border border-emerald-800/40 bg-emerald-950/40 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
              {totalKg.toLocaleString('en-IN')} kg moving
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-24 animate-pulse rounded-xl bg-[#0a0f0d]" />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#294238] bg-[#0a0f0d] px-5 py-14 text-center">
              <Truck className="mx-auto mb-3 h-8 w-8 text-gray-600" />
              <p className="text-sm font-semibold text-gray-300">No logistics jobs yet</p>
              <p className="mt-1 text-xs text-gray-500">New pickup and delivery requests will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((job) => {
                const meta = statusMeta[job.status];
                return (
                  <article key={job.id} className="rounded-xl border border-[#1e2d26] bg-[#0a0f0d] p-4 transition hover:border-emerald-800/60">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{job.crop_name} · {Number(job.weight_kg || 0).toLocaleString('en-IN')} kg</h3>
                          <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${meta.tone}`}>{meta.label}</span>
                        </div>
                        <p className="mt-1 text-[10px] font-mono text-gray-500">Tracking {job.tracking_code}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-400">
                        <span className="inline-flex items-center gap-1"><Truck className="h-3.5 w-3.5 text-emerald-500" />{job.vehicle_type}</span>
                        {job.driver_name && <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />{job.driver_name}</span>}
                        {job.driver_phone && <a href={`tel:${job.driver_phone}`} className="inline-flex items-center gap-1 rounded-lg border border-[#294238] px-2 py-1 hover:text-white"><Phone className="h-3.5 w-3.5" />Call</a>}
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto_1fr] md:items-center">
                      <div className="rounded-lg border border-[#1e2d26] bg-[#121a16] px-3 py-2">
                        <p className="text-[9px] uppercase tracking-wider text-gray-500">Pickup</p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-gray-200"><MapPin className="h-3 w-3 text-emerald-500" />{job.pickup_location}</p>
                      </div>
                      <Route className="hidden h-4 w-4 text-emerald-600 md:block" />
                      <div className="rounded-lg border border-[#1e2d26] bg-[#121a16] px-3 py-2">
                        <p className="text-[9px] uppercase tracking-wider text-gray-500">Destination</p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-gray-200"><MapPin className="h-3 w-3 text-emerald-500" />{job.delivery_location}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.order_id && (
                        <Link href={`/logistics/track/${job.order_id}`} className="inline-flex items-center gap-1.5 rounded-lg border border-[#294238] px-3 py-1.5 text-[10px] font-bold text-gray-300 hover:border-emerald-700 hover:text-white">
                          <Navigation className="h-3.5 w-3.5 text-emerald-400" /> Track shipment
                        </Link>
                      )}
                      {job.order_id && (
                        <Link href={`/logistics/gate-pass/${job.order_id}`} className="inline-flex items-center gap-1.5 rounded-lg border border-[#294238] px-3 py-1.5 text-[10px] font-bold text-gray-300 hover:border-emerald-700 hover:text-white">
                          <PackageCheck className="h-3.5 w-3.5 text-emerald-400" /> Gate pass
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-[#1e2d26] bg-[#121a16] p-4">
            <div className="flex items-center gap-2">
              <PackageCheck className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Operations</h2>
            </div>
            <div className="mt-3 space-y-2">
              <Link href="/logistics/deliveries" className="flex items-center justify-between rounded-xl border border-[#1e2d26] bg-[#0a0f0d] px-3 py-2.5 text-xs text-gray-300 hover:border-emerald-700 hover:text-white">
                <span>Delivery board</span><ArrowRight className="h-4 w-4 text-emerald-500" />
              </Link>
              <Link href="/marketplace" className="flex items-center justify-between rounded-xl border border-[#1e2d26] bg-[#0a0f0d] px-3 py-2.5 text-xs text-gray-300 hover:border-emerald-700 hover:text-white">
                <span>Marketplace orders</span><ArrowRight className="h-4 w-4 text-emerald-500" />
              </Link>
              <Link href="/storage" className="flex items-center justify-between rounded-xl border border-[#1e2d26] bg-[#0a0f0d] px-3 py-2.5 text-xs text-gray-300 hover:border-emerald-700 hover:text-white">
                <span>Cold storage</span><ArrowRight className="h-4 w-4 text-emerald-500" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-900/50 bg-emerald-950/20 p-4">
            <div className="flex items-center gap-2 text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Traceability</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-gray-400">Every active job carries its AgriMark tracking code for shipment-level traceability.</p>
          </div>

          <div className="rounded-2xl border border-[#1e2d26] bg-[#121a16] p-4">
            <div className="flex items-center gap-2 text-amber-300">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Dispatch rule</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-gray-500">Use the delivery board for operational transitions; this dashboard is the logistics control center.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
