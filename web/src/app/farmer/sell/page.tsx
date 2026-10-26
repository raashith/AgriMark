'use client';

import React, { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { getSupabaseClient } from '@/lib/supabase';
import { ProduceLot } from '@/types';
import {
  ShoppingCart, CheckCircle2, AlertCircle, Sparkles, TrendingUp, Info,
  RefreshCw, Search, Package, Leaf, CalendarDays, ArrowLeft,
  Tag, Sprout, Boxes, ShieldCheck, BarChart3,
} from 'lucide-react';

type PriceComparison = {
  commodity: string;
  medianPerKg: number;
  lowPerKg: number;
  highPerKg: number;
  observations: number;
  latestDate: string;
  source: string;
  unitLabel: string;
};

const money = (value: number) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 2,
}).format(value);

function median(values: number[]): number {
  const sorted = values.filter((v) => Number.isFinite(v) && v > 0).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function normalizeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function formatDate(value?: string | null) {
  if (!value) return 'Not set';
  const parsed = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return String(value).slice(0, 10);
  return parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function cropInitials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('') || 'AG';
}

function cropEmoji(name: string) {
  const crop = normalizeName(name);
  if (/rice|paddy/.test(crop)) return '🌾';
  if (/wheat|barley|millet|ragi|jowar|sorghum|bajra/.test(crop)) return '🌾';
  if (/maize|corn/.test(crop)) return '🌽';
  if (/tomato/.test(crop)) return '🍅';
  if (/potato/.test(crop)) return '🥔';
  if (/onion/.test(crop)) return '🧅';
  if (/chilli|chili|pepper/.test(crop)) return '🌶️';
  if (/banana/.test(crop)) return '🍌';
  if (/mango/.test(crop)) return '🥭';
  if (/coconut/.test(crop)) return '🥥';
  if (/groundnut|peanut/.test(crop)) return '🥜';
  if (/soybean|bean|pea|pulse|lentil|gram|dal|arhar|tur/.test(crop)) return '🫘';
  if (/cotton/.test(crop)) return '☁️';
  if (/sugarcane/.test(crop)) return '🎋';
  if (/garlic/.test(crop)) return '🧄';
  if (/ginger/.test(crop)) return '🫚';
  if (/grape/.test(crop)) return '🍇';
  if (/apple/.test(crop)) return '🍎';
  if (/orange|citrus/.test(crop)) return '🍊';
  if (/papaya/.test(crop)) return '🍈';
  return '🌱';
}

function lotCrop(lot: ProduceLot, resolved: string) {
  return lot.crop_name?.trim() || (resolved && lot.id ? resolved : '') || 'Produce lot';
}

function GlassPanel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`sell-glass-panel ${className}`}>{children}</section>;
}

