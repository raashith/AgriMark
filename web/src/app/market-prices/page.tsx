'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, ArrowUpRight, BarChart3, BrainCircuit, CalendarDays, ChevronDown, Database, Globe2, Landmark, MapPin, RefreshCw, Search, ShieldCheck, Sprout, TrendingUp, Wheat } from 'lucide-react';

type Opt={code:string;name:string;state_code?:string};
type Row={id:number;commodity_code:string;mandi_code:string|null;state_code:string|null;observation_date:string;modal_price:number;min_price:number;max_price:number;arrival_quantity:number|null;source:string|null;commodity_name:string;mandi_name:string;state_name:string;imported_csv?:boolean};
const nf=new Intl.NumberFormat('en-IN',{maximumFractionDigits:0}); const ru=(n:number)=>'₹'+nf.format(n); const dt=(s:string)=>s?new Date(s+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short'}):'—';

export default function MarketPricesPage(){
 const [rows,S]=useState<Row[]>([]),[commodities,SC]=useState<Opt[]>([]),[states,SS]=useState<Opt[]>([]),[mandis,SM]=useState<Opt[]>([]),[commodity,C]=useState(''),[state,T]=useState(''),[mandi,M]=useState(''),[search,Q]=useState(''),[loading,L]=useState(true),[error,E]=useState(''),[updated,U]=useState(''),[page,P]=useState(1),[pageSize,PS]=useState(100),[apiCapped,setApiCapped]=useState(false);
 const load=useCallback(async()=>{
  L(true);E('');
  const controller=new AbortController();
  const timeout=window.setTimeout(()=>controller.abort(),55000);
  try{
   const params=new URLSearchParams();if(commodity)params.set('commodity',commodity);if(state)params.set('state',state);if(mandi)params.set('mandi',mandi);if(search.trim())params.set('search',search.trim());params.set('limit','10000');
   const response=await fetch('/api/market-prices'+(params.size?'?'+params.toString():''),{cache:'no-store',signal:controller.signal});
   const payload=await response.json() as {ok?:boolean;rows?:any[];commodities?:any[];states?:any[];mandis?:any[];error?:string;warnings?:string[];capped?:boolean;latest_observation_date?:string|null};
   if(!response.ok||!payload.ok)throw new Error(payload.error||`Market data API failed (HTTP ${response.status}).`);
   S((payload.rows||[]) as Row[]);setApiCapped(Boolean(payload.capped));
   const commodityOptions=(payload.commodities||[]).map((r:any)=>({code:r.code,name:r.name}));
   const stateOptions=(payload.states||[]).map((r:any)=>({code:r.state_code||r.code,name:r.state_name||r.name}));
   const mandiOptions=(payload.mandis||[]).map((r:any)=>({code:r.mandi_code||r.code,name:r.mandi_name||r.name,state_code:r.state_code}));
   SC([...new Map(commodityOptions.map((r:Opt)=>[r.code,r])).values()]);
   SS([...new Map(stateOptions.map((r:Opt)=>[r.code,r])).values()]);
   SM([...new Map(mandiOptions.map((r:Opt)=>[r.code,r])).values()]);
   U(new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}));
   if(payload.warnings?.length)E(payload.warnings.join(' '));
  }catch(e){
   const err=e as {message?:string;name?:string};
   E(err.name==='AbortError'?'Market data request timed out after 55 seconds. Please retry; the API may be slow.':err.message||'Could not load market observations. Please retry.');
   S([]);
  }finally{window.clearTimeout(timeout);L(false);}
 },[commodity,state,mandi,search]);
 useEffect(()=>{void load()},[load]);
 const filtered=rows;
 const totalPages=Math.max(1,Math.ceil(filtered.length/pageSize));
 const pageRows=useMemo(()=>filtered.slice((page-1)*pageSize,page*pageSize),[filtered,page,pageSize]);
 useEffect(()=>{P(1)},[commodity,state,mandi,search,pageSize]);
 const latest=[...filtered].sort((a,b)=>b.observation_date.localeCompare(a.observation_date)||Number(b.id)-Number(a.id))[0];
 const dates=[...new Set(filtered.map(r=>r.observation_date))].sort();

 // Forecast only the exact selected series. If no mandi is selected, a state
 // aggregate is clearly labelled. National mode uses one median per date.
 const forecastRows=useMemo(()=>filtered.filter(r=>{
   if(!commodity)return false;
   if(mandi)return r.mandi_code===mandi;
   if(state)return r.state_code===state;
   return true;
 }),[filtered,commodity,mandi,state]);
 const history=useMemo(()=>{
   const m=new Map<string,number[]>();
   forecastRows.forEach(r=>{if(Number(r.modal_price)>0){if(!m.has(r.observation_date))m.set(r.observation_date,[]);m.get(r.observation_date)!.push(Number(r.modal_price));}});
   return [...m.entries()].sort((a,b)=>a[0].localeCompare(b[0])).map(([date,values])=>({date,price:[...values].sort((a,b)=>a-b)[Math.floor(values.length/2)]}));
 },[forecastRows]);
 const barData=useMemo(()=>{const groups=new Map<string,{label:string;prices:number[];rows:Row[]}>();for(const r of filtered){const key=commodity?(r.mandi_code||r.mandi_name):(r.commodity_code||r.commodity_name);const label=commodity?r.mandi_name:r.commodity_name;const item=groups.get(key)||{label,prices:[],rows:[]};item.prices.push(r.modal_price);item.rows.push(r);groups.set(key,item);}return [...groups.values()].map(g=>({label:g.label,price:g.prices.sort((a,b)=>a-b)[Math.floor(g.prices.length/2)],min:Math.min(...g.rows.map(r=>r.min_price)),max:Math.max(...g.rows.map(r=>r.max_price)),date:g.rows.map(r=>r.observation_date).sort().at(-1)||''})).sort((a,b)=>b.price-a.price).slice(0,8);},[filtered,commodity]);

 type ForecastPoint={target_date:string;forecast_horizon_days:number;predicted_value:number;lower_bound_95:number;upper_bound_95:number;data_type?:string};
 const [forecast,setForecast]=useState<{cur:number;expected:number;change:number;points:number[];details:ForecastPoint[];modelName:string|null;observedCount:number;trainingStatus:string}|null>(null);
 const [forecastLoading,setForecastLoading]=useState(false),[forecastMessage,setForecastMessage]=useState('Choose a commodity and market scope to inspect forecast readiness.');
 const [fallbackForecast,setFallbackForecast]=useState<{value:number;label:string}|null>(null);
 const latestPrice=latest&&Number.isFinite(Number(latest.modal_price))?Number(latest.modal_price):null;
 const loadedCount=filtered.length;

 useEffect(()=>{
   setForecast(null);setFallbackForecast(null);
   if(!commodity){
     setForecastLoading(false);
     setFallbackForecast(latestPrice===null?null:{value:latestPrice,label:'Latest observed-price baseline · select a crop for forecast'});
     setForecastMessage('Showing the latest real price stored in Supabase. Select a commodity to inspect its history.');
     return;
   }
   if(!history.length){
     setForecastLoading(false);
     setForecastMessage('No stored observations match this commodity and selected market scope.');
     return;
   }
   setForecastLoading(true);
   setForecastMessage('Checking distinct observation dates and calculating a reference series…');
   try{
     const series=history.slice(-30), last=series[series.length-1], baseline=last.price, trained=series.length>=5;
     let slope=0,intercept=baseline,residualStd=0;
     if(trained){
       const xs=series.map(p=>(Date.parse(p.date+'T00:00:00Z')-Date.parse(series[0].date+'T00:00:00Z'))/86400000);
       const meanX=xs.reduce((a,b)=>a+b,0)/xs.length,meanY=series.reduce((a,p)=>a+p.price,0)/series.length;
       const denominator=xs.reduce((sum,x)=>sum+(x-meanX)**2,0);
       slope=denominator?xs.reduce((sum,x,i)=>sum+(x-meanX)*(series[i].price-meanY),0)/denominator:0;
       slope=Math.max(-50,Math.min(50,slope));
       intercept=meanY-slope*meanX;
       const residuals=series.map((p,i)=>p.price-(intercept+slope*xs[i]));
       residualStd=Math.sqrt(residuals.reduce((sum,v)=>sum+v*v,0)/Math.max(1,residuals.length-2));
     }
     const lastElapsed=(Date.parse(last.date+'T00:00:00Z')-Date.parse(series[0].date+'T00:00:00Z'))/86400000;
     const details:ForecastPoint[]=Array.from({length:7},(_,i)=>{
       const horizon=i+1, predicted=Math.max(0,trained?intercept+slope*(lastElapsed+horizon):baseline);
       const uncertainty=trained?Math.max(residualStd,baseline*0.02)*1.96:Math.max(baseline*0.03,0);
       const target=new Date(last.date+'T00:00:00.000Z');target.setUTCDate(target.getUTCDate()+horizon);
       return {target_date:target.toISOString().slice(0,10),forecast_horizon_days:horizon,predicted_value:Math.round(predicted*100)/100,
         lower_bound_95:Math.max(0,Math.round((predicted-uncertainty)*100)/100),upper_bound_95:Math.round((predicted+uncertainty)*100)/100,
         data_type:trained?'LOCAL_TREND_NOT_BACKTESTED':'BASELINE_NOT_TRAINED'};
     });
     const expected=details[6].predicted_value;
     setForecast({cur:baseline,expected,change:(expected-baseline)/Math.max(baseline,1)*100,points:details.map(p=>p.predicted_value),details,modelName:trained?'Local linear trend · not backtested':null,observedCount:series.length,trainingStatus:trained?'TREND_FIT_NOT_VALIDATED':'BASELINE_ONLY'});
     setForecastMessage(trained
       ? 'Indicative trend based on distinct dated observations. This simple trend has not passed rolling-origin validation.'
       : 'Baseline only: fewer than five distinct observation dates are available. This repeats the latest observed price; it is not a trained prediction.');
   }catch{
     setForecastMessage('Forecast readiness could not be calculated from the loaded observations.');
   }finally{setForecastLoading(false);}
 },[commodity,state,mandi,history,latestPrice]);

 const commoditiesForSelectedState=mandis.filter(m=>!state||m.state_code===state);
 const onStateChange=(value:string)=>{T(value);M('');};
 const onCommodityChange=(value:string)=>{C(value);};
 return <main className="min-h-screen bg-[#06140e] text-white"><div className="mx-auto max-w-[1600px] space-y-6 px-4 py-5 md:px-6 md:py-8">
 <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-800 bg-emerald-950/60 px-3 py-1 text-xs font-bold text-emerald-300"><Sprout size={14}/> AGRIMARK INTELLIGENCE</div><h1 className="text-3xl font-black tracking-tight md:text-4xl">Mandi Price Intelligence</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Official observed prices and clearly labelled reference forecasts from stored AGMARKNET records.</p></div><div className="flex flex-wrap items-center gap-2 text-xs text-slate-400"><Database size={15} className="text-emerald-300"/><span>Supabase · {updated?'checked '+updated:'loading source status'}</span><button onClick={()=>void load()} className="rounded-xl border border-emerald-800 p-2 text-emerald-300" aria-label="Refresh market prices"><RefreshCw size={15}/></button></div></header>
 <section className="grid grid-cols-1 gap-3 rounded-3xl border border-emerald-800/70 bg-[#0b1e15] p-4 md:grid-cols-2 xl:grid-cols-4">
 <Picker label="Commodity" value={commodity} change={onCommodityChange} opts={commodities} icon={<Wheat size={17}/>}/>
 <Picker label="State" value={state} change={onStateChange} opts={states} icon={<Globe2 size={17}/>}/>
 <Picker label="Mandi" value={mandi} change={M} opts={commoditiesForSelectedState.map(m=>({code:m.mandi_code||m.code,name:m.mandi_name||m.name,state_code:m.state_code}))} icon={<MapPin size={17}/>}/>
 <label className="flex min-h-12 items-center gap-2 rounded-xl border border-emerald-900 bg-[#071711] px-3"><Search size={17} className="text-emerald-300"/><input value={search} onChange={e=>Q(e.target.value)} placeholder="Search commodity, mandi, state" className="min-w-0 flex-1 bg-transparent text-sm outline-none"/></label>
 </section>
 {error&&<div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-700/70 bg-amber-950/30 p-4 text-sm text-amber-100"><span>{error}</span><button onClick={()=>void load()} className="rounded-lg border border-amber-700 px-3 py-1.5 font-bold">Retry</button></div>}
 {loading?<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1,2,3,4].map(i=><div key={i} className="h-28 animate-pulse rounded-2xl border border-emerald-900 bg-[#0b1e15]"/>)}<div className="col-span-full h-64 animate-pulse rounded-3xl border border-emerald-900 bg-[#0b1e15]"/></div>:<>
 <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
 <Metric label="Latest modal price" value={latest?ru(latest.modal_price):'—'} detail={latest?latest.commodity_name+' · '+latest.observation_date:'No observed rows for these filters'} icon={<TrendingUp size={18}/>}/>
 <Metric label="Market records" value={nf.format(filtered.length)} detail={apiCapped?'API row cap reached · narrow filters':'Filtered stored observations'} icon={<Database size={18}/>}/>
 <Metric label="Mandi coverage" value={nf.format(new Set(filtered.map(r=>r.mandi_code).filter(Boolean)).size)} detail="Distinct mandis represented in results" icon={<MapPin size={18}/>}/>
 <Metric label="Observed dates" value={nf.format(dates.length)} detail={dates.length?dates[0]+' — '+dates[dates.length-1]:'No date coverage'} icon={<CalendarDays size={18}/>}/>
 </section>
 <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_.8fr]">
 <div className="rounded-3xl border border-emerald-800/70 bg-[#0b1e15] p-5"><div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-black">Observed price comparison</h2><p className="mt-1 text-xs text-slate-400">Source prices, ranked by modal value · ₹ per quintal</p></div><span className="rounded-full border border-emerald-800 px-3 py-1 text-xs text-emerald-300">{barData.length} groups</span></div><MandiBarChart data={barData} selectedCommodity={commodity} selectedMandi={mandi} dates={dates.length}/></div>
 <aside className="rounded-3xl border border-emerald-800/70 bg-gradient-to-b from-[#10271b] to-[#08170f] p-5"><div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-black">7-day reference</h2><p className="mt-1 text-xs text-slate-400">Availability and readiness, not a guaranteed price</p></div><BrainCircuit size={23} className="text-emerald-300"/></div>
 {forecastLoading?<div className="mt-5 space-y-3"><div className="h-9 animate-pulse rounded-xl bg-emerald-950"/><div className="h-48 animate-pulse rounded-xl bg-emerald-950"/></div>:forecast&&forecast.details.length?<><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl border border-emerald-900 bg-[#071711] p-3"><div className="text-xs text-slate-400">Last median price</div><div className="mt-1 text-2xl font-black">{ru(forecast.cur)}</div></div><div className="rounded-2xl border border-emerald-900 bg-[#071711] p-3"><div className="text-xs text-slate-400">Day 7 baseline/trend</div><div className="mt-1 text-2xl font-black text-emerald-300">{ru(forecast.expected)}</div></div></div><div className="mt-4"><Chart history={history} future={forecast.points} values={[...history.map(p=>p.price),...forecast.points]}/></div><div className="mt-4 space-y-2">{forecast.details.map(p=><div key={p.target_date} className="flex items-center justify-between rounded-xl border border-emerald-950 bg-[#071711] px-3 py-2 text-sm"><span className="text-slate-400">{p.target_date}</span><strong>{ru(p.predicted_value)}</strong><span className="text-xs text-slate-400">{ru(p.lower_bound_95)} – {ru(p.upper_bound_95)}</span></div>)}</div></>:<div className="mt-5 rounded-2xl border border-dashed border-emerald-800 bg-[#071711] p-5"><div className="mb-2 flex items-center gap-2 font-bold text-amber-300"><Activity size={18}/>{forecastMessage.startsWith('Choose')?'Select a commodity':'Forecast not available yet'}</div><p className="text-sm leading-6 text-slate-300">{forecastMessage}</p></div>}
 <div className="mt-4 flex items-start gap-2 rounded-xl bg-black/20 p-3 text-xs leading-5 text-slate-400"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-400"/><span>{forecastMessage} Actual observations are separate from estimates.</span></div></aside>
 </section>
 <section className="grid grid-cols-1 gap-4 xl:grid-cols-[.8fr_1.2fr]"><div className="rounded-3xl border border-emerald-800/70 bg-[#0b1e15] p-5"><div className="flex items-center gap-2"><span className="rounded-xl bg-amber-950 p-2 text-amber-300"><BrainCircuit size={20}/></span><div><h2 className="text-lg font-black">Market Insights</h2><p className="text-xs text-slate-400">Derived from observed records</p></div></div><p className="mt-4 text-sm leading-6 text-slate-200">{forecast?forecast.trainingStatus==='BASELINE_ONLY'?'There is insufficient dated history to infer a rising or falling trend.': 'A simple trend fit is available but has not been backtested.': 'More historical dates are needed before a market direction can be assessed.'}</p><div className="mt-4 grid grid-cols-3 gap-2">{[['History',history.length>=5?'Minimum points reached':'Insufficient'],['Model',forecast?.modelName?'Unvalidated trend':'Baseline only'],['Confidence','Indicative only']].map(([a,b])=><div key={a} className="rounded-xl border border-emerald-900 bg-[#071711] p-3"><div className="text-[11px] text-slate-400">{a}</div><div className="mt-1 text-sm font-bold text-emerald-300">{b}</div></div>)}</div></div><div className="overflow-hidden rounded-3xl border border-emerald-800/70 bg-gradient-to-br from-[#10271b] to-[#08170f] shadow-xl shadow-black/20"><div className="flex items-center justify-between border-b border-emerald-900 p-5"><div><h2 className="text-lg font-black">Latest Mandi Prices</h2><p className="text-xs text-slate-400">Most recent recorded observation per mandi</p></div><span className="rounded-full border border-emerald-800 px-3 py-1 text-xs text-emerald-300">{new Set(filtered.map(r=>r.mandi_code).filter(Boolean)).size} mandis</span></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-[#071711] text-xs text-slate-400"><tr><th className="px-4 py-3">#</th><th className="px-4 py-3">Mandi</th><th className="px-4 py-3">State</th><th className="px-4 py-3 text-right">Modal Price</th></tr></thead><tbody>{[...new Map(filtered.map(r=>[r.mandi_code||r.mandi_name,r])).values()].slice(0,6).map((r,i)=><tr key={r.id} className="border-t border-emerald-950 hover:bg-emerald-950/40"><td className="px-4 py-3 text-emerald-300">{i+1}</td><td className="px-4 py-3 font-semibold">{r.mandi_name}</td><td className="px-4 py-3 text-slate-400">{r.state_name}</td><td className="px-4 py-3 text-right font-black text-emerald-300">{ru(r.modal_price)}</td></tr>)}</tbody></table></div></div></section>
 <section className="overflow-hidden rounded-3xl border border-emerald-800/70 bg-[#0b1e15]"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-900 p-5"><div><h2 className="text-xl font-black">Latest Market Observations</h2><p className="mt-1 text-xs text-slate-400">Stored records · date and source retained</p></div><button onClick={()=>void load()} className="flex items-center gap-2 rounded-xl border border-emerald-800 px-3 py-2 text-sm font-bold text-emerald-300"><RefreshCw size={15}/> Refresh · {updated||'—'}</button></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#071711] text-xs uppercase text-slate-400"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Commodity</th><th className="px-4 py-3">Mandi</th><th className="px-4 py-3">State</th><th className="px-4 py-3 text-right">Min</th><th className="px-4 py-3 text-right">Modal</th><th className="px-4 py-3 text-right">Max</th><th className="px-4 py-3">Source</th></tr></thead><tbody>{pageRows.map(r=><tr key={r.id} className="border-t border-emerald-950 hover:bg-emerald-950/30"><td className="whitespace-nowrap px-4 py-3 text-slate-400">{r.observation_date}</td><td className="px-4 py-3 font-semibold">{r.commodity_name}</td><td className="px-4 py-3">{r.mandi_name}</td><td className="px-4 py-3 text-slate-400">{r.state_name}</td><td className="px-4 py-3 text-right">{ru(r.min_price)}</td><td className="px-4 py-3 text-right font-black text-emerald-300">{ru(r.modal_price)}</td><td className="px-4 py-3 text-right">{ru(r.max_price)}</td><td className="px-4 py-3 text-xs text-slate-400">{r.source||'AGMARKNET'}</td></tr>)}</tbody></table></div><div className="flex flex-wrap items-center justify-between gap-3 border-t border-emerald-900 px-5 py-3 text-xs text-slate-400"><span>Showing {filtered.length?((page-1)*pageSize+1):0}–{Math.min(page*pageSize,filtered.length)} of {nf.format(filtered.length)} matching records · {nf.format(rows.length)} loaded</span><div className="flex flex-wrap items-center gap-2"><label className="flex items-center gap-2">Rows <select value={pageSize} onChange={e=>PS(Number(e.target.value))} className="rounded-lg border border-emerald-800 bg-[#071711] px-2 py-1 text-slate-200"><option value={50}>50</option><option value={100}>100</option><option value={250}>250</option><option value={500}>500</option></select></label><button disabled={page<=1} onClick={()=>P(p=>Math.max(1,p-1))} className="rounded-lg border border-emerald-800 px-3 py-1.5 font-bold text-emerald-300 disabled:opacity-40">Previous</button><span>Page {page} / {totalPages}</span><button disabled={page>=totalPages} onClick={()=>P(p=>Math.min(totalPages,p+1))} className="rounded-lg border border-emerald-800 px-3 py-1.5 font-bold text-emerald-300 disabled:opacity-40">Next</button></div></div></section></>}
 <footer className="flex flex-wrap items-center justify-between gap-3 pb-6 text-xs text-slate-500"><span className="flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-400"/> Data source: AGMARKNET / DMI via Supabase</span><span>Prices in ₹ per quintal · Updated {updated||'when records load'}</span></footer>
 </div></main>;
}

function Picker({label,value,change,opts,icon}:{label:string;value:string;change:(v:string)=>void;opts:Opt[];icon:React.ReactNode}){
 return <label className="flex min-h-12 min-w-0 items-center gap-2 rounded-xl border border-emerald-900 bg-[#071711] px-3"><span className="text-emerald-300">{icon}</span><span className="sr-only">{label}</span><select value={value} onChange={e=>change(e.target.value)} className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none"><option value="" className="bg-[#071711]">All {label.toLowerCase()}s</option>{opts.map(o=><option key={o.code} value={o.code} className="bg-[#071711]">{o.name}</option>)}</select></label>;
}
function Metric({label,value,detail,icon}:{label:string;value:string;detail:string;icon:React.ReactNode}){
 return <div className="min-w-0 rounded-2xl border border-emerald-800/70 bg-gradient-to-br from-[#132c20] to-[#08170f] p-4 shadow-lg shadow-black/10 transition duration-300 hover:-translate-y-1 hover:border-emerald-400/40 hover:shadow-[0_16px_38px_rgba(16,185,129,.10)] md:p-5"><div className="flex items-center justify-between gap-2"><span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 md:text-xs">{label}</span><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-950 text-emerald-300">{icon}</span></div><div className="mt-3 break-words text-2xl font-black md:text-3xl">{value}</div><div className="mt-1 text-xs text-slate-400">{detail}</div></div>;
}
function MandiBarChart({data,selectedCommodity,selectedMandi,dates}:{data:{label:string;price:number;min:number;max:number;date:string}[];selectedCommodity:string;selectedMandi:string;dates:number}){
 if(!data.length)return <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-emerald-900 bg-[#06140e] p-6 text-center text-sm text-slate-400">No actual mandi price records match these filters.</div>;
 const max=Math.max(...data.map(d=>d.price),1),chartHeight=250,left=46,right=18,top=24,bottom=68,plotWidth=790-left-right,plotHeight=chartHeight-top-bottom;
 const barWidth=Math.min(54,Math.max(18,plotWidth/data.length*.52)),label=(s:string)=>s.length>17?s.slice(0,16)+'…':s;
 return <div className="overflow-hidden rounded-2xl border border-emerald-950 bg-[#06140e] p-2 md:p-4"><div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-2"><div><div className="font-bold text-white">{selectedCommodity?(selectedMandi?'Selected mandi modal price':'Modal price by mandi'):'Modal price by commodity'}</div><div className="mt-1 text-xs text-slate-400">Actual AGMARKNET values · ₹ per quintal · {dates} observed date(s)</div></div><span className="rounded-full border border-emerald-800 px-3 py-1 text-xs text-emerald-300">{data.length} bars</span></div><svg viewBox={`0 0 790 ${chartHeight}`} className="w-full" role="img" aria-label="Bar chart of actual AgriMark mandi modal prices">{[0,1,2,3,4].map(i=>{const value=max*(1-i/4),yy=top+i*plotHeight/4;return <g key={i}><line x1={left} y1={yy} x2={790-right} y2={yy} stroke="#17372a" strokeDasharray="3 5"/><text x={left-8} y={yy+4} fill="#8aa497" textAnchor="end" fontSize="10">{nf.format(value)}</text></g>})}{data.map((d,i)=>{const step=plotWidth/data.length,cx=left+step*i+step/2,bh=Math.max(2,d.price/max*plotHeight),yy=top+plotHeight-bh;return <g key={d.label}><rect x={cx-barWidth/2} y={yy} width={barWidth} height={bh} rx="5" fill="#23e3b0" fillOpacity=".78" stroke="#52f5ca" strokeWidth="1"/><text x={cx} y={Math.max(top+12,yy-7)} fill="#eafff7" textAnchor="middle" fontSize="10" fontWeight="700">{nf.format(d.price)}</text><text transform={`translate(${cx} ${top+plotHeight+14}) rotate(-32)`} fill="#9bb2a6" textAnchor="end" fontSize="10">{label(d.label)}</text></g>})}</svg><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 px-2 text-xs text-slate-400"><span><i className="mr-2 inline-block h-2.5 w-2.5 rounded-sm bg-emerald-400"/>Observed modal price</span><span>Bars ranked highest to lowest</span><span>Source: stored AGMARKNET observations</span></div></div>;
}
function Chart({history,future,values}:{history:{date:string;price:number}[];future:number[];values:number[]}){
 const min=Math.min(...values)*.9,max=Math.max(...values)*1.1,total=history.length+future.length,x=(i:number)=>44+i/Math.max(total-1,1)*720,y=(v:number)=>18+(1-(v-min)/Math.max(max-min,1))*205,actual=history.map((p,i)=>(i?'L':'M')+' '+x(i)+' '+y(p.price)).join(' '),projected=[history[history.length-1]?.price||0,...future].map((v,i)=>(i?'L':'M')+' '+x(history.length-1+i)+' '+y(v)).join(' ');
 return <div className="overflow-hidden rounded-2xl border border-emerald-950 bg-[#06140e] p-2 md:p-4"><svg viewBox="0 0 790 270" className="w-full" role="img" aria-label="Historical mandi prices and forecast">{[0,1,2,3,4].map(i=><g key={i}><line x1="44" y1={18+i*51} x2="764" y2={18+i*51} stroke="#17372a" strokeDasharray="3 5"/><text x="37" y={22+i*51} fill="#8aa497" textAnchor="end" fontSize="10">{nf.format(max-(max-min)*i/4)}</text></g>)}{history.length>1&&<path d={actual} fill="none" stroke="#23e3b0" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>}{history.map((p,i)=><circle key={p.date} cx={x(i)} cy={y(p.price)} r="4" fill="#23e3b0"/>)}{future.length>0&&<><path d={projected} fill="none" stroke="#ffc63b" strokeWidth="3" strokeDasharray="7 6"/>{future.map((v,i)=><circle key={i} cx={x(history.length+i)} cy={y(v)} r="4" fill="#ffc63b"/>)}</>}{history.map((p,i)=>(i===0||i===history.length-1)?<text key={p.date} x={x(i)} y="251" fill="#9bb2a6" textAnchor={i===0?'start':'end'} fontSize="11">{dt(p.date)}</text>:null)}{future.length>0&&<text x="764" y="251" fill="#ffc63b" textAnchor="end" fontSize="11">Next 7 days</text>}</svg></div>;
}
