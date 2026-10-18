'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { getSupabaseClient } from '@/lib/supabase';
import { ProduceLot } from '@/types';
import { ShoppingCart, CheckCircle2, AlertCircle, Sparkles, TrendingUp, Info, RefreshCw } from 'lucide-react';

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

function SellForm() {
  const { t } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [lots, setLots] = useState<ProduceLot[]>([]);
  const [selectedLotId, setSelectedLotId] = useState(searchParams.get('lot_id') || '');
  const [askingPrice, setAskingPrice] = useState('');
  const [minOrderQty, setMinOrderQty] = useState('50');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [priceLoading, setPriceLoading] = useState(false);
  const [comparison, setComparison] = useState<PriceComparison | null>(null);
  const [priceError, setPriceError] = useState('');
  const [aiAdvice, setAiAdvice] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const fetchLots = useCallback(async () => {
    try {
      const res = await api.getProduceLots();
      const unlisted = res.filter((l) => !l.is_listed && (l.status ?? 'available') === 'available');
      setLots(unlisted);
      setSelectedLotId((current) => current || unlisted[0]?.id || '');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    void fetchLots();
  }, [user?.id, fetchLots]);

  const selectedLot = lots.find((l) => l.id === selectedLotId);

  // Use actual stored mandi observations only. No demo or invented prices are shown.
  useEffect(() => {
    let cancelled = false;
    async function loadComparablePrices() {
      setComparison(null);
      setPriceError('');
      setAiAdvice('');
      if (!selectedLot) return;
      const cropName = selectedLot.crop_name?.trim();
      if (!cropName) {
        setPriceError('This produce lot has no crop name, so AgriMark cannot safely match it to mandi records.');
        return;
      }
      setPriceLoading(true);
      try {
        const supabase = getSupabaseClient();
        const { data: commodities, error: commodityError } = await supabase
          .from('national_commodities')
          .select('code,name')
          .limit(2000);
        if (commodityError) throw commodityError;
        const normalizedCrop = normalizeName(cropName);
        const commodity = (commodities || []).find((item: any) => normalizeName(String(item.name || '')) === normalizedCrop)
          || (commodities || []).find((item: any) => {
            const name = normalizeName(String(item.name || ''));
            return name.length >= 4 && (name.includes(normalizedCrop) || normalizedCrop.includes(name));
          });
        if (!commodity) {
          if (!cancelled) setPriceError(`No official mandi commodity mapping was found for ${cropName}. You can still enter your own asking price.`);
          return;
        }
        const { data: rows, error: observationError } = await supabase
          .from('national_market_price_observations')
          .select('modal_price,min_price,max_price,observation_date,source,unit')
          .eq('commodity_code', commodity.code)
          .gt('modal_price', 0)
          .order('observation_date', { ascending: false })
          .limit(100);
        if (observationError) throw observationError;
        const validRows = (rows || []).filter((row: any) => Number(row.modal_price) > 0);
        if (!validRows.length) {
          if (!cancelled) setPriceError(`No official price observations are available for ${cropName} yet. AgriMark will not guess a comparison price.`);
          return;
        }
        const perKg = (row: any, field: string) => {
          const value = Number(row[field] ?? row.modal_price);
          const unit = String(row.unit || 'INR_PER_QUINTAL').toUpperCase();
          return unit.includes('QUINTAL') ? value / 100 : unit.includes('KG') ? value : value / 100;
        };
        const modalValues = validRows.map((row: any) => perKg(row, 'modal_price')).filter((v: number) => v > 0);
        const lowValues = validRows.map((row: any) => perKg(row, 'min_price')).filter((v: number) => v > 0);
        const highValues = validRows.map((row: any) => perKg(row, 'max_price')).filter((v: number) => v > 0);
        const latestDate = String(validRows[0]?.observation_date || '').slice(0, 10);
        const result: PriceComparison = {
          commodity: String(commodity.name || cropName),
          medianPerKg: median(modalValues),
          lowPerKg: lowValues.length ? Math.min(...lowValues) : median(modalValues),
          highPerKg: highValues.length ? Math.max(...highValues) : median(modalValues),
          observations: validRows.length,
          latestDate,
          source: String(validRows[0]?.source || 'Stored mandi observations'),
          unitLabel: '₹/kg',
        };
        if (!cancelled) {
          setComparison(result);
          setAiLoading(true);
          try {
            const asking = Number(askingPrice);
            const priceContext = [
              'You are AgriMark AI helping an Indian farmer price a produce listing.',
              'Use only the verified market figures below. Do not invent prices, market facts, or a forecast.',
              `Crop: ${result.commodity}; quality grade: ${selectedLot.quality_grade || 'not specified'}.`,
              `Official mandi records found: ${result.observations}; latest observation date: ${result.latestDate || 'not provided'}; source label: ${result.source}.`,
              `Observed modal-price median: ₹${result.medianPerKg.toFixed(2)}/kg.`,
              `Observed min/max range across returned records: ₹${result.lowPerKg.toFixed(2)}–₹${result.highPerKg.toFixed(2)}/kg.`,
              Number.isFinite(asking) && asking > 0 ? `Farmer's asking price: ₹${asking.toFixed(2)}/kg.` : 'Farmer has not entered an asking price yet.',
              'In 2-4 short sentences, compare the asking price to the observed reference, mention that quality, transport, and local mandi can change the final price, and clearly say this is a reference not a guaranteed sale price. If asking price is not entered, give guidance for choosing a price around the reference without making a new numeric estimate.',
            ].join('\n');
            const advice = await api.askAgriAI(priceContext, 'PRICE_COMPARISON_FROM_OFFICIAL_MANDI_OBSERVATIONS');
            if (!cancelled) setAiAdvice(advice.answer || '');
          } catch {
            if (!cancelled) setAiAdvice('Use the observed modal-price median as a comparison point. Actual buyer offers can differ with quality, location, transport and demand.');
          } finally {
            if (!cancelled) setAiLoading(false);
          }
        }
      } catch (error) {
        if (!cancelled) setPriceError(error instanceof Error ? error.message : 'Could not load comparable mandi prices.');
      } finally {
        if (!cancelled) setPriceLoading(false);
      }
    }
    void loadComparablePrices();
    return () => { cancelled = true; };
  }, [selectedLotId, selectedLot?.id, selectedLot?.crop_name, selectedLot?.quality_grade]);

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLot) {
      setMessage('Error: Please select a valid produce lot.');
      return;
    }
    const unitPrice = Number(askingPrice);
    const minimum = Number(minOrderQty);
    if (!Number.isFinite(unitPrice) || unitPrice <= 0 || !Number.isFinite(minimum) || minimum <= 0) {
      setMessage('Error: Enter a price greater than zero and a valid minimum order quantity.');
      return;
    }
    setSubmitting(true);
    setMessage('');
    try {
      await api.createListing({
        lot_id: selectedLot.id,
        title: selectedLot.crop_name || (selectedLot.quality_grade ? `${selectedLot.quality_grade} produce lot` : 'Produce lot'),
        price_per_unit: unitPrice,
        currency: 'INR',
        min_order_quantity: minimum,
      });
      setMessage('Listing published to AgriMark Marketplace!');
      setTimeout(() => router.push('/buyer/marketplace'), 1200);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const asking = Number(askingPrice);
  const priceDifference = comparison && asking > 0 && comparison.medianPerKg > 0
    ? ((asking - comparison.medianPerKg) / comparison.medianPerKg) * 100
    : null;

  const analyzeAskingPrice = async () => {
    if (!comparison || !selectedLot || !Number.isFinite(asking) || asking <= 0) return;
    setAiLoading(true);
    try {
      const context = [
        'You are AgriMark AI. Compare a farmer\'s proposed agricultural produce selling price with the official mandi observations provided below.',
        'Use only these figures. Do not invent data or promise a sale. Mention that grade, location, transport, and buyer demand affect realized price.',
        `Crop: ${comparison.commodity}; quality: ${selectedLot.quality_grade || 'not specified'}.`,
        `Farmer asking price: ₹${asking.toFixed(2)}/kg.`,
        `Observed modal median: ₹${comparison.medianPerKg.toFixed(2)}/kg; observed low: ₹${comparison.lowPerKg.toFixed(2)}/kg; observed high: ₹${comparison.highPerKg.toFixed(2)}/kg.`,
        `Records: ${comparison.observations}; latest observation: ${comparison.latestDate || 'unknown'}; source: ${comparison.source}.`,
        'In 2-4 concise sentences, say whether the asking price is above, below, or near the observed median and give a cautious practical interpretation. Do not recommend a new unsupported exact price.',
      ].join('\\n');
      const result = await api.askAgriAI(context, 'PRICE_COMPARISON_FROM_OFFICIAL_MANDI_OBSERVATIONS');
      setAiAdvice(result.answer || 'Compare your asking price with the observed median and account for quality, location and transport costs.');
    } catch {
      setAiAdvice('Your price comparison is shown above. Consider quality, location, transport costs and current buyer demand before publishing.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="bg-[#121a16] border border-[#1e2d26] p-6 rounded-2xl shadow-md space-y-5">
      {message && <div className={`p-4 rounded-xl text-sm flex items-center gap-2 ${message.startsWith('Error') ? 'bg-red-950/60 border border-red-800 text-red-300' : 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'}`}>{message.startsWith('Error') ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}<span>{message}</span></div>}
      {loading ? <p className="text-sm text-gray-400">{t('loading')}</p> : lots.length === 0 ? (
        <div className="p-6 bg-[#0a0f0d] border border-dashed border-[#1e2d26] rounded-xl text-center space-y-3 text-gray-400"><p>No available unlisted produce lots found.</p><p className="text-xs">Record a harvest first before creating a marketplace listing.</p><button type="button" onClick={() => router.push('/farmer/harvest')} className="px-4 py-2 bg-amber-600 text-white font-bold text-xs rounded-lg">+ Go Record Harvest</button></div>
      ) : (
        <form onSubmit={handleCreateListing} className="space-y-5">
          <div><label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Select Available Produce Lot</label><select value={selectedLotId} onChange={(e) => setSelectedLotId(e.target.value)} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white">{lots.map((lot) => <option key={lot.id} value={lot.id}>{lot.crop_name || 'Crop'} — {lot.quantity_kg ?? lot.quantity} KG ({lot.quality_grade || 'Standard quality'})</option>)}</select></div>
          {selectedLot && <div className="p-3 bg-[#0a0f0d] border border-emerald-950 rounded-xl text-xs text-emerald-300 space-y-1 font-mono"><p><strong>Lot ID:</strong> {selectedLot.id}</p><p><strong>Crop:</strong> {selectedLot.crop_name || 'Not specified'}</p><p><strong>Quantity:</strong> {selectedLot.quantity_kg ?? selectedLot.quantity} KG</p><p><strong>Quality:</strong> {selectedLot.quality_grade || 'Not specified'}</p></div>}

          <section className="rounded-2xl border border-emerald-500/25 bg-emerald-950/20 p-4 space-y-3" aria-live="polite">
            <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-emerald-300" /><h2 className="font-bold text-white">AgriMark AI · Comparable mandi price</h2></div>
            <p className="text-xs text-gray-400">We compare your crop against saved mandi observations before you publish. Reference prices are not guaranteed buyer offers.</p>
            {priceLoading ? <p className="text-sm text-gray-300 flex items-center gap-2"><RefreshCw className="h-4 w-4 animate-spin" /> Checking official mandi records…</p> : null}
            {priceError ? <p className="text-sm text-amber-200 flex items-start gap-2"><Info className="h-4 w-4 mt-0.5 shrink-0" />{priceError}</p> : null}
            {comparison && <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="rounded-xl bg-[#0a0f0d] p-3"><p className="text-xs text-gray-400">Observed median</p><p className="mt-1 text-lg font-bold text-emerald-300">{money(comparison.medianPerKg)}/kg</p></div>
                <div className="rounded-xl bg-[#0a0f0d] p-3"><p className="text-xs text-gray-400">Observed low</p><p className="mt-1 text-lg font-bold text-white">{money(comparison.lowPerKg)}/kg</p></div>
                <div className="rounded-xl bg-[#0a0f0d] p-3"><p className="text-xs text-gray-400">Observed high</p><p className="mt-1 text-lg font-bold text-white">{money(comparison.highPerKg)}/kg</p></div>
              </div>
              {priceDifference !== null && Number.isFinite(priceDifference) && <p className="text-sm text-gray-200 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-300" />Your asking price is <strong className={priceDifference > 0 ? 'text-amber-300' : 'text-emerald-300'}>{Math.abs(priceDifference).toFixed(1)}% {priceDifference > 0 ? 'above' : priceDifference < 0 ? 'below' : 'at'} </strong> the observed median.</p>}
              <div className="rounded-xl border border-white/10 bg-[#0a0f0d] p-3">
                <p className="text-xs text-gray-400">AI analysis</p>
                {aiLoading ? <p className="mt-1 text-sm text-gray-300">Analysing the observed prices…</p> : <p className="mt-1 text-sm leading-6 text-gray-200">{aiAdvice || 'Compare your asking price with the observed median and account for quality, location and transport costs.'}</p>}
                <button type="button" onClick={() => void analyzeAskingPrice()} disabled={aiLoading || !askingPrice || asking <= 0} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 px-3 py-2 text-xs font-semibold text-emerald-200 disabled:opacity-40"><Sparkles className="h-3.5 w-3.5" />Analyze my asking price</button>
              </div>
              <p className="text-[11px] text-gray-500">Based on {comparison.observations} stored mandi observations · Latest record: {comparison.latestDate || 'date unavailable'} · {comparison.source} · Reference shown in ₹/kg.</p>
            </div>}
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label className="block text-xs font-semibold uppercase text-gray-400 mb-1">{t('askingPrice')} (₹ / KG)</label><input type="number" min="0.01" step="0.01" required value={askingPrice} onChange={(e) => setAskingPrice(e.target.value)} placeholder={comparison ? comparison.medianPerKg.toFixed(2) : 'Enter your price'} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white" /></div><div><label className="block text-xs font-semibold uppercase text-gray-400 mb-1">{t('minOrderQty')} (KG)</label><input type="number" min="0.01" step="0.01" required value={minOrderQty} onChange={(e) => setMinOrderQty(e.target.value)} placeholder="50" className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white" /></div></div>
          <button type="submit" disabled={submitting} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-950 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"><ShoppingCart className="w-5 h-5" /><span>{submitting ? t('loading') : t('sellProduce')}</span></button>
        </form>
      )}
    </div>
  );
}

export default function SellProducePage() {
  const { t } = useI18n();
  return <div className="max-w-2xl mx-auto space-y-6"><div className="text-center"><h1 className="text-2xl font-bold text-gray-100">{t('sellProduce')}</h1><p className="text-sm text-gray-400">Publish your produce lot with transparent AI price guidance based on stored mandi observations.</p></div><Suspense fallback={<p className="text-sm text-gray-400 text-center py-6">{t('loading')}</p>}><SellForm /></Suspense></div>;
}
