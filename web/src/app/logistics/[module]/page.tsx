'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { dataService } from '@/lib/data-service';
import { LogisticsRequest } from '@/types';
import { Truck, Users, Snowflake, Route, Warehouse, BellRing, BarChart3, ClipboardList, MapPin, ArrowRight, RefreshCw, PackageCheck, Navigation, ShieldCheck, AlertTriangle } from 'lucide-react';

type ModuleKey = 'dispatch'|'fleet'|'drivers'|'cold-chain'|'routes'|'docks'|'requests'|'alerts'|'analytics';
const modules: Record<ModuleKey, {title:string;subtitle:string;icon:typeof Truck}> = {
 dispatch:{title:'Dispatch Control',subtitle:'Assign and coordinate active produce movements.',icon:Truck},
 fleet:{title:'Fleet Management',subtitle:'Manage vehicle capacity, type, utilization and availability.',icon:Truck},
 drivers:{title:'Driver Operations',subtitle:'Driver assignments, contact, status and trip readiness.',icon:Users},
 'cold-chain':{title:'Cold Chain',subtitle:'Reefer movement, temperature telemetry and perishables protection.',icon:Snowflake},
 routes:{title:'Routes & ETA',subtitle:'Plan lanes, monitor movement and identify route risk.',icon:Route},
 docks:{title:'Docks & Gate Pass',subtitle:'Coordinate arrival, unloading, dock appointments and gate workflows.',icon:Warehouse},
 requests:{title:'Pickup Requests',subtitle:'Review incoming logistics requests and dispatch them.',icon:ClipboardList},
 alerts:{title:'Logistics Alerts',subtitle:'Surface shipment, capacity and delivery exceptions.',icon:BellRing},
 analytics:{title:'Logistics Analytics',subtitle:'Operational KPIs calculated from available AgriMark logistics data.',icon:BarChart3},
};

