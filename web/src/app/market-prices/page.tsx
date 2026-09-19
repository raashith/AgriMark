'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, CalendarDays, LineChart, MapPin, RefreshCw, ShieldCheck, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Row = {
  commodity_code: string;
  commodity_name: string | null;
  mandi_code: string | null;
  mandi_name: string | null;
  state_code: string | null;
  district_code: string | null;
  observed_at: string;
  modal_price: number;
  min_price: number;
  max_price: number;
  arrival_quantity_mt: number;
};

type Forecast = {
  target_date: string;
  predicted_value: number;
  lower_bound_95: number;
  upper_bound_95: number;
};

export default function MarketPricesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [selectedCommodity, setSelectedCommodity] = useState('all');
  const [selectedMandi, setSelectedMandi] = useState('all');
  const [loading, setLoading] = useState(true);
  const [forecast, setForecast] = useState<Forecast[]>([]);
  const [forecastStatus, setForecastStatus] = useState('Waiting for historical observations');

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('national_market_price_observations')
      .select('commodity_code,commodity_name,mandi_code,mandi_name,state_code,district_code,observed_at,modal_price,min_price,max_price,arrival_quantity_mt')
      .eq('price_signal_type', 'OBSERVED_MANDI')
      .order('observed_at', { ascending: true })
      .limit(2000);
    setRows((data || []) as Row[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const commodities = useMemo(
    () => Array.from(new Map(rows.map((r) => [r.commodity_code, r.commodity_name || r.commodity_code])).entries()),
    [rows],
  );

  const mandis = useMemo(
    () => Array.from(
      new Map(
        rows
          .filter((r) => selectedCommodity === 'all' || r.commodity_code === selectedCommodity)
          .map((r) => [r.mandi_code || '', r.mandi_name || r.mandi_code || 'Unknown mandi']),
      ).entries(),
    ),
    [rows, selectedCommodity],
  );

  const filtered = useMemo(
    () => rows.filter(
      (r) =>
        (selectedCommodity === 'all' || r.commodity_code === selectedCommodity) &&
        (selectedMandi === 'all' || r.mandi_code === selectedMandi),
    ),
    [rows, selectedCommodity, selectedMandi],
  );

  const latest = filtered.at(-1);
  const previous = filtered.length > 1 ? filtered.at(-2) : undefined;
  const priceDiff = latest && previous ? latest.modal_price - previous.modal_price : null;
  const priceDiffPct = latest && previous && previous.modal_price !== 0
    ? Number(((priceDiff! / previous.modal_price) * 100).toFixed(2))
    : null;

  async function loadForecast() {
    const params = new URLSearchParams();
    if (selectedCommodity !== 'all') params.set('commodity', selectedCommodity);
    if (selectedMandi !== 'all') params.set('mandi', selectedMandi);
    params.set('days', '7');
    setForecastStatus('Calculating forecast…');
    const response = await fetch('/api/v1/mandi/forecast?' + params.toString(), { cache: 'no-store' });
    const payload = await response.json();
    if (!payload.ok) {
      setForecast([]);
      setForecastStatus(payload.error || 'Forecast unavailable');
      return;
    }
    setForecast(payload.forecast || []);
    setForecastStatus(
      payload.observed_count >= 3
        ? '7-day transparent time-series projection from observed modal prices'
        : 'Need at least 3 observed price points for a projection',
    );
  }

  useEffect(() => {
    loadForecast();
  }, [selectedCommodity, selectedMandi, rows.length]);

  const chart = forecast.length
    ? forecast.map((f) => Math.round(f.predicted_value))
    : filtered.slice(-7).map((r) => Math.round(r.modal_price));

  const chartMax = Math.max(...chart, 1);
  const chartMin = Math.min(...chart, 0);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[#1e2d26] bg-[#121a16] p-6 md:p-8 shadow-xl">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-800/60 bg-emerald-950/80 px-3 py-1 text-xs font-mono font-bold text-emerald-400">
          <TrendingUp className="h-4 w-4" /> Live Mandi Intelligence
        </div>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-white md:text-4xl">Commodity Prices & Mandi Forecast</h1>
            <p className="mt-2 max-w-3xl text-sm text-gray-300">
              Agmarknet observations, day-over-day price movement, arrivals and a clearly labelled short-horizon projection.
            </p>
          </div>
          <button onClick={load} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#2a3b32] bg-[#0a0f0d] px-4 text-sm font-bold text-white">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <select value={selectedCommodity} onChange={(e) => { setSelectedCommodity(e.target.value); setSelectedMandi('all'); }} className="min-h-11 rounded-xl border border-[#2a3b32] bg-[#0a0f0d] px-3 text-white">
          <option value="all">All commodities</option>
          {commodities.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
        </select>
        <select value={selectedMandi} onChange={(e) => setSelectedMandi(e.target.value)} className="min-h-11 rounded-xl border border-[#2a3b32] bg-[#0a0f0d] px-3 text-white">
          <option value="all">All mandis</option>
          {mandis.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
        </select>
        <div className="flex items-center gap-2 rounded-xl border border-[#2a3b32] bg-[#0a0f0d] px-3 text-sm text-gray-300">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          Source: Agmarknet / DMI
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-[#1e2d26] bg-[#121a16] p-8 text-gray-300">Loading mandi observations…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-amber-800/40 bg-amber-950/20 p-8 text-amber-100">
          No real Agmarknet observations are stored for this selection yet. The forecasting UI stays empty rather than inventing data.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-[#1e2d26] bg-[#121a16] p-5">
              <span className="text-xs uppercase text-gray-400">Latest modal</span>
              <div className="mt-2 text-3xl font-black text-emerald-400">₹{latest?.modal_price.toLocaleString('en-IN')}</div>
              <div className="mt-1 text-xs text-gray-400">per quintal</div>
            </div>
            <div className="rounded-2xl border border-[#1e2d26] bg-[#121a16] p-5">
              <span className="text-xs uppercase text-gray-400">Change vs previous</span>
              <div className={'mt-2 flex items-center gap-1 text-2xl font-black ' + ((priceDiff ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                {(priceDiff ?? 0) >= 0 ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                ₹{Math.abs(priceDiff ?? 0).toLocaleString('en-IN')}
              </div>
              <div className="mt-1 text-xs text-gray-400">{priceDiffPct == null ? 'No comparable observation' : priceDiffPct + '%'}</div>
            </div>
            <div className="rounded-2xl border border-[#1e2d26] bg-[#121a16] p-5">
              <span className="text-xs uppercase text-gray-400">Latest arrivals</span>
              <div className="mt-2 text-3xl font-black text-white">{(latest?.arrival_quantity_mt || 0).toLocaleString('en-IN')}</div>
              <div className="mt-1 text-xs text-gray-400">metric tonnes</div>
            </div>
            <div className="rounded-2xl border border-[#1e2d26] bg-[#121a16] p-5">
              <span className="text-xs uppercase text-gray-400">Observed points</span>
              <div className="mt-2 text-3xl font-black text-white">{filtered.length}</div>
              <div className="mt-1 text-xs text-gray-400">records in current selection</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-3xl border border-[#1e2d26] bg-[#121a16] p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-white">{latest?.commodity_name || 'Commodity'}</h2>
                  <p className="mt-1 flex items-center gap-2 text-sm text-emerald-400">
                    <MapPin className="h-4 w-4" /> {latest?.mandi_name || 'All selected mandis'}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <CalendarDays className="h-4 w-4" /> {latest?.observed_at?.slice(0, 10)}
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <div className="min-w-[680px]">
                  <div className="mb-3 flex items-center justify-between text-xs text-gray-400">
                    <span>{forecast.length ? '7-day forecast' : 'Recent modal prices'}</span>
                    <span>{forecastStatus}</span>
                  </div>
                  <svg viewBox="0 0 900 280" className="h-72 w-full">
                    <line x1="35" y1="245" x2="870" y2="245" stroke="currentColor" className="text-[#2a3b32]" />
                    <line x1="35" y1="35" x2="35" y2="245" stroke="currentColor" className="text-[#2a3b32]" />
                    {chart.length > 1 && (
                      <polyline
                        fill="none"
                        stroke="currentColor"
                        className="text-emerald-400"
                        strokeWidth="4"
                        points={chart.map((v, i) => {
                          const x = 50 + (i / (chart.length - 1)) * 800;
                          const y = 225 - ((v - chartMin) / Math.max(chartMax - chartMin, 1)) * 180;
                          return x + ',' + y;
                        }).join(' ')}
                      />
                    )}
                    {chart.map((v, i) => {
                      const x = 50 + (i / Math.max(chart.length - 1, 1)) * 800;
                      const y = 225 - ((v - chartMin) / Math.max(chartMax - chartMin, 1)) * 180;
                      return <circle key={i} cx={x} cy={y} r="6" fill="currentColor" className="text-emerald-400" />;
                    })}
                  </svg>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#1e2d26] bg-[#121a16] p-6">
              <div className="flex items-center gap-2 text-emerald-400">
                <LineChart className="h-5 w-5" />
                <span className="text-xs font-mono uppercase font-bold">Mandi Forecast</span>
              </div>
              <h3 className="mt-2 text-xl font-extrabold text-white">Next 7 Days</h3>
              <p className="mt-2 text-xs leading-5 text-gray-400">
                Projection uses observed modal-price history only. The interface does not present synthetic history as real observations.
              </p>
              <div className="mt-5 space-y-2">
                {forecast.map((f) => (
                  <div key={f.target_date} className="flex items-center justify-between rounded-xl border border-[#26372f] bg-[#0a0f0d] px-3 py-2">
                    <span className="font-mono text-xs text-gray-400">{f.target_date}</span>
                    <div className="text-right">
                      <div className="font-bold text-white">₹{f.predicted_value.toLocaleString('en-IN')}</div>
                      <div className="text-[10px] text-gray-500">95%: ₹{f.lower_bound_95.toLocaleString('en-IN')}–₹{f.upper_bound_95.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                ))}
                {!forecast.length && <div className="rounded-xl border border-dashed border-[#2a3b32] p-4 text-sm text-gray-400">{forecastStatus}</div>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
