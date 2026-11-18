'use client';

import './market-prices.css';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Activity, ArrowDownRight, ArrowUpRight, BarChart3, BrainCircuit,
  CalendarDays, ChevronLeft, ChevronRight, Database, MapPin, RefreshCw,
  Search, Store, Truck, CloudSun, Bot, Wheat, Layers3,
} from 'lucide-react';

type Option = { code: string; name: string; state_code?: string; district_code?: string };
type PriceRow = {
  id: number;
  commodity_code: string;
  commodity_name: string;
  mandi_code: string;
  mandi_name: string;
  state_code: string;
  state_name: string;
  district_code?: string | null;
  district_name?: string | null;
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
  historyDateCount: number | null;
};
type MarketPayload = {
  ok: boolean;
  rows: PriceRow[];
  commodities?: Option[];
  states?: Option[];
  districts?: Option[];
  mandis?: Option[];
  count: number;
  summary: MarketSummary;
  error?: string;
};

const PAGE_SIZES = [25, 50, 100];
const numberFormat = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
const priceFormat = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const money = (value: number) => `₹${priceFormat.format(value)}`;
const dateLabel = (value?: string | null) => value
  ? new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  : 'Date unavailable';

export default function MarketPricesPage() {
  const [rows, setRows] = useState<PriceRow[]>([]);
  const [commodities, setCommodities] = useState<Option[]>([]);
  const [states, setStates] = useState<Option[]>([]);
  const [districts, setDistricts] = useState<Option[]>([]);
  const [mandis, setMandis] = useState<Option[]>([]);
  const metadataLoaded = useRef(false);
  const [commodity, setCommodity] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [mandi, setMandi] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<MarketSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        limit: String(pageSize),
        offset: String(page * pageSize),
        includeMetadata: metadataLoaded.current ? 'false' : 'true',
      });
      if (commodity) params.set('commodity', commodity);
      if (state) params.set('state', state);
      if (district) params.set('district', district);
      if (mandi) params.set('mandi', mandi);
      if (search.trim()) params.set('search', search.trim());

      const response = await fetch(`/api/market-prices?${params.toString()}`, {
        cache: 'no-store',
        signal,
        headers: { Accept: 'application/json' },
      });
      const payload = await response.json() as MarketPayload;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || `Market data request failed (HTTP ${response.status}).`);
      }

      setRows(Array.isArray(payload.rows) ? payload.rows : []);
      if (Array.isArray(payload.commodities)) setCommodities(payload.commodities);
      if (Array.isArray(payload.states)) setStates(payload.states);
      if (Array.isArray(payload.districts)) setDistricts(payload.districts);
      if (Array.isArray(payload.mandis)) setMandis(payload.mandis);
      if (Array.isArray(payload.commodities) && Array.isArray(payload.states) && Array.isArray(payload.districts) && Array.isArray(payload.mandis)) {
        metadataLoaded.current = true;
      }
      setTotal(Number(payload.count) || 0);
      setSummary(payload.summary || null);
      setUpdatedAt(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    } catch (cause) {
      if ((cause as Error)?.name === 'AbortError') return;
      setError(cause instanceof Error ? cause.message : 'Unable to load mandi prices.');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [commodity, state, district, mandi, search, page, pageSize]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => void load(controller.signal), search ? 300 : 0);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [load, search]);

  const latest = summary?.latest ?? rows[0] ?? null;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const firstRow = total === 0 ? 0 : page * pageSize + 1;
  const lastRow = Math.min((page + 1) * pageSize, total);
  const visibleDistricts = useMemo(
    () => districts.filter((item) => !state || item.state_code === state),
    [districts, state],
  );
  const visibleMandis = useMemo(
    () => mandis.filter((item) => (!state || item.state_code === state) && (!district || item.district_code === district)),
    [mandis, state, district],
  );
  const sourceAgeDays = latest?.observation_date
    ? Math.max(0, Math.floor((Date.now() - new Date(`${latest.observation_date}T00:00:00Z`).getTime()) / 86400000))
    : null;

  const resetPage = () => setPage(0);
  const changeAmount = summary?.changeAmount;
  const changeText = changeAmount == null ? '—' : `${changeAmount > 0 ? '+' : changeAmount < 0 ? '−' : ''}${money(Math.abs(changeAmount))}`;
  const changeDetail = summary?.previous
    ? `${summary.changePercent == null ? '' : `${summary.changePercent > 0 ? '+' : ''}${summary.changePercent.toFixed(2)}% · `}vs ${dateLabel(summary.previous.observation_date)}`
    : 'No earlier matching observation';
  const historyDateCount = summary?.historyDateCount ?? null;
  const forecastStatus = historyDateCount == null
    ? 'History coverage unavailable'
    : historyDateCount <= 1
      ? `Insufficient history · ${historyDateCount} date`
      : `${numberFormat.format(historyDateCount)} observed dates · model not trained`;

  return (
    <main className="market-dashboard">
      <div className="market-dashboard__glow" aria-hidden="true" />

      <div className="market-dashboard__content">
        <header className="market-heading">
          <div>
            <div className="market-eyebrow"><span className="market-live-dot" /> AGMARKNET MARKET INTELLIGENCE</div>
            <h1>Commodity Prices &amp; Mandi Forecast</h1>
            <p>Verified mandi observations, comparable price movement and transparent historical coverage.</p>
            {sourceAgeDays != null && (
              <div className={`market-freshness ${sourceAgeDays > 3 ? 'is-stale' : 'is-current'}`} role="status">
                <span className="market-freshness__dot" />
                {sourceAgeDays === 0 ? 'Latest source data: today' : `Source data delayed · ${numberFormat.format(sourceAgeDays)} days old`}
                <span>· {dateLabel(latest?.observation_date)}</span>
              </div>
            )}
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
            <input value={search} onChange={(event) => { setSearch(event.target.value); resetPage(); }} placeholder="Search commodities, mandis, variety…" />
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
            <select value={state} onChange={(event) => { setState(event.target.value); setDistrict(''); setMandi(''); resetPage(); }}>
              <option value="">All states</option>
              {states.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
            </select>
          </label>
          <label className="market-filter">
            <MapPin size={15} />
            <span className="sr-only">Filter by district</span>
            <select value={district} onChange={(event) => { setDistrict(event.target.value); setMandi(''); resetPage(); }}>
              <option value="">All districts</option>
              {visibleDistricts.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
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
          <div className="market-source"><Database size={14} /><span>Source: AGMARKNET / DMI</span></div>
        </section>

        {error && <div className="market-error" role="alert">{error}</div>}

        <section className="market-kpis" aria-label="Market price summary">
          <MetricCard
            label="Latest modal"
            value={latest ? money(latest.modal_price) : loading ? 'Loading…' : '—'}
            note={latest ? 'per quintal' : 'No matching price'}
            accent
          />
          <MetricCard
            label="Change vs previous"
            value={changeText}
            note={changeDetail}
            trend={changeAmount}
          />
          <MetricCard
            label="Latest arrivals"
            value={latest?.arrival_quantity == null ? 'N/A' : priceFormat.format(latest.arrival_quantity)}
            note={latest?.arrival_quantity == null ? 'Not supplied by source' : `Reported quantity · ${dateLabel(latest.observation_date)}`}
          />
          <MetricCard
            label="Observed points"
            value={numberFormat.format(total)}
            note="Records in current filter selection"
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

          <article className="market-feature-card market-forecast-card">
            <div className="market-card-label"><BarChart3 size={14} /> MANDI FORECAST</div>
            <h2>Next 7 days</h2>
            <div className="market-forecast-status"><BrainCircuit size={16} /> {forecastStatus}</div>
            <p>
              This exact commodity, mandi, variety and grade series has {historyDateCount == null ? 'an unknown number of' : numberFormat.format(historyDateCount)} distinct official observation date(s).
              A seven-day forecast remains withheld until sufficient history is available and a forecasting model has been validated.
              No synthetic prices are shown.
            </p>
            <div className="market-forecast-reference">
              <span>Latest observed reference</span>
              <b>{latest ? money(latest.modal_price) : '—'}</b>
            </div>
            <div className="market-forecast-foot"><CalendarDays size={13} /> Based on real observations only · no generated price history</div>
          </article>
        </section>

        <section className="market-data-panel">
          <div className="market-table-heading">
            <div>
              <div className="market-card-label"><Database size={14} /> CANONICAL OBSERVATIONS</div>
              <h2>All Mandi Prices</h2>
              <p>Browse every matching record using server-side pagination. No fixed first-page dataset limit.</p>
            </div>
            <div className="market-table-total">{numberFormat.format(total)} records</div>
          </div>

          <div className="market-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Observation date</th>
                  <th>Commodity</th>
                  <th>Market / Mandi</th>
                  <th>District</th>
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
                    <td>{row.district_name || '—'}</td>
                    <td>{row.state_name}</td>
                    <td>{[row.variety, row.grade].filter(Boolean).join(' · ') || '—'}</td>
                    <td className="numeric">{money(row.min_price)}</td>
                    <td className="numeric price-cell">{money(row.modal_price)}</td>
                    <td className="numeric">{money(row.max_price)}</td>
                    <td className="numeric">{row.arrival_quantity == null ? 'N/A' : priceFormat.format(row.arrival_quantity)}</td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr><td colSpan={10} className="market-table-empty">{loading ? 'Loading official observations…' : 'No records match the selected filters.'}</td></tr>
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
              <span>Page {numberFormat.format(page + 1)} / {numberFormat.format(totalPages)}</span>
              <button type="button" onClick={() => setPage((value) => Math.min(totalPages - 1, value + 1))} disabled={page + 1 >= totalPages || loading} aria-label="Next page"><ChevronRight size={16} /></button>
            </div>
          </div>
        </section>

        <footer className="market-footer">
          <span><Database size={13} /> Supabase · canonical AGMARKNET / DMI observations · CSV staging disabled</span>
          <span>Checked {updatedAt || '—'} · Latest source date {dateLabel(latest?.observation_date)} · Prices in ₹ per quintal</span>
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
