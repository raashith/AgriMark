'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { dataService } from '@/lib/data-service';
import type { LogisticsRequest } from '@/types';
import { Activity, ArrowUpRight, Clock3, MapPin, Navigation, PackageCheck, RefreshCw, Route, Search, Truck } from 'lucide-react';

type Filter = 'all' | 'in_transit' | 'assigned' | 'requested' | 'delivered';

const filters: { label: string; value: Filter }[] = [
  { label: 'All jobs', value: 'all' },
  { label: 'In transit', value: 'in_transit' },
  { label: 'Assigned', value: 'assigned' },
  { label: 'Requested', value: 'requested' },
  { label: 'Delivered', value: 'delivered' },
];

function directionsUrl(job: LogisticsRequest) {
  const origin = encodeURIComponent(job.pickup_location || '');
  const destination = encodeURIComponent(job.delivery_location || '');
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
}

function statusStyle(status: string) {
  if (status === 'in_transit') return 'border-amber-700/60 bg-amber-950/40 text-amber-300';
  if (status === 'delivered') return 'border-emerald-700/60 bg-emerald-950/40 text-emerald-300';
  if (status === 'assigned') return 'border-sky-700/60 bg-sky-950/40 text-sky-300';
  return 'border-[#3b473f] bg-[#17211b] text-gray-300';
}

