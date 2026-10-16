'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, ExternalLink, Landmark, Lightbulb, MapPin, RefreshCw, ShieldCheck, TrendingDown, TrendingUp, Truck } from 'lucide-react';
import { marketSupabase } from '@/lib/market-supabase';


type Option = { code: string; name: string; state_code?: string; district_code?: string };
type Row = {
  id: number;
  commodity_code: string;
  mandi_code: string | null;
  state_code: string | null;
  district_code: string | null;
  observation_date: string;
  modal_price: number;
  min_price: number;
  max_price: number;
  source: string;
};
type DisplayRow = Row & {
  commodity_name: string;
  mandi_name: string;
  state_name: string;
  district_name: string;
};

const PAGE_SIZE = 100;
const INDIAN = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });


type ForecastSummary = { current: number; expected: number; min: number; max: number; changePct: number; points: number[]; confidence: number; insight: string };

function calculateForecast(rows: DisplayRow[]): ForecastSummary | null {
  const dated = [...rows].filter(r => Number(r.modal_price) > 0 && !!r.observation_date).sort((a,b)=>a.observation_date.localeCompare(b.observation_date));
  const byDay = new Map<string, number[]>();
  dated.forEach(r => byDay.set(r.observation_date, [...(byDay.get(r.observation_date)||[]), Number(r.modal_price)]));
  const daily = [...byDay.values()].map(values => values.sort((a,b)=>a-b)[Math.floor(values.length/2)]);
  if (daily.length < 5) return null;
  const recent = daily.slice(-30), n = recent.length;
  const xm = (n-1)/2, ym = recent.reduce((a,b)=>a+b,0)/n;
  const denom = recent.reduce((s,_,i)=>s+(i-xm)**2,0)||1;
  const slope = recent.reduce((s,y,i)=>s+(i-xm)*(y-ym),0)/denom;
  const boundedSlope = Math.max(-ym*0.015,Math.min(ym*0.015,slope));
  const current = recent[recent.length-1];
  const expected = Math.max(0,current+boundedSlope*7);
  const residual = Math.sqrt(recent.reduce((s,y,i)=>s+(y-(ym+boundedSlope*(i-xm)))**2,0)/n);
  const spread = Math.max(residual*1.28,current*0.025);
  const changePct = current ? (expected-current)/current*100 : 0;
  return { current, expected, min:Math.max(0,expected-spread), max:expected+spread, changePct, points:Array.from({length:7},(_,i)=>Math.max(0,current+boundedSlope*(i+1))), confidence:Math.max(20,Math.min(85,Math.round(85-(residual/Math.max(current,1))*180))), insight: changePct>1.5 ? 'Recent stored observations suggest a modest upward trend.' : changePct < -1.5 ? 'Recent stored observations suggest a modest downward trend.' : 'Recent stored observations suggest prices may remain broadly stable.' };
}