export default function LogisticsModulePage({params}:{params:{module:string}}) {
 const key = (params.module in modules ? params.module : 'dispatch') as ModuleKey;
 const meta=modules[key], Icon=meta.icon;
 const [requests,setRequests]=useState<LogisticsRequest[]>([]); const [loading,setLoading]=useState(true);
 const load=async()=>{setLoading(true);try{setRequests(await dataService.getLogisticsRequests());}finally{setLoading(false);}};
 useEffect(()=>{void load();},[]);
 const active=requests.filter(r=>r.status!=='delivered');
 const inTransit=requests.filter(r=>r.status==='in_transit');
 const assigned=requests.filter(r=>r.status==='assigned');
 const delivered=requests.filter(r=>r.status==='delivered');
 const requested=requests.filter(r=>r.status==='requested');
 const totalKg=requests.reduce((s,r)=>s+Number(r.weight_kg||0),0);
 const vehicles=useMemo(()=>Array.from(new Set(requests.map(r=>r.vehicle_type))),[requests]);
 const drivers=useMemo(()=>Array.from(new Set(requests.map(r=>r.driver_name).filter(Boolean))),[requests]);
 const rows = key==='requests'?requested:key==='dispatch'?active:key==='drivers'?requests.filter(r=>r.driver_name):key==='fleet'?requests:key==='cold-chain'?requests.filter(r=>/Refrigerated/i.test(r.vehicle_type)):requests;
 return <div className='min-h-full space-y-5'>
  <section className='rounded-2xl border border-[#1e2d26] bg-[#121a16] p-5 md:p-6'><div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'><div><div className='mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-800/50 bg-emerald-950/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[.18em] text-emerald-300'><Icon className='h-3.5 w-3.5'/> Logistics Platform</div><h1 className='text-xl font-bold text-white md:text-2xl'>{meta.title}</h1><p className='mt-1 text-xs text-gray-400'>{meta.subtitle}</p></div><button onClick={()=>void load()} className='inline-flex items-center gap-2 self-start rounded-xl border border-[#294238] bg-[#0a0f0d] px-3 py-2 text-xs font-semibold text-gray-300 hover:text-white'><RefreshCw className='h-4 w-4'/> Refresh data</button></div></section>
  <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>{[['Active',active.length,Truck],['Requests',requested.length,ClipboardList],['In transit',inTransit.length,Navigation],['Total cargo',totalKg.toLocaleString('en-IN')+' kg',PackageCheck]].map(([label,value,I])=>{const C=I as typeof Truck;return <div key={String(label)} className='rounded-2xl border border-[#1e2d26] bg-[#121a16] p-4'><C className='h-4 w-4 text-emerald-400'/><p className='mt-3 text-[10px] uppercase tracking-wider text-gray-500'>{label}</p><p className='mt-1 text-lg font-bold text-white'>{String(value)}</p></div>})}</div>
  {(key==='cold-chain'||key==='alerts'||key==='routes'||key==='docks')&&<div className='rounded-2xl border border-amber-900/50 bg-amber-950/20 p-4'><div className='flex items-center gap-2 text-amber-300'><AlertTriangle className='h-4 w-4'/><span className='text-xs font-bold'>Live-data boundary</span></div><p className='mt-1 text-xs leading-5 text-gray-400'>This module uses real AgriMark logistics records where available. Sensor, dock, route and exception data are not fabricated.</p></div>}
  <div className='grid grid-cols-1 gap-5 xl:grid-cols-[1fr_300px]'><section className='rounded-2xl border border-[#1e2d26] bg-[#121a16] p-4 md:p-5'><div className='mb-4 flex items-center justify-between'><div><h2 className='text-base font-bold text-white'>Operational records</h2><p className='text-[11px] text-gray-500'>Live records available to this module.</p></div><span className='text-[10px] font-mono text-gray-500'>{rows.length} records</span></div>
  {loading?<div className='space-y-3'>{[1,2,3].map(n=><div key={n} className='h-20 animate-pulse rounded-xl bg-[#0a0f0d]'/>)}</div>:rows.length===0?<div className='rounded-xl border border-dashed border-[#294238] bg-[#0a0f0d] py-14 text-center'><Icon className='mx-auto mb-3 h-8 w-8 text-gray-600'/><p className='text-sm font-semibold text-gray-300'>No records available</p><p className='mt-1 text-xs text-gray-500'>This view will populate as the corresponding logistics workflow creates records.</p></div>:<div className='space-y-2'>{rows.map(r=><article key={r.id} className='rounded-xl border border-[#1e2d26] bg-[#0a0f0d] p-4'><div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'><div><h3 className='text-sm font-bold text-white'>{r.crop_name} · {Number(r.weight_kg||0).toLocaleString('en-IN')} kg</h3><p className='mt-1 text-[10px] font-mono text-gray-500'>{r.tracking_code}</p></div><div className='flex flex-wrap gap-2 text-[10px]'><span className='rounded-full border border-emerald-800/40 bg-emerald-950/30 px-2 py-1 text-emerald-300'>{r.status.replace('_',' ')}</span><span className='rounded-full border border-[#294238] px-2 py-1 text-gray-400'>{r.vehicle_type}</span></div></div><div className='mt-3 grid gap-2 md:grid-cols-2'><div className='rounded-lg bg-[#121a16] px-3 py-2'><span className='text-[9px] uppercase text-gray-500'>Pickup</span><p className='text-xs text-gray-200'>{r.pickup_location}</p></div><div className='rounded-lg bg-[#121a16] px-3 py-2'><span className='text-[9px] uppercase text-gray-500'>Destination</span><p className='text-xs text-gray-200'>{r.delivery_location}</p></div></div>{r.driver_name&&<p className='mt-2 text-[10px] text-gray-500'>Driver: <span className='text-gray-300'>{r.driver_name}</span>{r.driver_phone?' · '+r.driver_phone:''}</p>}</article>)}</div>}</section>
  <aside className='space-y-3'><div className='rounded-2xl border border-[#1e2d26] bg-[#121a16] p-4'><div className='flex items-center gap-2'><ShieldCheck className='h-4 w-4 text-emerald-400'/><h2 className='text-sm font-bold text-white'>Network snapshot</h2></div><div className='mt-3 space-y-2 text-xs'><div className='flex justify-between'><span className='text-gray-500'>Vehicle types</span><span className='font-semibold text-white'>{vehicles.length}</span></div><div className='flex justify-between'><span className='text-gray-500'>Drivers seen</span><span className='font-semibold text-white'>{drivers.length}</span></div><div className='flex justify-between'><span className='text-gray-500'>Delivered</span><span className='font-semibold text-emerald-400'>{delivered.length}</span></div><div className='flex justify-between'><span className='text-gray-500'>Assigned</span><span className='font-semibold text-white'>{assigned.length}</span></div></div></div>
  <div className='rounded-2xl border border-[#1e2d26] bg-[#121a16] p-4'><h2 className='text-sm font-bold text-white'>Logistics modules</h2><div className='mt-3 space-y-1'>{Object.entries(modules).map(([slug,m])=>{const M=m.icon;return <Link key={slug} href={'/logistics/'+slug} className={'flex items-center justify-between rounded-lg px-2.5 py-2 text-[11px] '+(slug===key?'bg-emerald-600 text-white':'text-gray-400 hover:bg-[#18241f] hover:text-white')}><span className='flex items-center gap-2'><M className='h-3.5 w-3.5'/>{m.title}</span><ArrowRight className='h-3 w-3'/></Link>})}</div></div></aside></div>
 </div>;
}