'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  CloudOff,
  LineChart,
  MapPin,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

type Row = {
  commodity_code: string;
  commodity_name?: string | null;
  mandi_code?: string | null;
  mandi_name?: string | null;
  state_code?: string | null;
  district_code?: string | null;
  observed_at: string;
  modal_price: number;
  min_price: number;
  max_price: number;
  arrival_quantity_mt?: number | null;
  source?: string | null;
  retrieved_at?: string | null;
};

type ForecastPoint = {
  target_date: string;
  predicted_value: number;
  lower_bound_95: number;
  upper_bound_95: number;
  forecast_horizon_days?: number;
};

type ForecastPayload = {
  success: boolean;
  reason?: string;
  forecast?: {
    historical_data_points: number;
    model_name: string;
    model_version: string;
    predictions: ForecastPoint[];
  };
  error?: string;
};

const INR = (value: number) =>
  '₹' + Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

export default function MarketPricesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [selectedCommodity, setSelectedCommodity] = useState('all');
  const [selectedMandi, setSelectedMandi] = useState('all');
  const [selectedState, setSelectedState] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastLoadedAt, setLastLoadedAt] = useState<string | null>(null);
  const [forecast, setForecast] = useState<ForecastPoint[]>([]);
  const [forecastStatus, setForecastStatus] = useState('Waiting for observed history');
  const [forecastModel, setForecastModel] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('limit', '2000');
      if (selectedCommodity !== 'all') params.set('commodity_code', selectedCommodity);
      if (selectedMandi !== 'all') params.set('mandi_code', selectedMandi);
      if (selectedState !== 'all') params.set('state_code', selectedState);

      const response = await fetch('/api/v1/mandi/observations?' + params.toString(), { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || 'Market data could not be loaded.');
      }
      setRows(Array.isArray(payload.rows) ? payload.rows : []);
      setLastLoadedAt(payload.retrieved_at || new Date().toISOString());
    } catch (err) {
      setRows([]);
      setLastLoadedAt(null);
      setError(err instanceof Error ? err.message : 'Market data could not be loaded.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [selectedCommodity, selectedMandi, selectedState]);

  const commodities = useMemo(
    () =>
      Array.from(
        new Map(
          rows.map((r) => [r.commodity_code, r.commodity_name || r.commodity_code]),
        ).entries(),
      ),
    [rows],
  );

  const states = useMemo(
    () =>
      Array.from(
        new Map(
          rows
            .map((r) => [r.state_code || '', r.state_code || 'Unknown state'])
            .filter(([code]) => Boolean(code)),
        ).entries(),
      ),
    [rows],
  );

  const mandis = useMemo(
    () =>
      Array.from(
        new Map(
          rows
            .filter((r) => selectedCommodity === 'all' || r.commodity_code === selectedCommodity)
            .filter((r) => selectedState === 'all' || r.state_code === selectedState)
            .map((r) => [r.mandi_code || '', r.mandi_name || r.mandi_code || 'Unknown mandi'])
            .filter(([code]) => Boolean(code)),
        ).entries(),
      ),
    [rows, selectedCommodity, selectedState],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadForecast() {
      if (selectedCommodity === 'all') {
        setForecast([]);
        setForecastModel('');
        setForecastStatus('Select a commodity for a 7-day projection');
        return;
      }

      setForecast([]);
      setForecastModel('');
      setForecastStatus('Calculating projection from observed history…');

      try {
        const params = new URLSearchParams({
          commodity_code: selectedCommodity,
          horizon_days: '7',
        });
        if (selectedMandi !== 'all') params.set('mandi_code', selectedMandi);
        if (selectedState !== 'all') params.set('state_code', selectedState);

        const response = await fetch('/api/v1/mandi/forecast?' + params.toString(), {
          cache: 'no-store',
        });
        const payload: ForecastPayload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(payload.error || 'Forecast unavailable.');
        }
        if (cancelled) return;

        const points = payload.forecast?.predictions || [];
        setForecast(points);
        setForecastModel(
          payload.forecast?.model_name
            ? `${payload.forecast.model_name} v${payload.forecast.model_version}`
            : '',
        );
        setForecastStatus(
          points.length
            ? `Projection from ${payload.forecast?.historical_data_points || 0} observed price points`
            : payload.reason || 'Need at least 3 observed price points for a projection',
        );
      } catch (err) {
        if (cancelled) return;
        setForecast([]);
        setForecastStatus(err instanceof Error ? err.message : 'Forecast unavailable.');
      }
    }

    void loadForecast();
    return () => {
      cancelled = true;
    };
  }, [selectedCommodity, selectedMandi, selectedState, rows.length]);

  const filtered = useMemo(
    () =>
      rows
        .filter((r) => selectedCommodity === 'all' || r.commodity_code === selectedCommodity)
        .filter((r) => selectedMandi === 'all' || r.mandi_code === selectedMandi)
        .filter((r) => selectedState === 'all' || r.state_code === selectedState)
        .sort((a, b) => new Date(a.observed_at).getTime() - new Date(b.observed_at).getTime()),
    [rows, selectedCommodity, selectedMandi, selectedState],
  );

  const latest = filtered.at(-1);
  const previous = filtered.length > 1 ? filtered.at(-2) : undefined;
  const priceDiff = latest && previous ? latest.modal_price - previous.modal_price : null;
  const priceDiffPct =
    latest && previous && previous.modal_price
      ? Number(((priceDiff! / previous.modal_price) * 100).toFixed(2))
      : null;

  const chart = filtered.slice(-14).map((r) => ({
    value: Number(r.modal_price || 0),
    label: r.observed_at.slice(5, 10),
  }));
  const chartMax = Math.max(...chart.map((p) => p.value), 1);
  const chartMin = Math.min(...chart.map((p) => p.value), 0);
  const chartSpan = Math.max(chartMax - chartMin, 1);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#24382e] bg-[#121a16] p-6 shadow-xl md:p-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#3e7b54]/60 bg-[#0b2118] px-3 py-1 text-xs font-mono font-bold text-[#52a67a]">
          <TrendingUp className="h-4 w-4" />
          Live Mandi Intelligence
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-[#f7f5ee] md:text-5xl">
                Commodity Prices & Mandi Forecast
              </h1>
              {!navigator.onLine && (
                <span className="hidden items-center rounded-full border border-amber-800/50 bg-amber-950/30 px-2 py-1 text-[10px] font-mono text-amber-200 sm:inline-flex">
                  <CloudOff className="mr-1 h-3 w-3" />
                  Offline
                </span>
              )}
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#adbdb2]">
              Official mandi observations, price movement, arrivals and a separately labelled short-horizon projection.
            </p>
          </div>

          <button
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#2a3b32] bg-[#07110d] px-5 text-sm font-bold text-[#f7f5ee] transition hover:bg-[#13251c] disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-4">
        <select
          value={selectedCommodity}
          onChange={(e) => {
            setSelectedCommodity(e.target.value);
            setSelectedMandi('all');
          }}
          className="min-h-12 rounded-xl border border-[#2a3b32] bg-[#07110d] px-4 text-sm text-[#f7f5ee]"
        >
          <option value="all">All commodities</option>
          {commodities.map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>

        <select
          value={selectedState}
          onChange={(e) => {
            setSelectedState(e.target.value);
            setSelectedMandi('all');
          }}
          className="min-h-12 rounded-xl border border-[#2a3b32] bg-[#07110d] px-4 text-sm text-[#f7f5ee]"
        >
          <option value="all">All states</option>
          {states.map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>

        <select
          value={selectedMandi}
          onChange={(e) => setSelectedMandi(e.target.value)}
          className="min-h-12 rounded-xl border border-[#2a3b32] bg-[#07110d] px-4 text-sm text-[#f7f5ee]"
        >
          <option value="all">All mandis</option>
          {mandis.map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>

        <div className="flex min-h-12 items-center gap-2 rounded-xl border border-[#2a3b32] bg-[#07110d] px-4 text-sm text-[#adbdb2]">
          <ShieldCheck className="h-4 w-4 text-[#52a67a]" />
          <span>Source: Government OGD / AGMARKNET</span>
        </div>
      </section>

      {error ? (
        <section className="rounded-3xl border border-rose-900/40 bg-rose-950/20 p-6 text-rose-100">
          <div className="font-bold">Market feed unavailable</div>
          <div className="mt-1 text-sm opacity-90">{error}</div>
          <button onClick={() => void load()} className="mt-4 rounded-xl border border-rose-800/50 px-4 py-2 text-sm font-semibold">
            Try again
          </button>
        </section>
      ) : loading ? (
        <section className="rounded-3xl border border-[#24382e] bg-[#121a16] p-8">
          <div className="h-7 w-52 animate-pulse rounded bg-[#1a2921]" />
          <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-[#1a2921]" />
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-[#0d1712]" />
            ))}
          </div>
        </section>
      ) : filtered.length === 0 ? (
        <section className="rounded-3xl border border-amber-800/40 bg-amber-950/20 p-8 text-amber-100">
          <div className="flex items-center gap-2 font-bold">
            <CloudOff className="h-5 w-5" />
            No verified observations are available for this selection.
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-amber-100/80">
            AgriMark will not fabricate prices or forecasts. The feed will populate as the official ingestion worker receives new AGMARKNET observations.
          </p>
        </section>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-[#24382e] bg-[#121a16] p-5">
              <span className="text-xs uppercase tracking-wider text-[#70887a]">Latest modal</span>
              <div className="mt-2 text-3xl font-black text-[#52a67a]">{INR(latest?.modal_price || 0)}</div>
              <div className="mt-1 text-xs text-[#70887a]">per quintal</div>
            </div>

            <div className="rounded-2xl border border-[#24382e] bg-[#121a16] p-5">
              <span className="text-xs uppercase tracking-wider text-[#70887a]">Change vs previous</span>
              <div className={`mt-2 flex items-center gap-1 text-2xl font-black ${(priceDiff || 0) >= 0 ? 'text-[#52a67a]' : 'text-rose-400'}`}>
                {(priceDiff || 0) >= 0 ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                {INR(Math.abs(priceDiff || 0))}
              </div>
              <div className="mt-1 text-xs text-[#70887a]">
                {priceDiffPct == null ? 'No comparable observation' : `${priceDiffPct}%`}
              </div>
            </div>

            <div className="rounded-2xl border border-[#24382e] bg-[#121a16] p-5">
              <span className="text-xs uppercase tracking-wider text-[#70887a]">Latest arrivals</span>
              <div className="mt-2 text-3xl font-black text-[#f7f5ee]">
                {Number(latest?.arrival_quantity_mt || 0).toLocaleString('en-IN')}
              </div>
              <div className="mt-1 text-xs text-[#70887a]">metric tonnes</div>
            </div>

            <div className="rounded-2xl border border-[#24382e] bg-[#121a16] p-5">
              <span className="text-xs uppercase tracking-wider text-[#70887a]">Observed points</span>
              <div className="mt-2 text-3xl font-black text-[#f7f5ee]">{filtered.length}</div>
              <div className="mt-1 text-xs text-[#70887a]">records in selection</div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.65fr]">
            <div className="rounded-3xl border border-[#24382e] bg-[#121a16] p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-[#f7f5ee]">
                    {latest?.commodity_name || selectedCommodity}
                  </h2>
                  <p className="mt-1 flex items-center gap-2 text-sm text-[#52a67a]">
                    <MapPin className="h-4 w-4" />
                    {latest?.mandi_name || 'All selected mandis'}
                  </p>
                </div>
                <div className="text-right text-xs text-[#70887a]">
                  <div className="flex items-center justify-end gap-2">
                    <CalendarDays className="h-4 w-4" />
                    {latest?.observed_at.slice(0, 10)}
                  </div>
                  {lastLoadedAt && (
                    <div className="mt-1">Fetched {new Date(lastLoadedAt).toLocaleString('en-IN')}</div>
                  )}
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <div className="min-w-[680px]">
                  <div className="mb-3 flex items-center justify-between text-xs text-[#70887a]">
                    <span>Recent observed modal prices</span>
                    <span>Verified observations only</span>
                  </div>
                  <svg viewBox="0 0 900 280" className="h-72 w-full" role="img" aria-label="Recent mandi modal price trend">
                    <line x1="35" y1="245" x2="870" y2="245" stroke="currentColor" className="text-[#2a3b32]" />
                    <line x1="35" y1="35" x2="35" y2="245" stroke="currentColor" className="text-[#2a3b32]" />

                    {chart.length > 1 && (
                      <polyline
                        fill="none"
                        stroke="currentColor"
                        className="text-[#52a67a]"
                        strokeWidth="4"
                        points={chart.map((p, i) => {
                          const x = 50 + (i / Math.max(chart.length - 1, 1)) * 800;
                          const y = 225 - ((p.value - chartMin) / chartSpan) * 180;
                          return `${x},${y}`;
                        }).join(' ')}
                      />
                    )}

                    {chart.map((p, i) => {
                      const x = 50 + (i / Math.max(chart.length - 1, 1)) * 800;
                      const y = 225 - ((p.value - chartMin) / chartSpan) * 180;
                      return (
                        <g key={`${p.label}-${i}`}>
                          <circle cx={x} cy={y} r="5" fill="currentColor" className="text-[#52a67a]" />
                          {i % Math.max(1, Math.floor(chart.length / 6)) === 0 && (
                            <text x={x} y="266" textAnchor="middle" className="fill-[#70887a] text-[12px]">
                              {p.label}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#24382e] bg-[#121a16] p-6">
              <div className="flex items-center gap-2 text-[#52a67a]">
                <LineChart className="h-5 w-5" />
                <span className="text-xs font-mono font-bold uppercase">Mandi Forecast</span>
              </div>
              <h3 className="mt-2 text-xl font-extrabold text-[#f7f5ee]">Next 7 Days</h3>
              <p className="mt-2 text-xs leading-5 text-[#70887a]">
                {forecastStatus}. Forecasts are generated only from real observed history.
              </p>
              {forecastModel && <div className="mt-2 font-mono text-[10px] text-[#52a67a]">{forecastModel}</div>}

              <div className="mt-5 space-y-2">
                {forecast.map((f) => (
                  <div key={f.target_date} className="flex items-center justify-between rounded-xl border border-[#26372f] bg-[#07110d] px-3 py-2">
                    <span className="font-mono text-xs text-[#70887a]">{f.target_date}</span>
                    <div className="text-right">
                      <div className="font-bold text-[#f7f5ee]">{INR(f.predicted_value)}</div>
                      <div className="text-[10px] text-[#596d61]">
                        95%: {INR(f.lower_bound_95)}–{INR(f.upper_bound_95)}
                      </div>
                    </div>
                  </div>
                ))}

                {!forecast.length && (
                  <div className="rounded-xl border border-dashed border-[#2a3b32] p-4 text-sm text-[#70887a]">
                    {forecastStatus}
                  </div>
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