export default function LogisticsRoutesMapPage() {
  const [jobs, setJobs] = useState<LogisticsRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const loadJobs = async () => {
    setLoading(true);
    setError('');
    try {
      setJobs(await dataService.getLogisticsRequests());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load logistics jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadJobs(); }, []);

  const visibleJobs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesStatus = filter === 'all' || job.status === filter;
      const matchesQuery = !query || [job.crop_name, job.tracking_code, job.pickup_location, job.delivery_location, job.driver_name]
        .some((value) => String(value || '').toLowerCase().includes(query));
      return matchesStatus && matchesQuery;
    });
  }, [jobs, filter, search]);

  const inTransit = jobs.filter((job) => job.status === 'in_transit').length;
  const needsAssignment = jobs.filter((job) => job.status === 'requested').length;
  const delivered = jobs.filter((job) => job.status === 'delivered').length;

  return (
    <main className="mx-auto w-full max-w-[1500px] space-y-5">
      <section className="overflow-hidden rounded-3xl border border-[#1e2d26] bg-[#121a16]">
        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-7">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-800/50 bg-emerald-950/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300"><Navigation className="h-3.5 w-3.5" /> Logistics control room</div>
            <h1 className="mt-3 text-2xl font-extrabold text-white md:text-3xl">Live Routes & Map</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">View shipment jobs, filter by delivery status, and open turn-by-turn directions for each pickup and destination.</p>
          </div>
          <button type="button" onClick={() => void loadJobs()} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#294238] bg-[#0a0f0d] px-4 py-2.5 text-sm font-semibold text-gray-200 transition hover:border-emerald-700 hover:text-white"><RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} /> Refresh jobs</button>
        </div>
        <div className="grid grid-cols-2 border-t border-[#1e2d26] sm:grid-cols-4">
          {[
            { label: 'Total shipments', value: jobs.length, icon: PackageCheck },
            { label: 'In transit', value: inTransit, icon: Truck },
            { label: 'Needs assignment', value: needsAssignment, icon: Clock3 },
            { label: 'Delivered', value: delivered, icon: Activity },
          ].map((stat) => <div key={stat.label} className="border-b border-r border-[#1e2d26] p-4 last:border-r-0 sm:border-b-0"><stat.icon className="h-4 w-4 text-emerald-400" /><p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">{stat.label}</p><p className="mt-1 text-2xl font-extrabold text-white">{stat.value}</p></div>)}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)]">
        <div className="overflow-hidden rounded-3xl border border-[#1e2d26] bg-[#121a16]">
          <div className="flex items-start justify-between gap-3 p-4 md:p-5">
            <div><h2 className="flex items-center gap-2 text-base font-bold text-white"><MapPin className="h-4 w-4 text-emerald-400" /> Regional map</h2><p className="mt-1 text-xs text-gray-500">OpenStreetMap · Tamil Nadu overview</p></div>
            <a href="https://www.openstreetmap.org/#map=7/10.8/78.4" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 hover:text-emerald-200">Open full map <ArrowUpRight className="h-3.5 w-3.5" /></a>
          </div>
          <div className="relative aspect-[4/3] min-h-[320px] border-y border-[#1e2d26] bg-[#0a0f0d] sm:aspect-[16/10] xl:aspect-[4/3]">
            <iframe title="OpenStreetMap regional logistics map" src="https://www.openstreetmap.org/export/embed.html?bbox=76.0%2C8.0%2C80.5%2C13.5&layer=mapnik" className="absolute inset-0 h-full w-full border-0" loading="lazy" />
          </div>
          <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-gray-400">This is a regional map. Shipment records currently store pickup and delivery as text addresses; precise live vehicle pins appear only when GPS coordinates or a tracking feed are connected.</p>
            <a href="https://www.openstreetmap.org/" target="_blank" rel="noreferrer" className="shrink-0 text-xs font-semibold text-emerald-300 hover:text-emerald-200">Map data © OpenStreetMap</a>
          </div>
        </div>

        <aside className="rounded-3xl border border-[#1e2d26] bg-[#121a16] p-4 md:p-5">
          <div className="flex items-center justify-between gap-2"><div><h2 className="text-base font-bold text-white">Shipment routes</h2><p className="mt-1 text-xs text-gray-500">Real records from AgriMark</p></div><span className="rounded-full border border-[#294238] bg-[#0a0f0d] px-2.5 py-1 text-[10px] font-mono text-gray-300">{visibleJobs.length} shown</span></div>
          <label className="mt-4 flex items-center gap-2 rounded-xl border border-[#294238] bg-[#0a0f0d] px-3 py-2.5"><Search className="h-4 w-4 shrink-0 text-gray-500" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search crop, route, tracking ID…" className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-gray-600" /></label>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {filters.map((item) => <button key={item.value} type="button" onClick={() => setFilter(item.value)} className={`rounded-full border px-2.5 py-1.5 text-[10px] font-semibold transition ${filter === item.value ? 'border-emerald-500/50 bg-emerald-600 text-white' : 'border-[#294238] bg-[#0a0f0d] text-gray-400 hover:text-white'}`}>{item.label}</button>)}
          </div>
          <div className="mt-4 max-h-[540px] space-y-3 overflow-y-auto pr-1">
            {loading ? [1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl border border-[#1e2d26] bg-[#0a0f0d]" />) :
             error ? <div className="rounded-2xl border border-rose-800/50 bg-rose-950/20 p-4 text-xs text-rose-200">{error}<button onClick={() => void loadJobs()} className="mt-3 block font-bold text-rose-100 underline">Try again</button></div> :
             visibleJobs.length === 0 ? <div className="rounded-2xl border border-dashed border-[#294238] p-7 text-center"><Route className="mx-auto h-7 w-7 text-gray-600" /><p className="mt-2 text-sm font-semibold text-gray-300">No matching shipments</p><p className="mt-1 text-xs text-gray-500">Try another status or search term.</p></div> :
             visibleJobs.map((job) => <article key={job.id} className="rounded-2xl border border-[#24372d] bg-[#0a0f0d] p-3.5">
               <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-bold text-white">{job.crop_name || 'Produce shipment'} <span className="font-normal text-gray-400">· {Number(job.weight_kg || 0).toLocaleString('en-IN')} kg</span></p><p className="mt-1 truncate font-mono text-[10px] text-gray-500">{job.tracking_code || 'Tracking ID unavailable'}</p></div><span className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-bold uppercase ${statusStyle(job.status)}`}>{String(job.status).replace('_', ' ')}</span></div>
               <div className="mt-3 space-y-2"><div className="flex items-start gap-2 text-xs"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-400" /><div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Pickup</p><p className="break-words text-gray-200">{job.pickup_location || 'Not provided'}</p></div></div><div className="flex items-start gap-2 text-xs"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-400" /><div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Destination</p><p className="break-words text-gray-200">{job.delivery_location || 'Not provided'}</p></div></div></div>
               <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#1e2d26] pt-3"><span className="truncate text-[10px] text-gray-500">{job.driver_name ? `Driver: ${job.driver_name}` : 'Driver not assigned'}</span><a href={directionsUrl(job)} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-emerald-800/60 bg-emerald-950/40 px-2.5 py-1.5 text-[10px] font-bold text-emerald-300 hover:bg-emerald-950">Directions <ArrowUpRight className="h-3 w-3" /></a></div>
             </article>)}
          </div>
        </aside>
      </section>
      <div className="flex flex-col gap-3 rounded-2xl border border-[#1e2d26] bg-[#121a16] p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-bold text-white">Manage delivery operations</p><p className="mt-1 text-xs text-gray-500">Go back to your queue to review assignments and delivery requests.</p></div><Link href="/logistics/deliveries" className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#294238] px-4 py-2 text-xs font-bold text-gray-200 hover:border-emerald-700 hover:text-white"><PackageCheck className="h-4 w-4 text-emerald-400" /> Delivery Board</Link></div>
    </main>
  );
}
