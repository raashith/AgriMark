'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, CalendarDays, LineChart, MapPin, RefreshCw, ShieldCheck, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type StateOption = { state_code: string; state_name: string };
type DistrictOption = { district_code: string; district_name: string; state_code: string };
type MandiOption = { mandi_code: string; mandi_name: string; state_code: string; district_code: string | null };
type CommodityOption = { code: string; name: string };
type MarketRow = {
  id: number;
  observation_date: string;
  state_code: string;
  district_code: string | null;
  mandi_code: string | null;
  commodity_code: string;
  variety: string | null;
  grade: string | null;
  min_price: number | null;
  max_price: number | null;
  modal_price: number;
  source: string;
  national_states?: { state_name: string } | { state_name: string }[] | null;
  national_districts?: { district_name: string } | { district_name: string }[] | null;
  national_mandis?: { mandi_name: string } | { mandi_name: string }[] | null;
  national_commodities?: { name: string } | { name: string }[] | null;
};
type ForecastPoint = { target_date: string; predicted_value: number; lower_bound_95: number; upper_bound_95: number };

const PAGE_SIZE = 100;
function relationName<T extends Record<string, string>>(relation: T | T[] | null | undefined, field: keyof T): string {
  const value = Array.isArray(relation) ? relation[0] : relation;
  return value?.[field] || '';
}