function SellForm() {
  const { t } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryLotId = searchParams.get('lot_id') || '';
  const [lots, setLots] = useState<ProduceLot[]>([]);
  const [selectedLotId, setSelectedLotId] = useState(queryLotId);
  const [askingPrice, setAskingPrice] = useState('');
  const [harvestDate, setHarvestDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [priceLoading, setPriceLoading] = useState(false);
  const [comparison, setComparison] = useState<PriceComparison | null>(null);
  const [priceError, setPriceError] = useState('');
  const [aiAdvice, setAiAdvice] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [resolvedCropName, setResolvedCropName] = useState('');

  const fetchLots = useCallback(async () => {
    try {
      const [res, cropCatalog] = await Promise.all([
        api.getProduceLots(),
        api.getCrops().catch((error) => {
          console.warn('[AgriMark Sell Produce] Crop catalog lookup failed:', error);
          return { items: [] as Array<{ id: string; name: string }> };
        }),
      ]);
      const cropNames = new Map(
        (cropCatalog.items || [])
          .filter((crop: { id?: string; name?: string }) => crop.id && crop.name)
          .map((crop: { id: string; name: string }) => [String(crop.id), String(crop.name).trim()])
      );
      const withCropNames = res.map((lot) => ({
        ...lot,
        crop_name: lot.crop_name?.trim() || cropNames.get(String(lot.crop_id)) || '',
      }));
      const unlisted = withCropNames.filter((lot) => !lot.is_listed && (lot.status ?? 'available') === 'available');
      setLots(unlisted);
      setSelectedLotId((current) => {
        if (current && unlisted.some((lot) => lot.id === current)) return current;
        if (queryLotId && unlisted.some((lot) => lot.id === queryLotId)) return queryLotId;
        return unlisted[0]?.id || '';
      });
    } catch (error) {
      console.error('[AgriMark Sell Produce] Could not load available lots:', error);
      setMessage(error instanceof Error ? error.message : 'Could not load your produce lots. Refresh and try again.');
    } finally {
      setLoading(false);
    }
  }, [queryLotId]);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    void fetchLots();
  }, [user?.id, fetchLots]);

  const selectedLot = lots.find((lot) => lot.id === selectedLotId);
  const [resolvedCropNames, setResolvedCropNames] = useState<Record<string, string>>({});
  const selectedResolvedCropName = selectedLot ? (selectedLot.crop_name?.trim() || resolvedCropNames[selectedLot.id] || '') : '';
  const cropForSelected = selectedResolvedCropName || (selectedLot ? 'Resolving crop name…' : 'Select produce');
  const selectedAvailable = Number(selectedLot?.available_quantity ?? selectedLot?.quantity_kg ?? selectedLot?.quantity ?? 0);
  const selectedUnit = selectedLot?.unit || 'kg';

  const filteredLots = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return lots.filter((lot) => {
      const crop = String(lot.crop_name?.trim() || resolvedCropNames[lot.id] || '').toLowerCase();
      const id = String(lot.id || '').toLowerCase();
      const grade = String(lot.quality_grade || '').toLowerCase();
      return !term || crop.includes(term) || id.includes(term) || grade.includes(term);
    });
  }, [lots, resolvedCropNames, searchTerm]);

  useEffect(() => {
    let cancelled = false;
    async function hydrateCropNames() {
      const missing = lots.filter((lot) => !lot.crop_name?.trim() && !resolvedCropNames[lot.id] && lot.crop_id);
      if (!missing.length) return;
      try {
        const supabase = getSupabaseClient();
        const ids = Array.from(new Set(missing.map((lot) => String(lot.crop_id))));
        const { data, error } = await supabase.from('crops').select('id,name').in('id', ids);
        if (error) throw error;
        if (cancelled) return;
        const byCropId = new Map((data || []).map((crop: { id: string; name: string }) => [String(crop.id), String(crop.name || '').trim()]));
        const resolved: Record<string, string> = {};
        for (const lot of missing) {
          const name = byCropId.get(String(lot.crop_id));
          if (name) resolved[lot.id] = name;
        }
        if (Object.keys(resolved).length) setResolvedCropNames((current) => ({ ...current, ...resolved }));
      } catch (error) {
        console.error('[AgriMark Sell Produce] Crop name hydration failed:', error);
      }
    }
    void hydrateCropNames();
    return () => { cancelled = true; };
  }, [lots, resolvedCropNames]);

  useEffect(() => {
    if (!selectedLot) { setHarvestDate(''); return; }
    setHarvestDate(String(selectedLot.harvested_at || selectedLot.harvest_date || '').slice(0, 10));
  }, [selectedLot?.id, selectedLot?.harvested_at, selectedLot?.harvest_date]);

  useEffect(() => {
    let cancelled = false;
    async function loadComparablePrices() {
      setComparison(null); setPriceError(''); setAiAdvice('');
      if (!selectedLot) { setPriceLoading(false); setAiLoading(false); return; }
      const cropName = selectedLot.crop_name?.trim() || resolvedCropNames[selectedLot.id] || '';
      if (!cropName) { setPriceLoading(false); return; }
      setPriceLoading(true);
      try {
        const supabase = getSupabaseClient();
        const { data: commodities, error: commodityError } = await supabase.from('national_commodities').select('code,name').limit(2000);
        if (commodityError) throw commodityError;
        const normalizedCrop = normalizeName(cropName);
        const commodity = (commodities || []).find((item: any) => normalizeName(String(item.name || '')) === normalizedCrop)
          || (commodities || []).find((item: any) => { const name = normalizeName(String(item.name || '')); return name.length >= 4 && (name.includes(normalizedCrop) || normalizedCrop.includes(name)); });
        if (!commodity) { if (!cancelled) setPriceError(`No official mandi commodity mapping was found for ${cropName}. You can still enter your own asking price.`); return; }
        const { data: rows, error: observationError } = await supabase.from('national_market_price_observations')
          .select('modal_price,min_price,max_price,observation_date,source').eq('commodity_code', commodity.code).gt('modal_price', 0)
          .order('observation_date', { ascending: false }).limit(100);
        if (observationError) throw observationError;
        const validRows = (rows || []).filter((row: any) => Number(row.modal_price) > 0);
        if (!validRows.length) { if (!cancelled) setPriceError(`No official price observations are available for ${cropName} yet. AgriMark will not guess a comparison price.`); return; }
        const perKg = (row: any, field: string) => Number(row[field] ?? row.modal_price) / 100;
        const modalValues = validRows.map((row: any) => perKg(row, 'modal_price')).filter((v: number) => v > 0);
        const lowValues = validRows.map((row: any) => perKg(row, 'min_price')).filter((v: number) => v > 0);
        const highValues = validRows.map((row: any) => perKg(row, 'max_price')).filter((v: number) => v > 0);
        const result: PriceComparison = { commodity: String(commodity.name || cropName), medianPerKg: median(modalValues),
          lowPerKg: lowValues.length ? Math.min(...lowValues) : median(modalValues), highPerKg: highValues.length ? Math.max(...highValues) : median(modalValues),
          observations: validRows.length, latestDate: String(validRows[0]?.observation_date || '').slice(0, 10),
          source: String(validRows[0]?.source || 'Stored mandi observations'), unitLabel: '₹/kg' };
        if (!cancelled) {
          setComparison(result); setAiLoading(true);
          try {
            const askingValue = Number(askingPrice);
            const context = [
              'You are AgriMark AI helping an Indian farmer price a produce listing.',
              'Use only the verified market figures below. Do not invent prices, market facts, or forecasts.',
              `Crop: ${result.commodity}; quality grade: ${selectedLot.quality_grade || 'not specified'}.`,
              `Official mandi records: ${result.observations}; latest observation: ${result.latestDate || 'not provided'}; source: ${result.source}.`,
              `Observed modal-price median: ₹${result.medianPerKg.toFixed(2)}/kg.`,
              `Observed min/max range across returned records: ₹${result.lowPerKg.toFixed(2)}–₹${result.highPerKg.toFixed(2)}/kg.`,
              Number.isFinite(askingValue) && askingValue > 0 ? `Farmer asking price: ₹${askingValue.toFixed(2)}/kg.` : 'Farmer has not entered an asking price.',
              'In 2-4 short sentences, compare the asking price to this observed reference, mention quality, transport, and local mandi differences, and clarify this is not a guaranteed sale price. Do not invent any figures.'
            ].join('\n');
            const advice = await api.askAgriAI(context, 'PRICE_COMPARISON_FROM_OFFICIAL_MANDI_OBSERVATIONS');
            if (!cancelled) setAiAdvice(advice.answer || '');
          } catch { if (!cancelled) setAiAdvice('Use the observed modal-price median as a reference. Final buyer offers can differ with quality, location, transport and demand.'); }
          finally { if (!cancelled) setAiLoading(false); }
        }
      } catch (error) {
        console.error('[AgriMark price comparison] Failed to load mandi observations:', error);
        if (!cancelled) setPriceError(error instanceof Error ? error.message : 'Could not load comparable mandi prices.');
      } finally { if (!cancelled) { setPriceLoading(false); setAiLoading(false); } }
    }
    void loadComparablePrices();
    return () => { cancelled = true; };
  }, [selectedLot?.id, selectedLot?.crop_name, selectedLot?.quality_grade, resolvedCropNames[selectedLot?.id || '']]);
  const asking = Number(askingPrice);

  const analyzeAskingPrice = async () => {
    if (!comparison || !selectedLot || !Number.isFinite(asking) || asking <= 0) return;
    setAiLoading(true);
    try {
      const context = [
        'You are AgriMark AI comparing a farmer asking price with official mandi observations.',
        'Use only the figures below. Do not invent data or promise a sale. Note that grade, location, transport and demand affect prices.',
        `Crop: ${comparison.commodity}; quality: ${selectedLot.quality_grade || 'not specified'}.`,
        `Farmer asking price: ₹${asking.toFixed(2)}/kg.`,
        `Observed modal median: ₹${comparison.medianPerKg.toFixed(2)}/kg; low: ₹${comparison.lowPerKg.toFixed(2)}/kg; high: ₹${comparison.highPerKg.toFixed(2)}/kg.`,
        `Records: ${comparison.observations}; latest observation: ${comparison.latestDate || 'unknown'}; source: ${comparison.source}.`,
        'In 2-4 concise sentences say whether the asking price is above, below, or near the observed median; do not recommend an unsupported exact price.',
      ].join('\n');
      const result = await api.askAgriAI(context, 'PRICE_COMPARISON_FROM_OFFICIAL_MANDI_OBSERVATIONS');
      setAiAdvice(result.answer || 'Compare your asking price with the observed median and account for quality, location and transport costs.');
    } catch {
      setAiAdvice('Your price comparison is shown above. Consider quality, location, transport costs and current buyer demand before publishing.');
    } finally {
      setAiLoading(false);
    }
  };

  const priceDifference = comparison && asking > 0 && comparison.medianPerKg > 0
    ? ((asking - comparison.medianPerKg) / comparison.medianPerKg) * 100 : null;

  const analyzeAskingPrice = async () => {
    if (!comparison || !selectedLot || !Number.isFinite(asking) || asking <= 0) return;
    setAiLoading(true);
    try {
      const context = [
        'You are AgriMark AI comparing a farmer asking price with official mandi observations.',
        'Use only the figures below. Do not invent data or promise a sale. Note that grade, location, transport and demand affect prices.',
        `Crop: ${comparison.commodity}; quality: ${selectedLot.quality_grade || 'not specified'}.`,
        `Farmer asking price: ₹${asking.toFixed(2)}/kg.`,
        `Observed modal median: ₹${comparison.medianPerKg.toFixed(2)}/kg; low: ₹${comparison.lowPerKg.toFixed(2)}/kg; high: ₹${comparison.highPerKg.toFixed(2)}/kg.`,
        `Records: ${comparison.observations}; latest observation: ${comparison.latestDate || 'unknown'}; source: ${comparison.source}.`,
        'In 2-4 concise sentences say whether the asking price is above, below, or near the observed median; do not recommend an unsupported exact price.',
      ].join('\n');
      const result = await api.askAgriAI(context, 'PRICE_COMPARISON_FROM_OFFICIAL_MANDI_OBSERVATIONS');
      setAiAdvice(result.answer || 'Compare your asking price with the observed median and account for quality, location and transport costs.');
    } catch {
      setAiAdvice('Your price comparison is shown above. Consider quality, location, transport costs and current buyer demand before publishing.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreateListing = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedLot) {
      setMessage('Error: Please select a valid produce lot.');
      return;
    }
    const unitPrice = Number(askingPrice);
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      setMessage('Error: Enter a price greater than zero.');
      return;
    }
    setSubmitting(true);
    setMessage('');
    try {
      await api.createListing({
        lot_id: selectedLot.id,
        title: cropForSelected !== 'Produce lot' ? cropForSelected : (selectedLot.quality_grade ? `${selectedLot.quality_grade} produce lot` : 'Produce lot'),
        price_per_unit: unitPrice,
        currency: 'INR',
        min_order_quantity: 1,
      });
      setMessage('Listing published to AgriMark Marketplace!');
      window.setTimeout(() => router.push('/buyer/marketplace'), 1200);
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Could not publish your listing.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    void fetchLots();
  };

  return (
    <div className="sell-produce-page mx-auto max-w-[1500px] space-y-6 pb-8">
      <style jsx global>{`
        .sell-produce-page {
          --sell-glass: rgba(8, 30, 23, .70);
          --sell-glass-soft: rgba(8, 26, 21, .58);
          --sell-stroke: rgba(142, 218, 179, .30);
          --sell-muted: #b7d1c5;
          position: relative;
          isolation: isolate;
          color: #f7fff9;
        }
        .sell-produce-page::before {
          content: "";
          position: absolute;
          z-index: -2;
          inset: -22px -22px 0;
          pointer-events: none;
          background:
            radial-gradient(ellipse at 12% 8%, rgba(45, 212, 191, .20), transparent 32%),
            radial-gradient(ellipse at 90% 2%, rgba(229, 169, 60, .12), transparent 29%),
            radial-gradient(ellipse at 45% 64%, rgba(16, 185, 129, .12), transparent 36%);
          filter: blur(12px);
        }
        .sell-glass-panel {
          border: 1px solid var(--sell-stroke);
          background: linear-gradient(135deg, rgba(12, 44, 33, .78), rgba(4, 22, 19, .72));
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
          box-shadow: 0 22px 60px rgba(0,0,0,.20), inset 0 1px 0 rgba(255,255,255,.08);
          border-radius: 24px;
        }
        .sell-glass-subpanel {
          border: 1px solid rgba(188, 235, 211, .24);
          background: linear-gradient(120deg, rgba(6, 29, 24, .76), rgba(8, 44, 35, .53));
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .sell-lot-card {
          border: 1px solid rgba(188, 235, 211, .34);
          background: linear-gradient(115deg, rgba(7, 28, 23, .74), rgba(6, 36, 28, .48));
          transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease, background .18s ease;
        }
        .sell-lot-card:hover { border-color: rgba(45, 212, 191, .75); transform: translateY(-1px); }
        .sell-lot-card[aria-pressed="true"] {
          border-color: #2de4c0;
          background: linear-gradient(115deg, rgba(7, 74, 58, .86), rgba(9, 53, 42, .72));
          box-shadow: 0 0 0 1px rgba(45, 212, 191, .55), 0 0 24px rgba(45, 212, 191, .15), inset 0 1px 0 rgba(255,255,255,.13);
        }
        .sell-input {
          width: 100%;
          min-width: 0;
          color: #f6fff9;
          background: rgba(3, 20, 17, .65);
          border: 1px solid rgba(175, 220, 198, .38);
          border-radius: 14px;
          padding: 13px 14px;
          outline: none;
          transition: border-color .18s ease, box-shadow .18s ease, background .18s ease;
        }
        .sell-input:focus { border-color: #2dd4bf; box-shadow: 0 0 0 3px rgba(45,212,191,.14); background: rgba(3, 28, 23, .83); }
        .sell-input:disabled { opacity: .55; cursor: not-allowed; }
        .sell-label { display: block; margin-bottom: 7px; color: #f0fff7; font-size: 12px; font-weight: 700; }
        .sell-caption { color: var(--sell-muted); font-size: 11px; line-height: 1.6; }
        .sell-primary-button {
          color: #03271e;
          background: linear-gradient(100deg, #21dfb6, #00cfa3 55%, #53efbd);
          box-shadow: 0 10px 30px rgba(0, 207, 163, .16), inset 0 1px 0 rgba(255,255,255,.43);
          transition: transform .18s ease, filter .18s ease, box-shadow .18s ease;
        }
        .sell-primary-button:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.05); box-shadow: 0 12px 34px rgba(0, 207, 163, .25); }
        .sell-primary-button:disabled { opacity: .5; cursor: not-allowed; }
        .sell-soft-button { border: 1px solid rgba(45, 212, 191, .42); background: rgba(7, 56, 44, .42); color: #64f0d3; }
        .sell-crop-art { background: linear-gradient(145deg, rgba(45,212,191,.22), rgba(229,169,60,.13)); border: 1px solid rgba(201,239,219,.28); }
        .sell-number { font-variant-numeric: tabular-nums; letter-spacing: -.025em; }
        .sell-scroll { scrollbar-color: rgba(45,212,191,.42) transparent; scrollbar-width: thin; }
        .sell-scroll::-webkit-scrollbar { width: 5px; }
        .sell-scroll::-webkit-scrollbar-thumb { background: rgba(45,212,191,.35); border-radius: 10px; }
        @media (max-width: 767px) {
          .sell-glass-panel { border-radius: 19px; }
          .sell-produce-page::before { inset: -8px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .sell-lot-card, .sell-primary-button { transition: none; }
        }
      `}</style>

      <div className="relative overflow-hidden rounded-[26px] border border-emerald-200/20 bg-gradient-to-r from-[#082b23]/95 via-[#07382c]/90 to-[#0b2e22]/80 p-5 shadow-[0_18px_60px_rgba(0,0,0,.2)] sm:p-7">
        <div aria-hidden="true" className="pointer-events-none absolute -right-14 -top-24 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute right-[22%] top-0 h-32 w-32 rounded-full bg-teal-300/10 blur-2xl" />
        <div className="relative flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
          <div className="min-w-0">
            <button type="button" onClick={() => router.push('/farmer/harvest')} className="mb-3 inline-flex items-center gap-2 text-xs font-semibold text-emerald-100/80 transition hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Back to Harvest & Lots
            </button>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-teal-200"><Leaf className="h-4 w-4" /> Farmer marketplace</div>
            <h1 className="mt-2 !text-3xl font-extrabold tracking-tight text-white sm:!text-4xl">Sell Produce Lot</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50/75">List your available harvest with verified mandi price insights and reach buyers through the AgriMark marketplace.</p>
          </div>
          <div className="sell-glass-subpanel flex max-w-xl items-center gap-4 rounded-2xl p-4 sm:p-5">
            <div className="sell-crop-art flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-emerald-100"><Sprout className="h-8 w-8" /></div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-extrabold text-white">Fresh from your farm</p>
              <p className="mt-1 text-xs leading-5 text-emerald-50/70">Transparent pricing. Traceable lots. Direct marketplace access.</p>
            </div>
            <Leaf className="hidden h-8 w-8 shrink-0 text-teal-300 sm:block" />
          </div>
        </div>
      </div>

      {message && <div role="status" className={`flex items-start gap-3 rounded-2xl border p-4 text-sm ${message.startsWith('Error') ? 'border-rose-300/25 bg-rose-950/45 text-rose-100' : 'border-emerald-300/25 bg-emerald-950/45 text-emerald-100'}`}>{message.startsWith('Error') ? <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />}<span>{message}</span></div>}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,.95fr)]">
        <GlassPanel className="min-w-0 p-4 sm:p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-teal-300/25 bg-teal-300/10 text-teal-200"><Boxes className="h-5 w-5" /></div>
              <div><h2 className="!text-lg font-extrabold text-white">Select produce from your stock</h2><p className="mt-1 text-xs leading-5 text-emerald-50/65">Choose a real available lot from your inventory.</p></div>
            </div>
            <button type="button" onClick={handleRefresh} disabled={loading} className="sell-soft-button inline-flex items-center justify-center gap-2 self-start rounded-xl px-3 py-2 text-xs font-bold disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh</button>
          </div>

          <label className="relative mt-5 block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-200" />
            <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search your produce, grade or lot ID…" className="sell-input !rounded-2xl !py-3 !pl-11" aria-label="Search available produce lots" />
          </label>

          <div className="sell-scroll mt-4 space-y-2.5 xl:max-h-[605px] xl:overflow-y-auto xl:pr-1">
            {loading ? Array.from({ length: 4 }).map((_, index) => <div key={index} className="flex animate-pulse items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5"><div className="h-12 w-12 rounded-xl bg-white/10" /><div className="flex-1 space-y-2"><div className="h-3 w-2/5 rounded bg-white/10" /><div className="h-3 w-1/3 rounded bg-white/10" /></div><div className="h-7 w-16 rounded-lg bg-white/10" /></div>) : filteredLots.length === 0 ? (
              <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-100/20 px-5 py-10 text-center">
                <Package className="h-10 w-10 text-teal-200/70" />
                <h3 className="mt-3 !text-base font-bold text-white">{lots.length ? 'No matching produce lots' : 'No available produce lots yet'}</h3>
                <p className="mt-2 max-w-sm text-xs leading-5 text-emerald-50/60">{lots.length ? 'Try a different crop, quality grade or lot reference.' : 'Record a harvest first, then return here to publish one of your available lots. No sample inventory is displayed.'}</p>
                <button type="button" onClick={() => router.push('/farmer/harvest')} className="sell-soft-button mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold"><Sprout className="h-4 w-4" /> Record harvest</button>
              </div>
            ) : filteredLots.map((lot) => {
              const available = Number(lot.available_quantity ?? lot.quantity_kg ?? lot.quantity ?? 0);
              const isSelected = lot.id === selectedLotId;
              const cropName = lot.crop_name?.trim() || resolvedCropNames[lot.id] || (lot.crop_id ? 'Resolving crop name…' : 'Unnamed crop');
              return <button key={lot.id} type="button" onClick={() => { setSelectedLotId(lot.id); setMessage(''); }} aria-pressed={isSelected} className="sell-lot-card flex w-full min-w-0 items-center gap-3 rounded-2xl p-3 text-left sm:gap-3.5 sm:p-3.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-100/80">
                  {isSelected && <span className="h-2.5 w-2.5 rounded-full bg-teal-300 shadow-[0_0_12px_rgba(45,212,191,.8)]" />}
                </span>
                <span className="sell-crop-art flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold text-emerald-50">{cropEmoji(cropName)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-extrabold text-white">{cropName}</span>
                  <span className="mt-1 block text-xs font-bold text-teal-200">{available.toLocaleString('en-IN')} {lot.unit || 'kg'} available</span>
                  <span className="mt-1 block truncate font-mono text-[10px] text-emerald-50/50">Lot {lot.id.slice(0, 8).toUpperCase()}</span>
                </span>
                <span className={`hidden shrink-0 rounded-lg border px-2 py-1.5 text-[10px] font-bold sm:inline-flex ${String(lot.quality_grade || '').toLowerCase().includes('b') ? 'border-amber-300/30 bg-amber-400/10 text-amber-200' : 'border-emerald-300/25 bg-emerald-400/10 text-emerald-100'}`}>{lot.quality_grade || 'Grade not set'}</span>
                <span className="hidden shrink-0 rounded-lg border border-white/10 bg-black/20 px-2 py-1.5 font-mono text-[10px] text-emerald-50/70 md:inline-flex">{lot.status || 'available'}</span>
              </button>;
            })}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-emerald-50/60">
            <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-teal-200" /> Only your available, unlisted lots</span>
            <span className="font-semibold">{filteredLots.length} {filteredLots.length === 1 ? 'lot' : 'lots'}</span>
          </div>
        </GlassPanel>

        <div className="min-w-0 space-y-5">
          <GlassPanel className="p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-teal-300/25 bg-teal-300/10 text-teal-200"><Package className="h-5 w-5" /></div><div><h2 className="!text-lg font-extrabold text-white">Selected produce</h2><p className="mt-1 text-xs text-emerald-50/60">Review your lot before publishing</p></div></div>
              {selectedLot && <span className="rounded-xl border border-teal-200/30 bg-teal-400/10 px-3 py-2 text-xs font-bold text-teal-100">{selectedLot.quality_grade || 'Quality not set'}</span>}
            </div>

            {!selectedLot ? <div className="mt-5 rounded-2xl border border-dashed border-white/15 p-6 text-center text-sm text-emerald-50/65">Select an available lot from the stock list to see its details.</div> : (
              <div className="sell-glass-subpanel mt-4 flex items-center gap-3 rounded-2xl p-3.5">
                <div className="sell-crop-art flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-3xl" role="img" aria-label={`${cropForSelected} crop icon`}>{cropEmoji(cropForSelected)}</div>
                <div className="min-w-0 flex-1"><h3 className="truncate !text-base font-extrabold text-white">{cropForSelected}</h3><p className="mt-1 text-xs text-teal-200">{selectedAvailable.toLocaleString('en-IN')} {selectedUnit} available</p><p className="mt-1 truncate font-mono text-[10px] text-emerald-50/55">Lot {selectedLot.id.toUpperCase()}</p></div>
                <Leaf className="h-5 w-5 shrink-0 text-teal-200/70" />
              </div>
            )}

            <div className="my-5 h-px bg-gradient-to-r from-transparent via-emerald-100/20 to-transparent" />
            <div className="mb-4 flex items-center gap-2"><Tag className="h-4 w-4 text-teal-200" /><h3 className="!text-base font-extrabold text-white">Listing details</h3></div>

            <form onSubmit={handleCreateListing} className="space-y-4">
              <div>
                <label htmlFor="sell-asking-price" className="sell-label">Asking price (₹ per kg) <span className="text-teal-200">*</span></label>
                <div className="relative"><span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-extrabold text-teal-100">₹</span><input id="sell-asking-price" type="number" min="0.01" step="0.01" required disabled={!selectedLot || submitting} value={askingPrice} onChange={(event) => setAskingPrice(event.target.value)} placeholder={comparison ? comparison.medianPerKg.toFixed(2) : 'Enter your asking price'} className="sell-input !pl-10 !font-bold" /></div>
                <p className="mt-2 sell-caption">Set your price against the available mandi reference. This is your own asking price, not an automatic quote.</p>
              </div>
              <div>
                <label htmlFor="sell-grade" className="sell-label">Quality grade</label>
                <div id="sell-grade" className="sell-glass-subpanel flex items-center gap-3 rounded-xl px-3.5 py-3"><Leaf className="h-4 w-4 shrink-0 text-teal-200" /><span className="flex-1 text-sm font-bold text-white">{selectedLot?.quality_grade || 'Not specified in inventory'}</span><span className="text-[10px] text-emerald-50/55">From your lot</span></div>
              </div>
              <div>
                <label htmlFor="sell-harvest-date" className="sell-label">Harvest date</label>
                <div className="sell-glass-subpanel flex items-center gap-3 rounded-xl px-3.5 py-2.5"><CalendarDays className="h-4 w-4 shrink-0 text-teal-200" /><input id="sell-harvest-date" type="date" value={harvestDate} readOnly className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none [color-scheme:dark]" aria-describedby="sell-harvest-help" /></div>
                <p id="sell-harvest-help" className="mt-2 sell-caption">This date comes from the saved harvest lot and is read-only here.</p>
              </div>

              <section className="sell-glass-subpanel space-y-3 rounded-2xl p-4" aria-live="polite">
                <div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-xl border border-teal-200/20 bg-teal-200/10 text-teal-200"><BarChart3 className="h-4 w-4" /></div><div><h3 className="!text-sm font-extrabold text-white">AgriMark AI · Mandi price insights</h3><p className="mt-0.5 text-[10px] text-emerald-50/55">Observed data only · reference, not a guaranteed offer</p></div></div>
                {priceLoading && <p className="flex items-center gap-2 text-xs text-emerald-50/80"><RefreshCw className="h-4 w-4 animate-spin text-teal-200" /> Checking official mandi records…</p>}
                {priceError && <p className="flex items-start gap-2 text-xs leading-5 text-amber-100"><Info className="mt-0.5 h-4 w-4 shrink-0" />{priceError}</p>}
                {comparison && <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-xl border border-teal-100/10 bg-black/20 p-2.5"><p className="text-[10px] text-emerald-50/60">Observed median</p><p className="mt-1 break-words text-sm font-extrabold text-teal-200">{money(comparison.medianPerKg)}</p><p className="text-[10px] text-emerald-50/50">per kg</p></div>
                    <div className="rounded-xl border border-white/10 bg-black/20 p-2.5"><p className="text-[10px] text-emerald-50/60">Observed low</p><p className="mt-1 break-words text-sm font-bold text-white">{money(comparison.lowPerKg)}</p><p className="text-[10px] text-emerald-50/50">per kg</p></div>
                    <div className="rounded-xl border border-white/10 bg-black/20 p-2.5"><p className="text-[10px] text-emerald-50/60">Observed high</p><p className="mt-1 break-words text-sm font-bold text-white">{money(comparison.highPerKg)}</p><p className="text-[10px] text-emerald-50/50">per kg</p></div>
                  </div>
                  {priceDifference !== null && Number.isFinite(priceDifference) && <p className="flex items-center gap-2 text-xs text-emerald-50/80"><TrendingUp className="h-4 w-4 shrink-0 text-teal-200" />Your asking price is <strong className={priceDifference > 0 ? 'text-amber-200' : 'text-teal-200'}>{Math.abs(priceDifference).toFixed(1)}% {priceDifference > 0 ? 'above' : priceDifference < 0 ? 'below' : 'at'}</strong> the observed median.</p>}
                  <div className="rounded-xl border border-white/10 bg-black/20 p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-emerald-50/55">AI analysis</p>{aiLoading ? <p className="mt-1 text-xs text-emerald-50/75">Analysing the observed prices…</p> : <p className="mt-1 text-xs leading-5 text-emerald-50/85">{aiAdvice || 'Compare your asking price with this observed reference and consider quality, location and logistics.'}</p>}<button type="button" onClick={() => void analyzeAskingPrice()} disabled={aiLoading || !askingPrice || asking <= 0} className="sell-soft-button mt-3 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold disabled:opacity-40"><Sparkles className="h-3.5 w-3.5" /> Analyze my asking price</button></div>
                  <p className="text-[10px] leading-4 text-emerald-50/45">Based on {comparison.observations} stored mandi observations · Latest: {formatDate(comparison.latestDate)} · {comparison.source} · prices shown in ₹/kg.</p>
                </div>}
                {!comparison && !priceLoading && !priceError && <p className="text-xs leading-5 text-emerald-50/65">Select a lot to check whether stored official mandi observations are available for its crop.</p>}
              </section>

              <button type="submit" disabled={submitting || loading || !selectedLot} className="sell-primary-button inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-extrabold">
                {submitting ? <RefreshCw className="h-5 w-5 animate-spin" /> : <ShoppingCart className="h-5 w-5" />}{submitting ? 'Publishing listing…' : 'List Produce'}
              </button>
              <p className="text-center text-[10px] leading-5 text-emerald-50/50">Publishing creates a real marketplace listing from this lot. The selected lot’s available quantity and grade remain sourced from your saved inventory.</p>
            </form>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}

export default function SellProducePage() {
  const { t } = useI18n();
  return (
    <Suspense fallback={<div className="mx-auto max-w-[1500px] animate-pulse rounded-3xl border border-emerald-200/15 bg-white/5 p-8 text-sm text-emerald-50/70">{t('loading')}</div>}>
      <SellForm />
    </Suspense>
  );
}
