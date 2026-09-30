'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, ClipboardList, PackageCheck, Plus, RefreshCw, ShieldCheck, Sprout, Warehouse } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import type { Farm, ProduceLot } from '@/types';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

type CropOption = { id: string; name: string; category?: string | null };
type HarvestRow = {
  id: string;
  cultivation_id: string;
  harvest_date: string;
  total_quantity_kg: number;
  quality_grade: string;
  trace_code: string;
};

const gradeOptions = ['Grade A', 'Grade B', 'Grade C', 'Export Quality'];

export default function HarvestPage() {
  const { user } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [cultivations, setCultivations] = useState<any[]>([]);
  const [crops, setCrops] = useState<CropOption[]>([]);
  const [harvests, setHarvests] = useState<HarvestRow[]>([]);
  const [lots, setLots] = useState<ProduceLot[]>([]);
  const [farmId, setFarmId] = useState('');
  const [cultivationId, setCultivationId] = useState('');
  const [cropId, setCropId] = useState('');
  const [quantityKg, setQuantityKg] = useState('');
  const [qualityGrade, setQualityGrade] = useState('Grade A');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().slice(0, 10));
  const [packagingType, setPackagingType] = useState('Jute Bags');
  const [storageRequired, setStorageRequired] = useState(false);
  const [moisturePct, setMoisturePct] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [loadError, setLoadError] = useState('');

  const load = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError('');
    try {
      const [farmsRes, cultRes, cropsRes, harvestRes, lotsRes] = await Promise.all([
        api.getFarms(user.id),
        api.getCultivations(),
        api.getCrops(),
        api.getHarvestBatches(),
        api.getProduceLots(),
      ]);
      setFarms(farmsRes);
      setCultivations(cultRes);
      setCrops(cropsRes.items || []);
      setHarvests(harvestRes || []);
      setLots(lotsRes || []);

      const firstFarm = farmsRes[0];
      if (!farmId && firstFarm?.id) setFarmId(firstFarm.id);
      const firstCultivation = (cultRes || []).find((c: any) => !firstFarm?.id || c.farm_id === firstFarm.id) || cultRes?.[0];
      if (!cultivationId && firstCultivation?.id) {
        setCultivationId(firstCultivation.id);
        if (firstCultivation.crop_id) setCropId(firstCultivation.crop_id);
      }
      if (!cropId && cropsRes.items?.[0]?.id) setCropId(cropsRes.items[0].id);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load your harvest workspace.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [user?.id]);

  useEffect(() => {
    const selected = farmCultivations.find((c: any) => c.id === cultivationId);
    if (selected?.crop_id) setCropId(selected.crop_id);
  }, [cultivationId, farmCultivations]);

  const farmCultivations = useMemo(
    () => cultivations.filter((c: any) => !farmId || c.farm_id === farmId),
    [cultivations, farmId],
  );

  useEffect(() => {
    if (!cultivationId && farmCultivations[0]?.id) {
      setCultivationId(farmCultivations[0].id);
      if (farmCultivations[0].crop_id) setCropId(farmCultivations[0].crop_id);
    }
  }, [farmCultivations, cultivationId]);

  const selectedCrop = crops.find((c) => c.id === cropId);
  const selectedCultivation = farmCultivations.find((c: any) => c.id === cultivationId);
  const stockKg = lots.reduce((sum, lot) => sum + Number(lot.available_quantity ?? lot.quantity ?? 0), 0);
  const reservedKg = lots
    .filter((lot) => lot.status === 'reserved')
    .reduce((sum, lot) => sum + Number(lot.available_quantity ?? lot.quantity ?? 0), 0);
  const activeLots = lots.filter((lot) => (lot.status || 'available') === 'available').length;

  const recordHarvest = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user?.id) {
      setNotice({ kind: 'error', text: 'Please sign in as a farmer before recording a harvest.' });
      return;
    }

    const quantity = Number(quantityKg);
    const moisture = moisturePct ? Number(moisturePct) : undefined;
    if (!farmId || !cultivationId || !cropId) {
      setNotice({ kind: 'error', text: 'Select a farm, cultivation and crop before saving.' });
      return;
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setNotice({ kind: 'error', text: 'Harvest quantity must be greater than 0 kg.' });
      return;
    }
    if (moisture !== undefined && (!Number.isFinite(moisture) || moisture < 0 || moisture > 100)) {
      setNotice({ kind: 'error', text: 'Moisture must be between 0% and 100%.' });
      return;
    }

    setSubmitting(true);
    setNotice(null);
    try {
      const harvest = await api.createHarvestBatch({
        cultivation_id: cultivationId,
        harvest_date: harvestDate,
        total_quantity_kg: quantity,
        quality_grade: qualityGrade,
        packaging_type: packagingType,
        storage_required: storageRequired,
        moisture_pct: moisture,
        notes,
      } as any);

      if (!harvest?.id) throw new Error('The harvest batch was not created.');

      const lot = await api.createProduceLot({
        harvest_batch_id: harvest.id,
        cultivation_id: cultivationId,
        crop_id: cropId,
        quantity,
        unit: 'kg',
        quality_grade: qualityGrade,
        available_quantity: quantity,
        status: 'available',
        harvested_at: harvestDate,
      });

      if (!lot?.id) throw new Error('The produce lot was not created.');

      setQuantityKg('');
      setMoisturePct('');
      setNotes('');
      setNotice({
        kind: 'success',
        text: 'Harvest recorded. The traceable produce lot is now available in Produce Stock.',
      });
      await load();
    } catch (error) {
      setNotice({
        kind: 'error',
        text: error instanceof Error ? error.message : 'Unable to record harvest.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['farmer', 'fpo', 'admin']}>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[28px] border border-[#24382e] bg-[#07110d] shadow-[0_24px_90px_rgba(0,0,0,0.32)]">
          <div className="relative p-6 md:p-8">
            <div className="pointer-events-none absolute inset-0 tech-grid opacity-30" />
            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#3e7b54]/60 bg-[#1b4d3e]/30 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#9bc7a2]">
                  <Sprout className="h-3.5 w-3.5" /> Harvest Operations
                </div>
                <h1 className="mt-4 text-3xl font-black tracking-tight text-[#f7f5ee] md:text-5xl">Harvest & Produce Lots</h1>
                <p className="mt-3 text-sm leading-6 text-[#adbdb2]">
                  Capture the harvest event once, generate a traceable lot, and keep stock ready for storage or marketplace listing.
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/farmer/sell" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-[#3e7b54] bg-[#0e1712] px-4 text-sm font-bold text-[#f7f5ee]">
                  Sell a lot
                </Link>
                <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-[#2a3b32] bg-[#07110d] px-4 text-sm font-bold text-[#f7f5ee]">
                  <RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} /> Refresh
                </button>
              </div>
            </div>
          </div>
        </section>

        {notice && (
          <div className={notice.kind === 'success'
            ? 'flex items-center gap-3 rounded-2xl border border-emerald-800/60 bg-emerald-950/30 p-4 text-sm text-emerald-200'
            : 'flex items-center gap-3 rounded-2xl border border-rose-900/60 bg-rose-950/25 p-4 text-sm text-rose-200'}>
            {notice.kind === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            {notice.text}
          </div>
        )}

        {loadError && (
          <div className="rounded-2xl border border-amber-800/50 bg-amber-950/20 p-4 text-sm text-amber-200">{loadError}</div>
        )}

        <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            { label: 'Total produce stock', value: `${(stockKg / 1000).toFixed(2)} t`, icon: PackageCheck },
            { label: 'Available lots', value: String(activeLots), icon: ClipboardList },
            { label: 'Reserved / escrow-linked', value: `${(reservedKg / 1000).toFixed(2)} t`, icon: ShieldCheck },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-[#0e1712] p-5">
              <div className="flex items-center justify-between text-xs font-semibold text-[#adbdb2]">
                <span>{label}</span><Icon className="h-4 w-4 text-[#52a67a]" />
              </div>
              <div className="mt-3 text-3xl font-black text-[#f7f5ee]">{loading ? '—' : value}</div>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[22px] border border-white/10 bg-[#0e1712] p-5 md:p-6">
            <div className="mb-5 flex items-center gap-2">
              <Plus className="h-5 w-5 text-[#e5a93c]" />
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#e5a93c]">Record event</p>
                <h2 className="text-xl font-bold text-[#f7f5ee]">Create harvest lot</h2>
              </div>
            </div>

            <form onSubmit={recordHarvest} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-[#70887a]">Farm</label>
                <select value={farmId} onChange={(e) => { setFarmId(e.target.value); setCultivationId(''); }} required disabled={!farms.length} className="min-h-12 w-full rounded-xl border border-[#2a3b32] bg-[#07110d] px-4 text-sm text-[#f7f5ee]">
                  <option value="">{farms.length ? 'Select a farm' : 'No farm registered'}</option>
                  {farms.map((farm) => <option key={farm.id} value={farm.id}>{farm.name || 'Farm'} · {farm.village || farm.district || 'Location not set'}</option>)}
                </select>
                {!farms.length && <Link href="/farmer/farms" className="mt-2 inline-block text-xs text-[#52a67a] underline">Register your farm first</Link>}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-[#70887a]">Cultivation</label>
                <select value={cultivationId} onChange={(e) => { setCultivationId(e.target.value); const c = farmCultivations.find((row: any) => row.id === e.target.value); if (c?.crop_id) setCropId(c.crop_id); }} required disabled={!farmCultivations.length} className="min-h-12 w-full rounded-xl border border-[#2a3b32] bg-[#07110d] px-4 text-sm text-[#f7f5ee]">
                  <option value="">{farmCultivations.length ? 'Select a cultivation' : 'No cultivation linked to this farm'}</option>
                  {farmCultivations.map((cult: any) => <option key={cult.id} value={cult.id}>{cult.crop_name || 'Crop'} · {cult.variety || 'Variety not set'} · {cult.area_acres || 0} ac</option>)}
                </select>
                {!farmCultivations.length && farmId && <Link href="/farmer/crops" className="mt-2 inline-block text-xs text-[#52a67a] underline">Create a cultivation plan</Link>}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-[#70887a]">Crop</label>
                <select value={cropId} onChange={(e) => setCropId(e.target.value)} required disabled={!crops.length} className="min-h-12 w-full rounded-xl border border-[#2a3b32] bg-[#07110d] px-4 text-sm text-[#f7f5ee]">
                  <option value="">Select a crop</option>
                  {crops.map((crop) => <option key={crop.id} value={crop.id}>{crop.name}{crop.category ? ` · ${crop.category}` : ''}</option>)}
                </select>
                {selectedCrop && <p className="mt-2 text-[11px] text-[#70887a]">Linked crop: <span className="text-[#adbdb2]">{selectedCrop.name}</span></p>}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-[#70887a]">Harvest quantity (kg)</label>
                  <input type="number" min="0.1" step="0.1" required value={quantityKg} onChange={(e) => setQuantityKg(e.target.value)} placeholder="500" className="min-h-12 w-full rounded-xl border border-[#2a3b32] bg-[#07110d] px-4 text-sm text-[#f7f5ee]" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-[#70887a]">Harvest date</label>
                  <input type="date" required value={harvestDate} onChange={(e) => setHarvestDate(e.target.value)} className="min-h-12 w-full rounded-xl border border-[#2a3b32] bg-[#07110d] px-4 text-sm text-[#f7f5ee]" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-[#70887a]">Quality grade</label>
                  <select value={qualityGrade} onChange={(e) => setQualityGrade(e.target.value)} className="min-h-12 w-full rounded-xl border border-[#2a3b32] bg-[#07110d] px-4 text-sm text-[#f7f5ee]">
                    {gradeOptions.map((grade) => <option key={grade}>{grade}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-[#70887a]">Moisture % <span className="normal-case text-[#596d61]">(optional)</span></label>
                  <input type="number" min="0" max="100" step="0.1" value={moisturePct} onChange={(e) => setMoisturePct(e.target.value)} placeholder="12.5" className="min-h-12 w-full rounded-xl border border-[#2a3b32] bg-[#07110d] px-4 text-sm text-[#f7f5ee]" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-[#70887a]">Packaging</label>
                <select value={packagingType} onChange={(e) => setPackagingType(e.target.value)} className="min-h-12 w-full rounded-xl border border-[#2a3b32] bg-[#07110d] px-4 text-sm text-[#f7f5ee]">
                  <option>Jute Bags</option><option>PP Bags</option><option>Crates</option><option>Bulk</option><option>Other</option>
                </select>
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-[#26372f] bg-[#07110d] p-4 text-sm text-[#adbdb2]">
                <input type="checkbox" checked={storageRequired} onChange={(e) => setStorageRequired(e.target.checked)} className="h-4 w-4" />
                Need storage / cold-chain handling after harvest
              </label>

              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Field notes, sorting observations, storage instructions..." className="w-full rounded-xl border border-[#2a3b32] bg-[#07110d] px-4 py-3 text-sm text-[#f7f5ee]" />

              <button type="submit" disabled={submitting || loading || !farms.length || !farmCultivations.length || !cropId} className="min-h-12 w-full rounded-xl bg-[#e5a93c] px-4 text-sm font-black text-[#19201d] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40">
                {submitting ? 'Recording harvest…' : 'Record Harvest & Generate Traceable Lot'}
              </button>
            </form>
          </div>

          <div className="rounded-[22px] border border-white/10 bg-[#0e1712] p-5 md:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#3e7b54]">Traceability ledger</p>
                <h2 className="mt-1 text-xl font-bold text-[#f7f5ee]">Harvest history & lots</h2>
              </div>
              <Link href="/farmer/sell" className="inline-flex items-center gap-2 text-xs font-semibold text-[#52a67a]">Continue to selling <Warehouse className="h-3.5 w-3.5" /></Link>
            </div>

            <div className="mt-5 space-y-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-[#07110d]" />)
              ) : harvests.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#2a3b32] p-10 text-center text-sm text-[#70887a]">
                  <ClipboardList className="mx-auto mb-3 h-8 w-8 text-[#3e7b54]" />
                  <p>No harvest events have been recorded for this account.</p>
                  <p className="mt-1 text-xs text-[#596d61]">Use the form to create the first traceable lot.</p>
                </div>
              ) : (
                harvests.map((harvest) => {
                  const linkedLot = lots.find((lot) => lot.harvest_batch_id === harvest.id || (lot.cultivation_id === harvest.cultivation_id && lot.harvested_at === harvest.harvest_date));
                  const quantity = Number(linkedLot?.quantity ?? linkedLot?.quantity_kg ?? harvest.total_quantity_kg ?? 0);
                  const available = Number(linkedLot?.available_quantity ?? quantity);
                  const cultivation = cultivations.find((c: any) => c.id === harvest.cultivation_id);
                  return (
                    <article key={harvest.id} className="rounded-2xl border border-[#26372f] bg-[#07110d] p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-[#e5a93c]">Lot {linkedLot?.id?.slice(0, 8) || harvest.id.slice(0, 8)}</h3>
                            <span className="rounded-full border border-[#3e7b54]/70 bg-[#1b4d3e]/30 px-2.5 py-1 text-[10px] font-mono font-bold uppercase text-[#9bc7a2]">{linkedLot?.status || 'available'}</span>
                          </div>
                          <p className="mt-1 text-xs text-[#52a67a]">{cultivation?.crop_name || linkedLot?.crop_name || 'Crop'} · {cultivation?.variety || 'Traceable harvest'}</p>
                        </div>
                        <div className="text-xs text-[#596d61]">{harvest.harvest_date}</div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                        <div><p className="text-[10px] uppercase text-[#596d61]">Quantity</p><p className="mt-1 font-bold text-[#f7f5ee]">{quantity.toLocaleString()} kg</p></div>
                        <div><p className="text-[10px] uppercase text-[#596d61]">Available</p><p className="mt-1 font-bold text-[#52a67a]">{available.toLocaleString()} kg</p></div>
                        <div><p className="text-[10px] uppercase text-[#596d61]">Quality</p><p className="mt-1 font-bold text-[#f7f5ee]">{harvest.quality_grade || '—'}</p></div>
                        <div><p className="text-[10px] uppercase text-[#596d61]">Trace code</p><p className="mt-1 break-all font-mono text-xs text-[#adbdb2]">{harvest.trace_code || '—'}</p></div>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-3 text-xs text-[#70887a]">
                        <span>Harvest batch: {harvest.id}</span>
                        <span>Listed: {linkedLot?.is_listed ? 'Yes' : 'No'}</span>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
}
