'use client';

import './market-prices.css';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Activity, ArrowDownRight, ArrowUpRight, BarChart3, BrainCircuit,
  CalendarDays, ChevronLeft, ChevronRight, Database, MapPin, RefreshCw,
  Search, Store, Truck, CloudSun, Bot, Wheat, Layers3, X,
} from 'lucide-react';

type Option = { code: string; name: string; state_code?: string };
type PriceRow = {
  id: number;
  commodity_code: string;
  commodity_name: string;
  mandi_code: string;
  mandi_name: string;
  state_code: string;
  state_name: string;
  district_code?: string | null;
  observation_date: string;
  modal_price: number;
  min_price: number;
  max_price: number;
  arrival_quantity: number | null;
  source: string | null;
  variety?: string | null;
  grade?: string | null;
};
type MarketSummary = {
  latest: PriceRow | null;
  previous: PriceRow | null;
  changeAmount: number | null;
  changePercent: number | null;
  observedRecords: number;
};
type ForecastPoint = {
  target_date: string;
  forecast_horizon_days: number;
  predicted_value: number;
  lower_bound_95: number;
  upper_bound_95: number;
  data_type: string;
};
type ForecastPayload = {
  ok: boolean;
  training_status?: 'BASELINE_ONLY' | 'MODEL_READY';
  message?: string;
  source_date?: string;
  forecast_base_date?: string;
  days_since_last_observation?: number;
  distinct_observation_dates?: number;
  forecast?: ForecastPoint[];
  error?: string;
};
type MarketPayload = {
  ok: boolean;
  rows: PriceRow[];
  commodities: Option[];
  states: Option[];
  mandis: Option[];
  count: number;
  summary?: MarketSummary;
  latest_observation_date?: string | null;
  error?: string;
};

const PAGE_SIZES = [25, 50, 100];
const numberFormat = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
const priceFormat = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const money = (value: number) => `₹${priceFormat.format(value)}`;
const dateLabel = (value?: string | null) => value
  ? new Date(`${value}T00:00:00Z`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })
  : 'Date unavailable';

function indiaToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function ageInDays(date?: string | null) {
  if (!date) return null;
  const current = indiaToday();
  const start = Date.parse(`${date}T00:00:00Z`);
  const end = Date.parse(`${current}T00:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  return Math.max(0, Math.floor((end - start) / 86400000));
}

export default function MarketPricesPage() {
  const [rows, setRows] = useState<PriceRow[]>([]);
  const [commodities, setCommodities] = useState<Option[]>([]);
  const [states, setStates] = useState<Option[]>([]);
  const [mandis, setMandis] = useState<Option[]>([]);
  const [commodity, setCommodity] = useState('');
  const [state, setState] = useState('');
  const [mandi, setMandi] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<MarketSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');
  const [forecast, setForecast] = useState<ForecastPayload | null>(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState('');
  const activeRequest = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        limit: String(pageSize),
        offset: String(page * pageSize),
      });
      if (commodity) params.set('commodity', commodity);
      if (state) params.set('state', state);
      if (mandi) params.set('mandi', mandi);
      if (search.trim()) params.set('search', search.trim());

      const response = await fetch(`/api/market-prices?${params.toString()}`, {
        cache: 'no-store',
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      const payload = await response.json() as MarketPayload;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || `Market data request failed (HTTP ${response.status}).`);
      }

      setRows(Array.isArray(payload.rows) ? payload.rows : []);
      setCommodities(Array.isArray(payload.commodities) ? payload.commodities : []);
      setStates(Array.isArray(payload.states) ? payload.states : []);
      setMandis(Array.isArray(payload.mandis) ? payload.mandis : []);
      setTotal(Number(payload.count) || 0);
      // Page two onward intentionally omits the summary query; preserve the
      // page-one summary cards instead of replacing them with blank values.
      if (payload.summary) setSummary(payload.summary);
      setUpdatedAt(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }));
    } catch (cause) {
      if ((cause as Error)?.name === 'AbortError') return;
      setError(cause instanceof Error ? cause.message : 'Unable to load mandi prices.');
    } finally {
      if (activeRequest.current === controller) {
        activeRequest.current = null;
        setLoading(false);
      }
    }
  }, [commodity, state, mandi, search, page, pageSize]);

  useEffect(() => {
    const trimmed = search.trim();
    if (trimmed.length === 1) {
      activeRequest.current?.abort();
      setRows([]);
      setSummary(null);
      setTotal(0);
      setError('Enter at least two characters to search market prices.');
      setLoading(false);
      setForecast(null);
      return;
    }

    const timer = window.setTimeout(() => void load(), trimmed ? 300 : 0);
    return () => {
      window.clearTimeout(timer);
      activeRequest.current?.abort();
    };
  }, [load, search]);

  const latest = summary?.latest ?? rows[0] ?? null;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const firstRow = total === 0 ? 0 : page * pageSize + 1;
  const lastRow = Math.min((page + 1) * pageSize, total);
  const visibleMandis = useMemo(
    () => mandis.filter((item) => !state || item.state_code === state),
    [mandis, state],
  );
  const hasActiveFilters = Boolean(search.trim() || commodity || state || mandi);
  const sourceAge = ageInDays(latest?.observation_date);
  const sourceIsStale = sourceAge != null && sourceAge > 2;

  const resetPage = () => setPage(0);
  const clearFilters = () => {
    setSearch('');
    setCommodity('');
    setState('');
    setMandi('');
    setPage(0);
  };

  const changeAmount = summary?.changeAmount;
  const changeText = changeAmount == null
    ? '—'
    : `${changeAmount > 0 ? '+' : changeAmount < 0 ? '−' : ''}${money(Math.abs(changeAmount))}`;
  const changeDetail = summary?.changePercent == null
    ? 'No earlier matching observation date'
    : `${summary.changePercent > 0 ? '+' : ''}${summary.changePercent.toFixed(2)}% vs prior date`;

  useEffect(() => {
    if (!latest) {
      setForecast(null);
      setForecastError('');
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams({
      commodity_code: latest.commodity_code,
      mandi_code: latest.mandi_code,
      state_code: latest.state_code,
      district_code: latest.district_code || '',
      horizon_days: '7',
    });
    setForecastLoading(true);
    setForecastError('');

    fetch(`/api/v1/mandi/forecast?${params.toString()}`, {
      cache: 'no-store',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
      .then(async (response) => {
        const payload = await response.json() as ForecastPayload;
        if (!response.ok || !payload.ok) {
          throw new Error(payload.error || `Forecast request failed (HTTP ${response.status}).`);
        }
        setForecast(payload);
      })
      .catch((cause) => {
        if ((cause as Error)?.name !== 'AbortError') {
          setForecast(null);
          setForecastError(cause instanceof Error ? cause.message : 'Forecast is unavailable.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setForecastLoading(false);
      });

    return () => controller.abort();
  }, [latest?.commodity_code, latest?.mandi_code, latest?.state_code, latest?.district_code]);

  const forecastPoints = forecast?.forecast ?? [];
  const forecastStatus = forecast?.training_status === 'MODEL_READY'
    ? 'Model-based projection'
    : 'Reference baseline · not trained';

  return (
    <main className="market-dashboard">
      <div className="market-dashboard__glow" aria-hidden="true" />

      <div className="market-dashboard__content">
        <header className="market-heading">
          <div>
            <div className="market-eyebrow"><span className="market-live-dot" /> AGMARKNET MARKET INTELLIGENCE</div>
            <h1>Commodity Prices &amp; Mandi Forecast</h1>
            <p>Official mandi observations, transparent price movement, and a seven-day outlook based on available history.</p>
          </div>
          <button type="button" className="market-refresh" onClick={() => void load()} disabled={loading}>
            <RefreshCw size={15} className={loading ? 'market-spin' : ''} />
            {loading ? 'Refreshing' : 'Refresh'}
          </button>
        </header>

        <nav className="market-sector-links" aria-label="AgriMark sectors">
          <Link href="/marketplace"><Store size={14} /> Marketplace</Link>
          <Link href="/farmer/harvest"><Layers3 size={14} /> Harvest &amp; Lots</Link>
          <Link href="/weather"><CloudSun size={14} /> Weather</Link>
          <Link href="/logistics"><Truck size={14} /> Logistics</Link>
          <Link href="/ai-assistant"><Bot size={14} /> AgriAI</Link>
        </nav>

        <section className="market-toolbar" aria-label="Market filters">
          <label className="market-filter">
            <Search size={15} />
            <span className="sr-only">Search commodity or mandi</span>
            <input
              value={search}
              onChange={(event) => { setSearch(event.target.value); resetPage(); }}
              placeholder="Search commodities, mandis, variety…"
              aria-label="Search commodities, mandis, variety or grade"
            />
          </label>
          <label className="market-filter">
            <Wheat size={15} />
            <span className="sr-only">Filter by commodity</span>
            <select value={commodity} onChange={(event) => { setCommodity(event.target.value); resetPage(); }}>
              <option value="">All commodities</option>
              {commodities.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
            </select>
          </label>
          <label className="market-filter">
            <MapPin size={15} />
            <span className="sr-only">Filter by state</span>
            <select value={state} onChange={(event) => { setState(event.target.value); setMandi(''); resetPage(); }}>
              <option value="">All states</option>
              {states.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
            </select>
          </label>
          <label className="market-filter">
            <Store size={15} />
            <span className="sr-only">Filter by mandi</span>
            <select value={mandi} onChange={(event) => { setMandi(event.target.value); resetPage(); }}>
              <option value="">All mandis</option>
              {visibleMandis.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
            </select>
          </label>
          <div className="market-source"><Database size={14} /><span>Source: {latest?.source || 'AGMARKNET'}</span></div>
        </section>

        <div className="market-toolbar-status" aria-live="polite">
          <div className={`market-freshness ${sourceIsStale ? 'is-stale' : ''}`}>
            <span className="market-live-dot" />
            {latest
              ? sourceAge === 0 ? `Source date: ${dateLabel(latest.observation_date)} · today`
                : `Source date: ${dateLabel(latest.observation_date)} · ${sourceAge} day${sourceAge === 1 ? '' : 's'} old`
              : loading ? 'Checking official source date…' : 'No source date for this selection'}
          </div>
          {hasActiveFilters && (
            <button type="button" className="market-clear-filters" onClick={clearFilters} disabled={loading}>
              <X size={13} /> Clear filters
            </button>
          )}
          {loading && <span className="market-loading-note">Updating market prices…</span>}
        </div>

        {error && <div className="market-error" role="alert">{error}</div>}

        <section className="market-kpis" aria-label="Market price summary" aria-busy={loading}>
          <MetricCard
            label="Latest modal price"
            value={latest ? money(latest.modal_price) : loading ? 'Loading…' : '—'}
            note={latest ? '₹ per quintal' : 'No matching price'}
            accent
          />
          <MetricCard
            label="Change vs prior date"
            value={changeText}
            note={changeDetail}
            trend={changeAmount}
          />
          <MetricCard
            label="Arrivals"
            value={latest?.arrival_quantity == null ? 'N/A' : numberFormat.format(latest.arrival_quantity)}
            note={latest?.arrival_quantity == null ? 'Not supplied in this source record' : `Reported · ${dateLabel(latest.observation_date)}`}
          />
          <MetricCard
            label="Observed records"
            value={numberFormat.format(total)}
            note="Records in the current filter selection"
          />
        </section>

        <section className="market-feature-grid">
          <article className="market-feature-card market-latest-card">
            <div className="market-feature-card__top">
              <div>
                <div className="market-card-label"><Activity size={14} /> LATEST MARKET OBSERVATION</div>
                <h2>{latest?.commodity_name || (loading ? 'Loading market data…' : 'No matching record')}</h2>
                <p className="market-location"><MapPin size={13} /> {latest ? `${latest.mandi_name}, ${latest.state_name}` : 'Select a commodity or mandi to explore prices'}</p>
              </div>
              <span className="market-date"><CalendarDays size={13} /> {dateLabel(latest?.observation_date)}</span>
            </div>
            {latest ? (
              <>
                <div className="market-hero-price">{money(latest.modal_price)}<small> / quintal</small></div>
                <div className="market-price-range">
                  <PriceRange label="Minimum" value={latest.min_price} />
                  <PriceRange label="Modal" value={latest.modal_price} primary />
                  <PriceRange label="Maximum" value={latest.max_price} />
                </div>
                <div className="market-observation-meta">
                  <span>Variety <b>{latest.variety || '—'}</b></span>
                  <span>Grade <b>{latest.grade || '—'}</b></span>
                  <span>Source <b>{latest.source || 'AGMARKNET'}</b></span>
                </div>
              </>
            ) : (
              <div className="market-empty">{loading ? 'Reading observations from Supabase…' : 'No prices are available for these filters.'}</div>
            )}
          </article>

          <article className="market-feature-card market-forecast-card" aria-busy={forecastLoading}>
            <div className="market-card-label"><BarChart3 size={14} /> MANDI FORECAST</div>
            <h2>Next 7 days</h2>
            <div className={`market-forecast-status ${forecast?.training_status === 'MODEL_READY' ? 'is-model' : ''}`}>
              <BrainCircuit size={16} />
              {forecastLoading ? 'Building outlook…' : forecast ? forecastStatus : 'Waiting for price data'}
            </div>
            {forecastError ? (
              <p className="market-forecast-message" role="status">{forecastError}</p>
            ) : forecast ? (
              <>
                <p className="market-forecast-message">
                  {forecast.message || 'Projection based on the latest available official observations.'}
                </p>
                {forecast.source_date && (
                  <div className="market-forecast-source">Latest training observation: {dateLabel(forecast.source_date)}</div>
                )}
                <ForecastMiniChart points={forecastPoints} />
                <div className="market-forecast-values">
                  {forecastPoints.map((point) => (
                    <div key={point.target_date}>
                      <span>{dateLabel(point.target_date)}</span>
                      <b>{money(point.predicted_value)}</b>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="market-forecast-message">
                {forecastLoading ? 'Loading verified history for this commodity and mandi…' : 'Select a market observation to calculate a seven-day outlook.'}
              </p>
            )}
            <div className="market-forecast-foot"><CalendarDays size={13} /> Forecast dates start from today · no historical prices are fabricated</div>
          </article>
        </section>

        <section className="market-data-panel" aria-busy={loading}>
          <div className="market-table-heading">
            <div>
              <div className="market-card-label"><Database size={14} /> CANONICAL OBSERVATIONS</div>
              <h2>All Mandi Prices</h2>
              <p>Complete matching result set, loaded a page at a time from Supabase.</p>
            </div>
            <div className="market-table-total">{numberFormat.format(total)} records</div>
          </div>

          <div className={`market-table-wrap ${loading ? 'is-loading' : ''}`}>
            <table>
              <thead>
                <tr>
                  <th>Observation date</th>
                  <th>Commodity</th>
                  <th>Market / Mandi</th>
                  <th>State</th>
                  <th>Variety / Grade</th>
                  <th className="numeric">Min (₹/Q)</th>
                  <th className="numeric">Modal (₹/Q)</th>
                  <th className="numeric">Max (₹/Q)</th>
                  <th className="numeric">Arrival quantity</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{dateLabel(row.observation_date)}</td>
                    <td className="strong-cell">{row.commodity_name}</td>
                    <td>{row.mandi_name}</td>
                    <td>{row.state_name}</td>
                    <td>{[row.variety, row.grade].filter(Boolean).join(' · ') || '—'}</td>
                    <td className="numeric">{money(row.min_price)}</td>
                    <td className="numeric price-cell">{money(row.modal_price)}</td>
                    <td className="numeric">{money(row.max_price)}</td>
                    <td className="numeric">{row.arrival_quantity == null ? 'N/A' : numberFormat.format(row.arrival_quantity)}</td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr><td colSpan={9} className="market-table-empty">{loading ? 'Loading official observations…' : 'No records match the selected filters.'}</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="market-pagination">
            <span>Showing <b>{numberFormat.format(firstRow)}–{numberFormat.format(lastRow)}</b> of <b>{numberFormat.format(total)}</b></span>
            <div className="market-pagination-controls">
              <label>Rows
                <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(0); }}>
                  {PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
                </select>
              </label>
              <button type="button" onClick={() => setPage((value) => Math.max(0, value - 1))} disabled={page === 0 || loading} aria-label="Previous page"><ChevronLeft size={16} /></button>
              <span>Page {numberFormat.format(Math.min(page + 1, totalPages))} / {numberFormat.format(totalPages)}</span>
              <button type="button" onClick={() => setPage((value) => Math.min(totalPages - 1, value + 1))} disabled={page + 1 >= totalPages || loading} aria-label="Next page"><ChevronRight size={16} /></button>
            </div>
          </div>
        </section>

        <footer className="market-footer">
          <span><Database size={13} /> Supabase · official AGMARKNET canonical observations · CSV staging disabled</span>
          <span>Read at {updatedAt || '—'} · Source date {dateLabel(latest?.observation_date)} · Prices in ₹ per quintal</span>
        </footer>
      </div>
    </main>
  );
}

function MetricCard({ label, value, note, accent = false, trend }: {
  label: string; value: string; note: string; accent?: boolean; trend?: number | null;
}) {
  const TrendIcon = trend != null && trend < 0 ? ArrowDownRight : ArrowUpRight;
  return (
    <article className="market-kpi">
      <div className="market-kpi__label">{label}</div>
      <div className={`market-kpi__value ${accent ? 'is-accent' : ''} ${trend != null && trend < 0 ? 'is-down' : ''}`}>
        {trend != null && <TrendIcon size={17} />}
        {value}
      </div>
      <div className="market-kpi__note">{note}</div>
    </article>
  );
}

function PriceRange({ label, value, primary = false }: { label: string; value: number; primary?: boolean }) {
  return (
    <div className={`market-range-item ${primary ? 'is-primary' : ''}`}>
      <span>{label}</span>
      <b>{money(value)}</b>
    </div>
  );
}

function ForecastMiniChart({ points }: { points: ForecastPoint[] }) {
  if (!points.length) return null;
  const low = Math.min(...points.map((point) => point.lower_bound_95));
  const high = Math.max(...points.map((point) => point.upper_bound_95));
  const range = Math.max(high - low, 1);
  const x = (index: number) => 12 + (index / Math.max(points.length - 1, 1)) * 276;
  const y = (value: number) => 62 - ((value - low) / range) * 48;
  const line = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${x(index)} ${y(point.predicted_value)}`).join(' ');
  const upper = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${x(index)} ${y(point.upper_bound_95)}`).join(' ');
  const lower = [...points].reverse().map((point, index) => {
    const originalIndex = points.length - 1 - index;
    return `L ${x(originalIndex)} ${y(point.lower_bound_95)}`;
  }).join(' ');

  return (
    <div className="market-forecast-chart">
      <svg viewBox="0 0 300 76" role="img" aria-label="Seven-day mandi price outlook with uncertainty band">
        <path d={`${upper} ${lower} Z`} className="market-forecast-band" />
        <path d={line} className="market-forecast-line" />
        {points.map((point, index) => (
          <circle key={point.target_date} cx={x(index)} cy={y(point.predicted_value)} r="2.8" className="market-forecast-point" />
        ))}
      </svg>
      <div className="market-forecast-range"><span>Lower / upper source-based range</span><b>{money(low)} – {money(high)}</b></div>
    </div>
  );
}
