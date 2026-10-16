'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, MapPin, RefreshCw, ShieldCheck, TrendingUp } from 'lucide-react';
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

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        await loadOptions();
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Unable to load market filters.');
      }
    }
    void init();
    return () => { cancelled = true; };
  }, [loadOptions]);

  useEffect(() => {
    if (!commodities.length && !states.length) return;
    void loadPrices(true);
  }, [selectedCommodity, selectedState, selectedDistrict, selectedMandi, dateFrom, dateTo, labelMap]); // reload when filters/labels change

  const latest = rows[0];
  // Avoid presenting a cross-commodity price difference as market movement.

  const visibleDistricts = useMemo(
    () => districts.filter((item) => !selectedState || item.state_code === selectedState),
    [districts, selectedState],
  );
  const visibleMandis = useMemo(
    () => mandis.filter((item) =>
      (!selectedState || item.state_code === selectedState) &&
      (!selectedDistrict || item.district_code === selectedDistrict)),
    [mandis, selectedDistrict, selectedState],
  );

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#1e2d26] bg-[#121a16] p-6 shadow-xl md:p-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-800/60 bg-emerald-950/80 px-3 py-1 text-xs font-mono font-bold text-emerald-400">
          <TrendingUp className="h-4 w-4" /> Official Market Intelligence
        </div>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-white md:text-4xl">National Commodity Prices</h1>
            <p className="mt-2 max-w-3xl text-sm text-gray-300">
              Imported AGMARKNET observations. Compare minimum, modal and maximum prices by crop and market.
              Historical observed prices are not forecasts or guaranteed buying prices.
            </p>
          </div>
          <button onClick={() => void loadPrices(true)} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#2a3b32] bg-[#0a0f0d] px-4 text-sm font-bold text-white">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 rounded-2xl border border-[#1e2d26] bg-[#121a16] p-4 md:grid-cols-3 lg:grid-cols-6">
        <Select label="Commodity" value={selectedCommodity} options={commodities} onChange={setSelectedCommodity} />
        <Select label="State" value={selectedState} options={states} onChange={(value) => { setSelectedState(value); setSelectedDistrict(''); setSelectedMandi(''); }} />
        <Select label="District" value={selectedDistrict} options={visibleDistricts} onChange={setSelectedDistrict} />
        <Select label="Mandi" value={selectedMandi} options={visibleMandis} onChange={setSelectedMandi} />
        <DateFilter label="Date from" value={dateFrom} onChange={setDateFrom} />
        <DateFilter label="Date to" value={dateTo} onChange={setDateTo} />
      </section>

      {error && <div role="alert" className="rounded-xl border border-rose-800/60 bg-rose-950/30 p-4 text-sm text-rose-100">Market data error: {error}</div>}

      {loading ? (
        <div className="rounded-3xl border border-[#1e2d26] bg-[#121a16] p-8 text-gray-300">Loading verified mandi observations…</div>
      ) : rows.length === 0 ? (
        <div className="rounded-3xl border border-amber-800/40 bg-amber-950/20 p-8 text-amber-100">
          No observations match this selection. Change the filters or refresh.
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Metric title="Latest modal price" value={latest ? '₹' + INDIAN.format(Number(latest.modal_price)) : '—'} detail="per quintal (selected record)" />
            <Metric title="Records loaded" value={INDIAN.format(rows.length)} detail={hasMore ? 'More records available below' : 'All matching rows loaded'} />
            <Metric title="Data provenance" value="AGMARKNET" detail={latest?.source || 'Imported government market data'} />
          </section>

          <section className="overflow-hidden rounded-3xl border border-[#1e2d26] bg-[#121a16]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#26372f] p-5">
              <div>
                <h2 className="text-lg font-extrabold text-white">Market observations</h2>
                <p className="mt-1 text-xs text-gray-400"><ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-emerald-400" /> Source: AGMARKNET • Prices in INR per quintal</p>
              </div>
              {latest && <p className="flex items-center gap-2 text-xs text-gray-400"><CalendarDays className="h-4 w-4" /> Latest row: {latest.observation_date}</p>}
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[850px] w-full text-left text-sm">
                <thead className="bg-black/20 text-xs uppercase tracking-wider text-gray-400">
                  <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Commodity</th><th className="px-4 py-3">Mandi / District</th><th className="px-4 py-3 text-right">Minimum</th><th className="px-4 py-3 text-right">Modal</th><th className="px-4 py-3 text-right">Maximum</th></tr>
                </thead>
                <tbody className="divide-y divide-[#26372f] text-gray-200">
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-emerald-950/10">
                      <td className="whitespace-nowrap px-4 py-3 text-gray-400">{row.observation_date}</td>
                      <td className="px-4 py-3"><div className="font-semibold">{row.commodity_name}</div><div className="text-[10px] text-gray-500">{row.source}</div></td>
                      <td className="px-4 py-3"><div className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-emerald-400" />{row.mandi_name}</div><div className="text-xs text-gray-500">{[row.district_name, row.state_name].filter(Boolean).join(' • ')}</div></td>
                      <td className="px-4 py-3 text-right">₹{INDIAN.format(Number(row.min_price))}</td>
                      <td className="px-4 py-3 text-right font-black text-emerald-300">₹{INDIAN.format(Number(row.modal_price))}</td>
                      <td className="px-4 py-3 text-right">₹{INDIAN.format(Number(row.max_price))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          {hasMore && (
            <div className="flex justify-center">
              <button disabled={loadingMore} onClick={() => void loadPrices(false)} className="rounded-xl border border-emerald-800 bg-emerald-950/30 px-5 py-3 text-sm font-bold text-emerald-100 disabled:opacity-50">
                {loadingMore ? 'Loading…' : `Load next ${PAGE_SIZE} records`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: Option[]; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm text-gray-300">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="min-h-11 w-full rounded-xl border border-[#2a3b32] bg-[#0a0f0d] px-3 text-white">
        <option value="">All {label.toLowerCase()}s</option>
        {options.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
      </select>
    </label>
  );
}

function DateFilter({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm text-gray-300">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">{label}</span>
      <input type="date" value={value} onChange={(event) => onChange(event.target.value)} className="min-h-11 w-full rounded-xl border border-[#2a3b32] bg-[#0a0f0d] px-3 text-white" />
    </label>
  );
}

function Metric({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-[#1e2d26] bg-[#121a16] p-5">
      <span className="text-xs uppercase tracking-wider text-gray-400">{title}</span>
      <div className="mt-2 break-words text-2xl font-black text-emerald-300">{value}</div>
      <div className="mt-1 text-xs text-gray-400">{detail}</div>
    </div>
  );
}
