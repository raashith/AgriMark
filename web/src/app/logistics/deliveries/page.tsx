'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { dataService } from '@/lib/data-service';
import { LogisticsRequest } from '@/types';
import { Truck, MapPin, CheckCircle2, Navigation, QrCode, RefreshCw, PackageCheck } from 'lucide-react';

export default function LogisticsDeliveriesPage() {
  const [jobs,setJobs]=useState<LogisticsRequest[]>([]);
  const [loading,setLoading]=useState(true);
  const load=async()=>{setLoading(true);try{setJobs(await dataService.getLogisticsRequests());}finally{setLoading(false);}};
  useEffect(()=>{void load();},[]);
  return <div className="space-y-5">
    <section className="rounded-2xl border border-[#1e2d26] bg-[#121a16] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><div className="flex items-center gap-2 text-emerald-400"><Truck className="h-5 w-5"/><span className="text-[10px] font-bold uppercase tracking-widest">Dispatch & Delivery</span></div><h1 className="mt-1 text-xl font-bold text-white">Delivery Board</h1><p className="mt-1 text-xs text-gray-400">Manage pickup, transit and completed delivery workflows.</p></div>
        <button onClick={()=>void load()} className="inline-flex items-center gap-2 self-start rounded-xl border border-[#294238] bg-[#0a0f0d] px-3 py-2 text-xs font-semibold text-gray-300"><RefreshCw className="h-4 w-4"/> Refresh</button>
      </div>
    </section>
    {loading?<div className="space-y-3">{[1,2,3].map(n=><div key={n} className="h-28 animate-pulse rounded-2xl bg-[#121a16]"/>)}</div>:jobs.length===0?<div className="rounded-2xl border border-dashed border-[#294238] bg-[#121a16] py-16 text-center"><Truck className="mx-auto mb-3 h-8 w-8 text-gray-600"/><p className="text-sm font-semibold text-gray-300">No delivery jobs</p><p className="mt-1 text-xs text-gray-500">Real pickup requests will appear when a logistics job is created.</p></div>:<div className="space-y-3">{jobs.map(job=><article key={job.id} className="rounded-2xl border border-[#1e2d26] bg-[#121a16] p-4"><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-sm font-bold text-white">{job.crop_name} · {Number(job.weight_kg||0).toLocaleString('en-IN')} kg</h2><span className="rounded-full border border-emerald-800/40 bg-emerald-950/40 px-2 py-1 text-[9px] font-bold uppercase text-emerald-300">{job.status.replace('_',' ')}</span></div><p className="mt-1 text-[10px] font-mono text-gray-500">Tracking {job.tracking_code}</p></div><div className="flex gap-2"><Link href={job.order_id?'/logistics/track/'+job.order_id:'/logistics/routes'} className="inline-flex items-center gap-1.5 rounded-lg border border-[#294238] px-3 py-1.5 text-[10px] font-bold text-gray-300"><Navigation className="h-3.5 w-3.5 text-emerald-400"/> GPS Track</Link>{job.order_id&&<Link href={'/logistics/gate-pass/'+job.order_id} className="inline-flex items-center gap-1.5 rounded-lg border border-[#294238] px-3 py-1.5 text-[10px] font-bold text-gray-300"><QrCode className="h-3.5 w-3.5 text-emerald-400"/> Gate Pass</Link>}</div></div><div className="mt-3 grid gap-2 md:grid-cols-2"><div className="rounded-xl bg-[#0a0f0d] p-3"><span className="text-[9px] uppercase text-gray-500">Pickup</span><p className="mt-1 flex items-center gap-1 text-xs font-semibold text-gray-200"><MapPin className="h-3 w-3 text-emerald-500"/>{job.pickup_location}</p></div><div className="rounded-xl bg-[#0a0f0d] p-3"><span className="text-[9px] uppercase text-gray-500">Destination</span><p className="mt-1 flex items-center gap-1 text-xs font-semibold text-gray-200"><MapPin className="h-3 w-3 text-emerald-500"/>{job.delivery_location}</p></div></div><div className="mt-3 flex flex-wrap gap-3 text-[10px] text-gray-500"><span>{job.vehicle_type}</span>{job.driver_name&&<span>Driver: {job.driver_name}</span>}{job.status==='delivered'&&<span className="inline-flex items-center gap-1 text-emerald-400"><CheckCircle2 className="h-3.5 w-3.5"/> Completed</span>}<span className="inline-flex items-center gap-1"><PackageCheck className="h-3.5 w-3.5"/> Traceable</span></div></article>)}</div>}
  </div>;
}
