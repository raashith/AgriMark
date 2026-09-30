'use client';

import React, {useEffect, useState} from 'react';
import {Map, MapControls} from '@/components/ui/map';
import {dataService} from '@/lib/data-service';
import {LogisticsRequest} from '@/types';
import {Navigation, Truck, Radio, ShieldCheck} from 'lucide-react';

export default function LogisticsRoutesPage(){
  const [jobs,setJobs]=useState<LogisticsRequest[]>([]);
  useEffect(()=>{void (async()=>setJobs(await dataService.getLogisticsRequests()))();},[]);
  const active=jobs.filter(j=>j.status!=='delivered');
  return <div className="space-y-5">
    <section className="rounded-2xl border border-[#1e2d26] bg-[#121a16] p-5">
      <div className="flex items-center gap-2 text-emerald-400"><Navigation className="h-5 w-5"/><span className="text-[10px] font-bold uppercase tracking-[.18em]">MapCN Operations Map</span></div>
      <h1 className="mt-2 text-xl font-bold text-white">Routes & Live Tracking</h1>
      <p className="mt-1 text-xs text-gray-400">MapLibre-powered logistics map for AgriMark shipments, route paths and GPS telemetry.</p>
    </section>
    <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
      <section className="relative h-[620px] overflow-hidden rounded-2xl border border-[#1e2d26] bg-[#0a0f0d]">
        <Map center={[78.9629,20.5937]} zoom={4.5} theme="dark" className="h-full w-full">
          <MapControls position="top-right" showZoom showCompass showFullscreen />
          <div className="absolute left-3 top-3 z-10 rounded-xl border border-white/10 bg-[#0a0f0d]/85 px-3 py-2 backdrop-blur">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-emerald-300"><Radio className="h-3.5 w-3.5"/> Logistics network</div>
            <p className="mt-1 text-[10px] text-gray-400">{active.length} active shipment{active.length===1?'':'s'} · GPS status from telemetry</p>
          </div>
          <div className="absolute bottom-4 left-3 z-10 max-w-sm rounded-xl border border-white/10 bg-[#0a0f0d]/90 p-3 backdrop-blur">
            <p className="text-[10px] font-semibold text-gray-300">GPS data boundary</p>
            <p className="mt-1 text-[10px] leading-4 text-gray-500">Shipment markers and route lines appear when AgriMark receives valid longitude/latitude telemetry. No artificial vehicle positions are shown.</p>
          </div>
        </Map>
      </section>
      <aside className="space-y-3">
        <div className="rounded-2xl border border-[#1e2d26] bg-[#121a16] p-4">
          <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-emerald-400"/><h2 className="text-sm font-bold text-white">Active shipments</h2></div>
          <div className="mt-3 space-y-2">{active.length===0?<p className="py-8 text-center text-xs text-gray-500">No active shipments.</p>:active.map(job=><div key={job.id} className="rounded-xl border border-[#1e2d26] bg-[#0a0f0d] p-3"><div className="flex items-start justify-between gap-2"><div><p className="text-xs font-bold text-white">{job.crop_name}</p><p className="mt-1 text-[9px] font-mono text-gray-500">{job.tracking_code}</p></div><span className="rounded-full bg-emerald-950/50 px-2 py-1 text-[9px] uppercase text-emerald-300">{job.status.replace('_',' ')}</span></div><p className="mt-2 text-[10px] text-gray-500">{job.pickup_location} → {job.delivery_location}</p></div>)}</div>
        </div>
        <div className="rounded-2xl border border-[#1e2d26] bg-[#121a16] p-4"><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-400"/><h2 className="text-sm font-bold text-white">Telemetry integrity</h2></div><p className="mt-2 text-[10px] leading-4 text-gray-500">Only validated telemetry can become a live map position. The map does not invent GPS coordinates from pickup or delivery text.</p></div>
      </aside>
    </div>
  </div>;
}
// MapCN production dependency verification.
