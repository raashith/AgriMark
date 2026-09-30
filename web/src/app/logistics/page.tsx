'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { dataService } from '@/lib/data-service';
import type { LogisticsRequest } from '@/types';
import { Truck, MapPin, PackageCheck, RefreshCw, Navigation, Users, Snowflake } from 'lucide-react';

export default function LogisticsPage() {
  const [requests, setRequests] = useState<LogisticsRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { setRequests(await dataService.getLogisticsRequests()); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const active = requests.filter((item) => item.status !== 'delivered');
  const inTransit = requests.filter((item) => item.status === 'in_transit').length;
  const assigned = requests.filter((item) => item.status === 'assigned').length;
  const delivered = requests.filter((item) => item.status === 'delivered').length;

  return (
    <main className="min-h-full space-y-5">
      <section className="rounded-2xl border border-[#1e2d26] bg-[#121a16] p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-800/50 bg-emerald-950/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300"><Truck className="h-3.5 w-3.5" /> Logistics Operations</span>
            <h1 className="mt-3 text-xl font-bold text-white md:text-2xl">Move produce. Track every trip.</h1>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-gray-400">Manage pickup requests, drivers, routes and deliveries from one operations center.</p>
          </div>
          <button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-[#294238] bg-[#0a0f0d] px-3 py-2 text-xs font-semibold text-gray-300 hover:text-white"><RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} /> Refresh</button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[['Active jobs', active.length, Truck], ['In transit', inTransit, Navigation], ['Assigned', assigned, Users], ['Delivered', delivered, PackageCheck]].map(([label, value, Icon]) => {
          const StatIcon = Icon as typeof Truck;
          return <div key={String(label)} className="rounded-2xl border border-[#1e2d26] bg-[#121a16] p-4"><StatIcon className="h-4 w-4 text-emerald-400" /><p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">{String(label)}</p><p className="mt-1 text-lg font-bold text-white">{String(value)}</p></div>;
        })}
      </section>

      <section className="rounded-2xl border border-[#1e2d26] bg-[#121a16] p-4 md:p-5">
        <div className="mb-4 flex items-center justify-between"><div><h2 className="text-base font-bold text-white">Live shipment queue</h2><p className="mt-1 text-[11px] text-gray-500">Real logistics requests from AgriMark.</p></div><span className="text-[10px] font-mono text-gray-500">{requests.length} records</span></div>
        {loading ? <div className="space-y-3">{[1,2,3].map((n) => <div key={n} className="h-20 animate-pulse rounded-xl bg-[#0a0f0d]" />)}</div> :
         requests.length === 0 ? <div className="rounded-xl border border-dashed border-[#294238] bg-[#0a0f0d] px-5 py-14 text-center"><Truck className="mx-auto mb-3 h-8 w-8 text-gray-600" /><p className="text-sm font-semibold text-gray-300">No logistics jobs yet</p><p className="mt-1 text-xs text-gray-500">New pickup and delivery requests will appear here.</p></div> :
         <div className="space-y-3">{requests.map((job) => <article key={job.id} className="rounded-xl border border-[#1e2d26] bg-[#0a0f0d] p-4">
           <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div><h3 className="text-sm font-bold text-white">{job.crop_name} · {Number(job.weight_kg || 0).toLocaleString('en-IN')} kg</h3><p className="mt-1 text-[10px] font-mono text-gray-500">{job.tracking_code}</p></div><span className="w-fit rounded-full border border-emerald-800/40 bg-emerald-950/30 px-2 py-1 text-[10px] font-bold uppercase text-emerald-300">{job.status.replace('_', ' ')}</span></div>
           <div className="mt-3 grid gap-2 md:grid-cols-2"><div className="rounded-lg bg-[#121a16] px-3 py-2"><span className="text-[9px] uppercase tracking-wider text-gray-500">Pickup</span><p className="mt-1 flex items-center gap-1 text-xs text-gray-200"><MapPin className="h-3 w-3 text-emerald-500" />{job.pickup_location}</p></div><div className="rounded-lg bg-[#121a16] px-3 py-2"><span className="text-[9px] uppercase tracking-wider text-gray-500">Destination</span><p className="mt-1 flex items-center gap-1 text-xs text-gray-200"><MapPin className="h-3 w-3 text-emerald-500" />{job.delivery_location}</p></div></div>
         </article>)}</div>}
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[['Delivery Board','/logistics/deliveries',PackageCheck],['Live Routes','/logistics/routes',Navigation],['Fleet','/logistics/fleet',Truck],['Cold Chain','/logistics/cold-chain',Snowflake]].map(([label,href,Icon]) => { const ActionIcon=Icon as typeof Truck; return <Link key={String(label)} href={String(href)} className="rounded-xl border border-[#1e2d26] bg-[#121a16] p-4 text-xs font-semibold text-gray-300 transition hover:border-emerald-700 hover:text-white"><ActionIcon className="mb-2 h-4 w-4 text-emerald-400" />{String(label)}</Link>; })}
      </section>
    </main>
  );
}