function ForecastChart({ rows, forecast }: { rows: DisplayRow[]; forecast: ForecastSummary | null }) {
  const series = [...rows].sort((a,b)=>a.observation_date.localeCompare(b.observation_date)).slice(-24);
  const vals = series.map(r=>Number(r.modal_price)).filter(v=>Number.isFinite(v)&&v>0);
  if (!forecast || vals.length<5) return <div className="flex min-h-56 items-center justify-center rounded-xl border border-[#18382b] bg-[#071610] p-6 text-center text-sm text-slate-400">Not enough dated price observations for a reliable trend estimate. Try a broader date range or fewer filters.</div>;
  const all=[...vals,forecast.min,forecast.max], lo=Math.max(0,Math.min(...all)*.88), hi=Math.max(...all)*1.08;
  const x=(i:number,total:number)=>38+i/Math.max(total-1,1)*620, y=(v:number)=>16+(1-(v-lo)/Math.max(hi-lo,1))*142;
  const actual=vals.map((v,i)=>`${i?'L':'M'} ${x(i,vals.length)} ${y(v)}`).join(' ');
  const points=[vals[vals.length-1],...forecast.points];
  const future=points.map((v,i)=>`${i?'L':'M'} ${x(vals.length-1+i,vals.length+points.length-1)} ${y(v)}`).join(' ');
  const split=x(vals.length-1,vals.length+points.length-1);
  return <div className="rounded-xl border border-[#18382b] bg-[#071610] p-3">
    <div className="mb-2 flex flex-wrap gap-4 text-xs text-slate-300"><span className="inline-flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-emerald-400"/>Actual modal price</span><span className="inline-flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-amber-400"/>Estimated next 7 days</span><span className="inline-flex items-center gap-2"><i className="h-2 w-2 rounded-sm bg-amber-900"/>Estimated range</span></div>
    <svg viewBox="0 0 680 195" className="w-full" role="img" aria-label="Historical mandi prices and seven-day statistical estimate">
      {[0,1,2,3].map(i=><g key={i}><line x1="38" y1={16+i*47} x2="658" y2={16+i*47} stroke="#1b352b"/><text x="32" y={20+i*47} textAnchor="end" fill="#81968b" fontSize="10">{new Intl.NumberFormat('en-IN',{notation:'compact'}).format(hi-(hi-lo)*i/3)}</text></g>)}
      <line x1={split} y1="12" x2={split} y2="160" stroke="#64766c" strokeDasharray="4 4"/>
      <path d={`M ${split} ${y(forecast.max)} L 658 ${y(forecast.max)} L 658 ${y(forecast.min)} L ${split} ${y(forecast.min)} Z`} fill="#b77908" opacity=".22"/>
      <path d={actual} fill="none" stroke="#10d6a0" strokeWidth="2.5" strokeLinejoin="round"/>
      {vals.map((v,i)=><circle key={i} cx={x(i,vals.length)} cy={y(v)} r="2.5" fill="#10d6a0"/>)}
      <path d={future} fill="none" stroke="#f7b91c" strokeWidth="3" strokeLinejoin="round"/>
      {points.slice(1).map((v,i)=><circle key={i} cx={x(vals.length+i,vals.length+points.length-1)} cy={y(v)} r="3" fill="#f7b91c"/>)}
      <text x="38" y="184" fill="#9aac9f" fontSize="11">{series[0]?.observation_date||'History'}</text><text x="658" y="184" textAnchor="end" fill="#f7b91c" fontSize="11">Next 7 days →</text>
    </svg>
    <p className="mt-1 text-[11px] text-slate-500">Simple trend estimate from stored observations—not an official forecast or guaranteed selling price.</p>
  </div>;
}