export default function MarketPricesPage() {
  const [rows, setRows] = useState<MarketRow[]>([]);
  const [states, setStates] = useState<StateOption[]>([]);
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [mandis, setMandis] = useState<MandiOption[]>([]);
  const [commodities, setCommodities] = useState<CommodityOption[]>([]);
  const [selectedState, setSelectedState] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedCommodity, setSelectedCommodity] = useState('all');
  const [selectedMandi, setSelectedMandi] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState('');
  const [forecast, setForecast] = useState<ForecastPoint[]>([]);
  const [forecastStatus, setForecastStatus] = useState('Choose a commodity and mandi to check whether enough price history exists.');

  const loadReferenceData = useCallback(async () => {
    const [stateResult, districtResult, commodityResult] = await Promise.all([
      supabase.from('national_states').select('state_code,state_name').order('state_name'),
      supabase.from('national_districts').select('district_code,district_name,state_code').order('district_name'),
      supabase.from('national_commodities').select('code,name').order('name'),
    ]);
    if (stateResult.error || districtResult.error || commodityResult.error) {
      throw stateResult.error || districtResult.error || commodityResult.error;
    }

    const mandiRows: MandiOption[] = [];
    for (let offset = 0; offset < 5000; offset += 500) {
      const { data, error: mandiError } = await supabase
        .from('national_mandis')
        .select('mandi_code,mandi_name,state_code,district_code')
        .order('mandi_name')
        .range(offset, offset + 499);
      if (mandiError) throw mandiError;
      const page = (data || []) as MandiOption[];
      mandiRows.push(...page);
      if (page.length < 500) break;
    }
    setStates((stateResult.data || []) as StateOption[]);
    setDistricts((districtResult.data || []) as DistrictOption[]);
    setCommodities((commodityResult.data || []) as CommodityOption[]);
    setMandis(mandiRows);
  }, []);

  const loadRows = useCallback(async (append = false) => {
    if (append) setLoadingMore(true);
    else {
      setLoading(true);
      setError('');
    }
    try {
      let query = supabase
        .from('national_market_price_observations')
        .select('id,observation_date,state_code,district_code,mandi_code,commodity_code,variety,grade,min_price,max_price,modal_price,source,national_states(state_name),national_districts(district_name),national_mandis(mandi_name),national_commodities(name)')
        .order('observation_date', { ascending: false })
        .order('id', { ascending: false })
        .range(append ? rows.length : 0, (append ? rows.length : 0) + PAGE_SIZE - 1);
      if (selectedState !== 'all') query = query.eq('state_code', selectedState);
      if (selectedDistrict !== 'all') query = query.eq('district_code', selectedDistrict);
      if (selectedCommodity !== 'all') query = query.eq('commodity_code', selectedCommodity);
      if (selectedMandi !== 'all') query = query.eq('mandi_code', selectedMandi);
      if (selectedDate) query = query.eq('observation_date', selectedDate);
      const { data, error: queryError } = await query;
      if (queryError) throw queryError;
      const page = (data || []) as unknown as MarketRow[];
      setRows((current) => append ? [...current, ...page] : page);
      setHasMore(page.length === PAGE_SIZE);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load official market prices.');
      if (!append) setRows([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [rows.length, selectedState, selectedDistrict, selectedCommodity, selectedMandi, selectedDate]);

  useEffect(() => {
    loadReferenceData().catch((err) => setError(err instanceof Error ? err.message : 'Unable to load market filters.'));
  }, [loadReferenceData]);

  useEffect(() => {
    void loadRows(false);
  }, [selectedState, selectedDistrict, selectedCommodity, selectedMandi, selectedDate]);

  const filteredRows = rows;
  const latest = filteredRows[0];
  const previous = filteredRows.length > 1 ? filteredRows[1] : undefined;
  const priceDiff = latest && previous ? latest.modal_price - previous.modal_price : null;
  const priceDiffPct = latest && previous && previous.modal_price
    ? Number(((priceDiff! / previous.modal_price) * 100).toFixed(2))
    : null;

  useEffect(() => {
    let cancelled = false;
    async function loadForecast() {
      setForecast([]);
      if (selectedCommodity === 'all' || selectedMandi === 'all') {
        setForecastStatus('Select a commodity and a specific mandi. Predictions require several different observation dates.');
        return;
      }
      setForecastStatus('Checking historical observations…');
      const params = new URLSearchParams({ commodity_code: selectedCommodity, mandi_code: selectedMandi, horizon_days: '7' });
      if (selectedState !== 'all') params.set('state_code', selectedState);
      if (selectedDistrict !== 'all') params.set('district_code', selectedDistrict);
      if (selectedDate) params.set('base_date', selectedDate);
      try {
        const response = await fetch('/api/v1/mandi/forecast?' + params.toString(), { cache: 'no-store' });
        const payload = await response.json();
        if (cancelled) return;
        if (!response.ok || !payload.ok) {
          setForecastStatus(payload.error || 'Forecast unavailable.');
          return;
        }
        setForecast((payload.forecast || []) as ForecastPoint[]);
        setForecastStatus(payload.forecast?.length
          ? 'Projection from observed price history; not a guaranteed market quote.'
          : payload.message || 'More distinct observation dates are required for a forecast.');
      } catch {
        if (!cancelled) setForecastStatus('Forecast service is temporarily unavailable.');
      }
    }
    void loadForecast();
    return () => { cancelled = true; };
  }, [selectedCommodity, selectedMandi, selectedState, selectedDistrict, selectedDate]);

  const stateFilteredDistricts = useMemo(
    () => selectedState === 'all' ? districts : districts.filter((item) => item.state_code === selectedState),
    [districts, selectedState],
  );
  const mandiFilteredOptions = useMemo(
    () => mandis.filter((item) =>
      (selectedState === 'all' || item.state_code === selectedState) &&
      (selectedDistrict === 'all' || item.district_code === selectedDistrict)),
    [mandis, selectedState, selectedDistrict],
  );

  function resetFilter<T extends string>(setter: (value: T) => void, value: T) { setter(value); }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[#1e2d26] bg-[#121a16] p-6 md:p-8 shadow-xl">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-800/60 bg-emerald-950/80 px-3 py-1 text-xs font-mono font-bold text-emerald-400">
          <TrendingUp className="h-4 w-4" /> Verified AGMARKNET observations
        </div>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-white md:text-4xl">Commodity Prices & Mandi Intelligence</h1>
            <p className="mt-2 max-w-3xl text-sm text-gray-300">
              Search the imported official observations by state, district, mandi, commodity, and date. Prices are observed values, not guarantees or forecasts.
            </p>
          </div>
          <button onClick={() => { void loadRows(false); }} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#2a3b32] bg-[#0a0f0d] px-4 text-sm font-bold text-white">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <label className="text-xs text-gray-400">State
          <select value={selectedState} onChange={(e) => { setSelectedState(e.target.value); setSelectedDistrict('all'); setSelectedMandi('all'); }} className="mt-1 min-h-11 w-full rounded-xl border border-[#2a3b32] bg-[#0a0f0d] px-3 text-white">
            <option value="all">All states</option>{states.map((item) => <option key={item.state_code} value={item.state_code}>{item.state_name}</option>)}
          </select>
        </label>
        <label className="text-xs text-gray-400">District
          <select value={selectedDistrict} onChange={(e) => { setSelectedDistrict(e.target.value); setSelectedMandi('all'); }} className="mt-1 min-h-11 w-full rounded-xl border border-[#2a3b32] bg-[#0a0f0d] px-3 text-white">
            <option value="all">All districts</option>{stateFilteredDistricts.map((item) => <option key={item.district_code} value={item.district_code}>{item.district_name}</option>)}
          </select>
        </label>
        <label className="text-xs text-gray-400">Commodity
          <select value={selectedCommodity} onChange={(e) => setSelectedCommodity(e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-[#2a3b32] bg-[#0a0f0d] px-3 text-white">
            <option value="all">All commodities</option>{commodities.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
          </select>
        </label>
        <label className="text-xs text-gray-400">Mandi
          <select value={selectedMandi} onChange={(e) => setSelectedMandi(e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-[#2a3b32] bg-[#0a0f0d] px-3 text-white">
            <option value="all">All mandis</option>{mandiFilteredOptions.map((item) => <option key={item.mandi_code} value={item.mandi_code}>{item.mandi_name}</option>)}
          </select>
        </label>
        <label className="text-xs text-gray-400">Observation date
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-[#2a3b32] bg-[#0a0f0d] px-3 text-white" />
        </label>
      </section>

      {error && <div role="alert" className="rounded-xl border border-rose-800/50 bg-rose-950/20 p-4 text-sm text-rose-200">Market data error: {error}</div>}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#1e2d26] bg-[#121a16] p-5"><span className="text-xs uppercase text-gray-400">Latest modal</span><div className="mt-2 text-3xl font-black text-emerald-400">{latest ? '₹' + Number(latest.modal_price).toLocaleString('en-IN') : '—'}</div><div className="mt-1 text-xs text-gray-400">per quintal</div></div>
          <div className="rounded-2xl border border-[#1e2d26] bg-[#121a16] p-5"><span className="text-xs uppercase text-gray-400">Change vs previous record</span><div className={'mt-2 flex items-center gap-1 text-2xl font-black ' + ((priceDiff ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400')}>{(priceDiff ?? 0) >= 0 ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}₹{Math.abs(priceDiff ?? 0).toLocaleString('en-IN')}</div><div className="mt-1 text-xs text-gray-400">{priceDiffPct == null ? 'No comparable record yet' : priceDiffPct + '%'}</div></div>
          <div className="rounded-2xl border border-[#1e2d26] bg-[#121a16] p-5"><span className="text-xs uppercase text-gray-400">Records in this page</span><div className="mt-2 text-3xl font-black text-white">{rows.length}</div><div className="mt-1 text-xs text-gray-400">official observations returned</div></div>
        </div>
      )}

      {loading ? <div className="rounded-3xl border border-[#1e2d26] bg-[#121a16] p-8 text-gray-300">Loading official mandi records…</div>
        : !error && rows.length === 0 ? <div className="rounded-3xl border border-amber-800/40 bg-amber-950/20 p-8 text-amber-100">No official observations match these filters. Try another state, commodity, mandi, or date.</div>
        : !error && (
          <section className="overflow-hidden rounded-3xl border border-[#1e2d26] bg-[#121a16]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1e2d26] p-5"><div><h2 className="text-xl font-extrabold text-white">Official market observations</h2><p className="mt-1 text-xs text-gray-400">Source: AGMARKNET · Unit: ₹ per quintal · Table data updated from the imported CSV</p></div><span className="flex items-center gap-2 text-xs text-emerald-300"><ShieldCheck className="h-4 w-4" /> Read-only data</span></div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="bg-black/20 text-xs uppercase tracking-wide text-gray-400"><tr>{['Date','State','District','Mandi','Commodity','Variety / Grade','Min ₹','Modal ₹','Max ₹','Source'].map((label) => <th key={label} className="px-4 py-3 font-semibold">{label}</th>)}</tr></thead>
                <tbody className="divide-y divide-white/5">
                  {rows.map((row) => <tr key={row.id} className="hover:bg-white/[0.025]">
                    <td className="whitespace-nowrap px-4 py-3 text-gray-300">{row.observation_date}</td>
                    <td className="px-4 py-3 text-gray-300">{relationName(row.national_states, 'state_name') || row.state_code}</td>
                    <td className="px-4 py-3 text-gray-300">{relationName(row.national_districts, 'district_name') || '—'}</td>
                    <td className="px-4 py-3 text-gray-300">{relationName(row.national_mandis, 'mandi_name') || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-white">{relationName(row.national_commodities, 'name') || row.commodity_code}</td>
                    <td className="px-4 py-3 text-gray-300">{[row.variety, row.grade].filter(Boolean).join(' / ') || '—'}</td>
                    <td className="px-4 py-3 text-gray-300">{row.min_price == null ? '—' : Number(row.min_price).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 font-bold text-emerald-300">{Number(row.modal_price).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-gray-300">{row.max_price == null ? '—' : Number(row.max_price).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{row.source}</td>
                  </tr>)}
                </tbody>
              </table>
            </div>
            {hasMore && <div className="border-t border-[#1e2d26] p-4 text-center"><button disabled={loadingMore} onClick={() => { void loadRows(true); }} className="rounded-xl border border-emerald-800 px-4 py-2 text-sm font-bold text-emerald-300 disabled:opacity-50">{loadingMore ? 'Loading…' : 'Load more records'}</button></div>}
          </section>
        )}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-[#1e2d26] bg-[#121a16] p-6">
          <div className="flex items-center gap-2 text-emerald-400"><LineChart className="h-5 w-5" /><span className="text-xs font-bold uppercase">Mandi forecast</span></div>
          <h2 className="mt-2 text-xl font-extrabold text-white">Next 7 days</h2>
          <p className="mt-2 text-xs leading-5 text-gray-400">Forecasts are only shown when this commodity and mandi have sufficient observations across distinct dates. One day's prices are not enough to infer a time-series trend.</p>
          <div className="mt-4 space-y-2">{forecast.length ? forecast.map((f) => <div key={f.target_date} className="flex items-center justify-between rounded-xl border border-[#26372f] bg-[#0a0f0d] px-3 py-2"><span className="font-mono text-xs text-gray-400">{f.target_date}</span><div className="text-right"><div className="font-bold text-white">₹{f.predicted_value.toLocaleString('en-IN')}</div><div className="text-[10px] text-gray-500">95% range: ₹{f.lower_bound_95.toLocaleString('en-IN')}–₹{f.upper_bound_95.toLocaleString('en-IN')}</div></div></div>) : <div className="rounded-xl border border-dashed border-[#2a3b32] p-4 text-sm text-gray-400">{forecastStatus}</div>}</div>
        </div>
        <div className="rounded-3xl border border-[#1e2d26] bg-[#121a16] p-6"><div className="flex items-center gap-2 text-emerald-400"><MapPin className="h-5 w-5" /><span className="text-xs font-bold uppercase">Data coverage</span></div><h2 className="mt-2 text-xl font-extrabold text-white">Official reference coverage</h2><p className="mt-2 text-sm text-gray-400">Filters use the state, district, mandi, and commodity reference tables populated during import. Prices remain linked to their original market observation.</p><div className="mt-4 grid grid-cols-2 gap-3 text-sm">{[['States',states.length],['Districts',districts.length],['Mandis',mandis.length],['Commodities',commodities.length]].map(([label,value])=><div key={String(label)} className="rounded-xl border border-[#26372f] bg-[#0a0f0d] p-3"><p className="text-gray-400">{label}</p><p className="mt-1 text-xl font-black text-emerald-300">{value}</p></div>)}</div></div>
      </section>
    </div>
  );
}