export default function MarketPricesPage() {
  const [rows, setRows] = useState<DisplayRow[]>([]);
  const [commodities, setCommodities] = useState<Option[]>([]);
  const [states, setStates] = useState<Option[]>([]);
  const [districts, setDistricts] = useState<Option[]>([]);
  const [mandis, setMandis] = useState<Option[]>([]);
  const [selectedCommodity, setSelectedCommodity] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedMandi, setSelectedMandi] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');

  const labelMap = useMemo(() => {
    const toMap = (opts: Option[]) => new Map(opts.map((item) => [item.code, item.name]));
    return {
      commodity: toMap(commodities),
      state: toMap(states),
      district: toMap(districts),
      mandi: toMap(mandis),
    };
  }, [commodities, districts, mandis, states]);

  const loadOptions = useCallback(async () => {
    const [commodityRes, stateRes, districtRes, mandiRes] = await Promise.all([
      marketSupabase.from('national_commodities').select('code,name').order('name').limit(2000),
      marketSupabase.from('national_states').select('state_code,state_name').order('state_name').limit(1000),
      marketSupabase.from('national_districts').select('district_code,district_name,state_code').order('district_name').limit(2000),
      marketSupabase.from('national_mandis').select('mandi_code,mandi_name,state_code,district_code').order('mandi_name').limit(2000),
    ]);
    const firstError = commodityRes.error || stateRes.error || districtRes.error || mandiRes.error;
    if (firstError) throw firstError;
    setCommodities((commodityRes.data || []).map((row: any) => ({ code: row.code, name: row.name })));
    setStates((stateRes.data || []).map((row: any) => ({ code: row.state_code, name: row.state_name })));
    setDistricts((districtRes.data || []).map((row: any) => ({ code: row.district_code, name: row.district_name, state_code: row.state_code })));
    setMandis((mandiRes.data || []).map((row: any) => ({ code: row.mandi_code, name: row.mandi_name, state_code: row.state_code, district_code: row.district_code })));
  }, []);

  const loadPrices = useCallback(async (reset: boolean) => {
    if (reset) {
      setLoading(true);
      setError('');
    } else {
      setLoadingMore(true);
    }
    try {
      let query = marketSupabase
        .from('national_market_price_observations')
        .select('id,observation_date,state_code,district_code,mandi_code,commodity_code,min_price,max_price,modal_price,source')
        .order('observation_date', { ascending: false })
        .order('id', { ascending: false })
        .range(reset ? 0 : rows.length, (reset ? 0 : rows.length) + PAGE_SIZE - 1);
      if (selectedCommodity) query = query.eq('commodity_code', selectedCommodity);
      if (selectedState) query = query.eq('state_code', selectedState);
      if (selectedDistrict) query = query.eq('district_code', selectedDistrict);
      if (selectedMandi) query = query.eq('mandi_code', selectedMandi);
      if (dateFrom) query = query.gte('observation_date', dateFrom);
      if (dateTo) query = query.lte('observation_date', dateTo);
      const { data, error: queryError } = await query;
      if (queryError) throw queryError;
      const rawRows = (data || []) as Row[];
      const label = (map: Map<string, string>, code: string | null, fallback: string) =>
        code ? map.get(code) || code : fallback;
      const displayRows = rawRows.map((row) => ({
        ...row,
        commodity_name: label(labelMap.commodity, row.commodity_code, 'Commodity'),
        mandi_name: label(labelMap.mandi, row.mandi_code, 'Mandi not supplied'),
        district_name: label(labelMap.district, row.district_code, ''),
        state_name: label(labelMap.state, row.state_code, ''),
      }));
      setRows((previous) => reset ? displayRows : [...previous, ...displayRows]);
      setHasMore(rawRows.length === PAGE_SIZE);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load official market prices.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [dateFrom, dateTo, labelMap, rows.length, selectedCommodity, selectedDistrict, selectedMandi, selectedState]);

  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try { await loadOptions(); }
      catch (e) { if (!cancelled) setError(e instanceof Error ? e.message : 'Unable to load market filters.'); }
    }
    void init();
    return () => { cancelled = true; };
  }, [loadOptions]);

  useEffect(() => { void loadPrices(true); }, [selectedCommodity, selectedState, selectedDistrict, selectedMandi, dateFrom, dateTo, labelMap]); 

  useEffect(() => {
    let cancelled = false;
    marketSupabase.from('national_market_price_observations').select('id', { count: 'exact', head: true })
      .then(({ count: total, error: countError }) => {
        if (!cancelled && !countError) setCount(total ?? null);
      });
    return () => { cancelled = true; };
  }, []);

  const latest = rows[0];
  const forecast = useMemo(() => calculateForecast(rows), [rows]);
  const current = latest ? Number(latest.modal_price) : 0;
  const change = forecast?.changePct ?? 0;
  const minPrice = rows.length ? Math.min(...rows.map(r=>Number(r.min_price)).filter(Number.isFinite)) : 0;
  const maxPrice = rows.length ? Math.max(...rows.map(r=>Number(r.max_price)).filter(Number.isFinite)) : 0;
  const mandiCount = new Set(rows.map(r=>r.mandi_code).filter(Boolean)).size;
  const arrivalsTotal = rows.reduce((sum,r)=>sum+(Number((r as any).arrivals)||0),0);
  const visibleDistricts = districts.filter(item => !selectedState || item.state_code === selectedState);
  const visibleMandis = mandis.filter(item => (!selectedState || item.state_code === selectedState) && (!selectedDistrict || item.district_code === selectedDistrict));

  return (
    <main className="min-h-screen space-y-4 bg-[#06100c] px-4 py-5 text-white md:px-7 lg:px-10">
      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-[#163329] bg-gradient-to-r from-[#0d2119] to-[#09130f] p-6 md:flex-row md:items-center">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-800/70 bg-emerald-950/60 px-3 py-1 text-xs font-bold tracking-wide text-emerald-300"><TrendingUp className="h-4 w-4"/> Live Mandi Intelligence</div>
          <h1 className="text-3xl font-black tracking-tight md:text-4xl">Commodity Prices &amp; Mandi Forecast</h1>
          <p className="mt-2 text-sm text-slate-300 md:text-base">Official Agmarknet observations with transparent statistical trend analysis.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-emerald-900 bg-[#0a1711] p-3 text-xs"><div className="flex items-center gap-2 font-bold text-slate-200"><ShieldCheck className="h-4 w-4 text-emerald-400"/> Source: Agmarknet / DMI</div><div className="mt-1 text-slate-400">{count===null?'Verified observations':INDIAN.format(count)+' stored observations'}</div></div>
          <button onClick={() => void loadPrices(true)} className="inline-flex h-12 items-center gap-2 rounded-xl border border-emerald-900 bg-[#101b15] px-4 text-sm font-bold hover:border-emerald-500"><RefreshCw className="h-4 w-4"/> Refresh</button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 rounded-2xl border border-[#143329] bg-[#0b1912] p-4 sm:grid-cols-2 lg:grid-cols-6">
        <Select label="Commodity" value={selectedCommodity} options={commodities} onChange={setSelectedCommodity}/>
        <Select label="State" value={selectedState} options={states} onChange={v=>{setSelectedState(v);setSelectedDistrict('');setSelectedMandi('');}}/>
        <Select label="District" value={selectedDistrict} options={visibleDistricts} onChange={v=>{setSelectedDistrict(v);setSelectedMandi('');}}/>
        <Select label="Mandi" value={selectedMandi} options={visibleMandis} onChange={setSelectedMandi}/>
        <label className="block text-sm text-gray-300"><span className="mb-2 block text-xs font-bold">Date from</span><input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="min-h-11 w-full rounded-xl border border-[#2a3b32] bg-[#15241f] px-3 text-white"/></label>
        <label className="block text-sm text-gray-300"><span className="mb-2 block text-xs font-bold">Date to</span><input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="min-h-11 w-full rounded-xl border border-[#2a3b32] bg-[#15241f] px-3 text-white"/></label>
      </section>
      <div className="flex justify-end"><button onClick={()=>void loadPrices(true)} className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-500 px-5 text-sm font-extrabold text-[#032016] hover:bg-emerald-400"><MapPin className="h-4 w-4"/>View Prices</button></div>

      {error && <div role="alert" className="rounded-xl border border-rose-800 bg-rose-950/40 p-4 text-sm text-rose-100">Unable to load market data: {error}. Check the market project's publishable key and read policies.</div>}
      {loading && <div className="rounded-xl border border-emerald-950 bg-[#0b1912] p-4 text-sm text-slate-300">Loading verified AGMARKNET observations…</div>}
      {!loading && !error && rows.length===0 && <div className="rounded-xl border border-amber-900/70 bg-[#171209] p-6 text-amber-100">No observations match this selection. Try a broader date range or clear a filter.</div>}

      {!loading && !error && rows.length>0 && <>
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
          <div className="rounded-2xl border border-[#12392b] bg-gradient-to-br from-[#0b2118] to-[#07130e] p-4 md:p-5">
            <div className="mb-4 flex items-start gap-3"><div className="rounded-xl bg-emerald-950 p-3 text-emerald-400"><TrendingUp className="h-6 w-6"/></div><div><h2 className="text-lg font-extrabold">Price Trend &amp; Forecast</h2><p className="text-xs text-slate-400">Observed AGMARKNET prices with a 7-day statistical estimate</p></div></div>
            <ForecastChart rows={rows} forecast={forecast}/>
          </div>
          <div className="rounded-2xl border border-amber-900/60 bg-gradient-to-br from-[#251b09] to-[#151207] p-4 md:p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-amber-300"><TrendingUp className="h-5 w-5"/> Price Forecast <span className="text-sm font-medium text-white">(Next 7 Days)</span></h2>
            {forecast ? <><div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
              <div className="rounded-xl border border-amber-900/40 bg-white/[0.04] p-3"><div className="text-xs text-slate-300">Expected price</div><div className="mt-2 text-2xl font-black text-amber-300">₹{INDIAN.format(forecast.expected)}<span className="ml-1 text-xs font-normal text-slate-300">/Qtl</span></div><div className={`mt-2 flex items-center gap-1 text-xs font-bold ${change>=0?'text-emerald-400':'text-rose-400'}`}>{change>=0?<TrendingUp className="h-4 w-4"/>:<TrendingDown className="h-4 w-4"/>}{change>=0?'+':''}{change.toFixed(1)}% vs latest observed</div></div>
              <div className="rounded-xl border border-amber-900/40 bg-white/[0.04] p-3"><div className="text-xs text-slate-300">Lower estimate</div><div className="mt-2 text-2xl font-black text-white">₹{INDIAN.format(forecast.min)}<span className="ml-1 text-xs font-normal text-slate-300">/Qtl</span></div><div className="mt-2 text-xs text-rose-300">Approximate range</div></div>
              <div className="rounded-xl border border-amber-900/40 bg-white/[0.04] p-3"><div className="text-xs text-slate-300">Upper estimate</div><div className="mt-2 text-2xl font-black text-white">₹{INDIAN.format(forecast.max)}<span className="ml-1 text-xs font-normal text-slate-300">/Qtl</span></div><div className="mt-2 text-xs text-emerald-300">Approximate range</div></div>
            </div><div className="mt-4 rounded-xl border border-amber-800/60 bg-amber-950/40 p-4"><div className="mb-2 flex items-center gap-2 font-bold text-amber-300"><Lightbulb className="h-5 w-5"/> Trend insight</div><p className="text-sm leading-6 text-slate-200">{forecast.insight} This estimate is not a guaranteed selling price.</p><p className="mt-2 text-xs text-slate-400">Heuristic confidence indicator: {forecast.confidence}% (not a calibrated probability).</p></div></> : <div className="rounded-xl border border-amber-900/40 bg-white/[0.04] p-5 text-sm text-amber-100">Not enough unique dated observations for a trend estimate. Broaden the date range or remove some filters.</div>}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Metric title="Current modal price" value={latest?'₹'+INDIAN.format(current):'—'} detail="per quintal • latest loaded row" icon={<span className="text-2xl font-black">₹</span>} tone="green"/>
          <Metric title="Minimum observed" value={'₹'+INDIAN.format(minPrice)} detail="selected records" icon={<TrendingDown className="h-6 w-6"/>} tone="red"/>
          <Metric title="Maximum observed" value={'₹'+INDIAN.format(maxPrice)} detail="selected records" icon={<TrendingUp className="h-6 w-6"/>} tone="gold"/>
          <Metric title="Mandis represented" value={String(mandiCount)} detail="in loaded records" icon={<Landmark className="h-6 w-6"/>} tone="blue"/>
          <Metric title="Recent arrivals" value={arrivalsTotal?INDIAN.format(arrivalsTotal)+' Qtl':'Not supplied'} detail="arrival quantity where available" icon={<Truck className="h-6 w-6"/>} tone="green"/>
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#17372b] bg-[#091711]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1b352b] p-4 md:p-5"><div><h2 className="text-lg font-extrabold">Recent Market Prices</h2><p className="mt-1 text-xs text-slate-400">Latest official observations for the selected filters • INR per quintal</p></div><span className="inline-flex items-center gap-2 rounded-lg bg-[#13271e] px-3 py-2 text-xs font-bold text-emerald-300"><ShieldCheck className="h-4 w-4"/> AGMARKNET records</span></div>
          <div className="overflow-x-auto"><table className="min-w-[950px] w-full text-left text-xs"><thead className="bg-[#102219] text-slate-300"><tr>{['Date','State','District','Mandi','Commodity','Min price (₹/Qtl)','Modal price (₹/Qtl)','Max price (₹/Qtl)','Source'].map(h=><th key={h} className="whitespace-nowrap px-4 py-3 font-bold">{h}</th>)}</tr></thead><tbody className="divide-y divide-[#1a3025] text-slate-200">{rows.map(row=><tr key={row.id} className="hover:bg-emerald-950/30"><td className="whitespace-nowrap px-4 py-3 text-slate-400">{row.observation_date}</td><td className="px-4 py-3">{row.state_name||'—'}</td><td className="px-4 py-3">{row.district_name||'—'}</td><td className="px-4 py-3 font-semibold">{row.mandi_name}</td><td className="px-4 py-3">{row.commodity_name}</td><td className="px-4 py-3">₹{INDIAN.format(Number(row.min_price))}</td><td className="px-4 py-3 font-black text-emerald-300">₹{INDIAN.format(Number(row.modal_price))}</td><td className="px-4 py-3">₹{INDIAN.format(Number(row.max_price))}</td><td className="px-4 py-3 text-slate-400">{row.source||'AGMARKNET'}</td></tr>)}</tbody></table></div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1b352b] p-4"><span className="text-xs text-slate-400">Showing {rows.length} records{count!==null?' • '+INDIAN.format(count)+' observations in database':''}</span>{hasMore&&<button disabled={loadingMore} onClick={()=>void loadPrices(false)} className="rounded-lg border border-emerald-800 bg-emerald-950/50 px-4 py-2 text-sm font-bold text-emerald-200 disabled:opacity-50">{loadingMore?'Loading…':'Load more records'}</button>}</div>
        </section>
      </>}
    </main>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: Option[]; onChange: (value: string) => void }) {
  return <label className="block min-w-0 text-sm text-gray-300"><span className="mb-2 block text-xs font-bold">{label}</span><select value={value} onChange={e=>onChange(e.target.value)} className="min-h-11 w-full rounded-xl border border-[#2a3b32] bg-[#15241f] px-3 text-white"><option value="">All {label.toLowerCase()}s</option>{options.map(item=><option key={item.code} value={item.code}>{item.name}</option>)}</select></label>;
}

function Metric({ title, value, detail, icon, tone }: { title:string; value:string; detail:string; icon:React.ReactNode; tone:'green'|'red'|'gold'|'blue' }) {
  const tones={green:'bg-emerald-950 text-emerald-300',red:'bg-rose-950 text-rose-300',gold:'bg-amber-950 text-amber-300',blue:'bg-sky-950 text-sky-300'};
  return <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#153528] bg-gradient-to-br from-[#0c1c14] to-[#08130e] p-4"><div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>{icon}</div><div className="min-w-0"><div className="text-xs text-slate-300">{title}</div><div className="mt-1 break-words text-xl font-black text-white">{value}</div><div className="mt-1 text-[11px] text-slate-400">{detail}</div></div></div>;
}
