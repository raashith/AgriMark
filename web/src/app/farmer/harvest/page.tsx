'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, ClipboardList, PackageCheck, Plus, RefreshCw, Sprout, Boxes, Weight, FileText, CalendarDays, Clock3, BarChart3, ArrowUpRight, Leaf } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { getSupabaseClient } from '@/lib/supabase';
import { Farm, ProduceLot } from '@/types';

type CropOption = { id: string; name: string; category?: string | null };

function StatCard({ icon, label, value, hint, tint }: { icon: React.ReactNode; label: string; value: React.ReactNode; hint: string; tint: 'emerald' | 'teal' | 'sky' | 'violet' }) {
  const tintClass = { emerald: 'text-emerald-300 bg-emerald-500/10', teal: 'text-teal-300 bg-teal-500/10', sky: 'text-sky-300 bg-sky-500/10', violet: 'text-violet-300 bg-violet-500/10' }[tint];
  return <div className="harvest-stat-card"><div className={'harvest-stat-icon ' + tintClass}>{icon}</div><div><p className="text-sm text-slate-300">{label}</p><p className="mt-1 text-3xl font-extrabold text-white">{value}</p><p className="mt-1 text-xs text-slate-500">{hint}</p></div></div>;
}

function EmptyHarvest({ profileId }: { profileId?: string }) {
  return <div className="flex min-h-[270px] flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-500/20 bg-emerald-950/10 px-5 py-10 text-center"><div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-300"><Boxes className="h-8 w-8" /></div><h3 className="text-base font-bold text-white">No harvest records yet</h3><p className="mt-2 max-w-sm text-sm text-slate-400">Start by saving your first harvest batch to track produce and generate traceable lots.</p>{profileId ? <a href="/farmer/farms" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-500"><Sprout className="h-4 w-4" /> Add your first harvest</a> : <a href="/auth/login" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-500">Sign in to record harvest</a>}</div>;
}
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
const DEMO_FARM: Farm = {
  id: '10000000-0000-0000-0000-000000000001',
  owner_id: '00000000-0000-0000-0000-000000000001',
  name: 'Green Valley Farm',
  village: 'Pallivasal',
  district: 'Kallakurichi',
  state: 'Tamil Nadu',
  area_acres: 6.5,
};
const DEMO_CROPS: CropOption[] = [
  { id: '1897d9a2-2c3b-4d3d-9b5e-f21ed78d0051', name: 'Maize', category: 'Cereal' },
  { id: 'fba3b635-a794-446d-b22a-9ff2f64d12ee', name: 'Groundnut', category: 'Oilseed' },
  { id: 'c923fb8b-5e2e-4cde-81f4-e1be8bcff588', name: 'Chilli', category: 'Spice' },
];
const DEMO_LOTS: ProduceLot[] = [
  { id: '30000000-0000-0000-0000-000000000001', owner_id: DEMO_FARM.owner_id, cultivation_id: '20000000-0000-0000-0000-000000000001', crop_id: DEMO_CROPS[0].id, crop_name: 'Maize', quantity: 1250, unit: 'kg', quality_grade: 'Grade A', available_quantity: 980, status: 'available', harvested_at: '2026-09-25' } as ProduceLot,
  { id: '30000000-0000-0000-0000-000000000002', owner_id: DEMO_FARM.owner_id, cultivation_id: '20000000-0000-0000-0000-000000000002', crop_id: DEMO_CROPS[1].id, crop_name: 'Groundnut', quantity: 860, unit: 'kg', quality_grade: 'Grade A', available_quantity: 620, status: 'available', harvested_at: '2026-09-30' } as ProduceLot,
  { id: '30000000-0000-0000-0000-000000000003', owner_id: DEMO_FARM.owner_id, cultivation_id: '20000000-0000-0000-0000-000000000003', crop_id: DEMO_CROPS[2].id, crop_name: 'Chilli', quantity: 540, unit: 'kg', quality_grade: 'Export Quality', available_quantity: 410, status: 'available', harvested_at: '2026-10-02' } as ProduceLot,
];
const DEMO_HARVESTS = [
  { id: '40000000-0000-0000-0000-000000000001', cultivation_id: '20000000-0000-0000-0000-000000000001', harvest_date: '2026-09-25', total_quantity_kg: 1250, quality_grade: 'Grade A', trace_code: 'AGR-HRV-260925-001' },
  { id: '40000000-0000-0000-0000-000000000002', cultivation_id: '20000000-0000-0000-0000-000000000002', harvest_date: '2026-09-30', total_quantity_kg: 860, quality_grade: 'Grade A', trace_code: 'AGR-HRV-260930-002' },
  { id: '40000000-0000-0000-0000-000000000003', cultivation_id: '20000000-0000-0000-0000-000000000003', harvest_date: '2026-10-02', total_quantity_kg: 540, quality_grade: 'Export Quality', trace_code: 'AGR-HRV-261002-003' },
];

export default function HarvestPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const profileId = user?.id;
  const [farms, setFarms] = useState<Farm[]>([]);
  const [lots, setLots] = useState<ProduceLot[]>([]);
  const [cropOptions, setCropOptions] = useState<CropOption[]>([]);
  const [farmId, setFarmId] = useState('');
  const [cropId, setCropId] = useState('');
  const [quantityKg, setQuantityKg] = useState('');
  const [qualityGrade, setQualityGrade] = useState('Grade A');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [harvestHistory, setHarvestHistory] = useState<Array<{ id: string; cultivation_id: string; harvest_date: string; total_quantity_kg: number; quality_grade: string; trace_code: string }>>([]);

  const loadData = async (id?: string) => {
    setLoading(true);
    setErrorDetails('');
    try {
      const supabase = getSupabaseClient();
      // Load public catalogue and inventory directly from Supabase. The backend's
      // public list endpoints were timing out; RLS already allows these SELECTs.
      const [farmResult, lotResult, harvestResult, cropResult] = await Promise.allSettled([
        id ? api.getFarms(id) : Promise.resolve([] as Farm[]),
        supabase
          .from('produce_lots')
          .select('id,cultivation_id,crop_id,quantity,unit,quality_grade,available_quantity,harvested_at,status,is_listed,crops(name)')
          .order('created_at', { ascending: false })
          .limit(200),
        supabase
          .from('harvest_batches')
          .select('id,cultivation_id,harvested_at,quantity,grade,trace_code')
          .order('harvested_at', { ascending: false })
          .limit(200),
        supabase
          .from('crops')
          .select('id,name,category')
          .order('name', { ascending: true }),
      ]);

      const farmRes = farmResult.status === 'fulfilled' && Array.isArray(farmResult.value) ? farmResult.value : [];
      const lotRows = lotResult.status === 'fulfilled' ? lotResult.value.data : null;
      const harvestRows = harvestResult.status === 'fulfilled' ? harvestResult.value.data : null;
      const cropRows = cropResult.status === 'fulfilled' ? cropResult.value.data : null;
      const lotRes: ProduceLot[] = Array.isArray(lotRows)
        ? lotRows.map((row: any) => {
            const crop = row.crops;
            const { crops: _crops, ...lot } = row;
            return { ...lot, crop_name: crop && typeof crop === 'object' && !Array.isArray(crop) ? crop.name : null } as ProduceLot;
          })
        : [];
      const harvestRes = Array.isArray(harvestRows)
        ? harvestRows.map((row: any) => ({
            id: row.id,
            cultivation_id: row.cultivation_id,
            harvest_date: String(row.harvested_at ?? '').slice(0, 10),
            total_quantity_kg: Number(row.quantity ?? 0),
            quality_grade: row.grade ?? '',
            trace_code: row.trace_code ?? '',
          }))
        : [];
      const cropRes = { items: Array.isArray(cropRows) ? cropRows as CropOption[] : [] };

      setFarms(farmRes.length ? farmRes : (DEMO_MODE ? [DEMO_FARM] : []));
      setLots(lotRes.length ? lotRes : (DEMO_MODE ? DEMO_LOTS : []));
      setHarvestHistory(harvestRes.length ? harvestRes : (DEMO_MODE ? DEMO_HARVESTS : []));
      setCropOptions(cropRes.items?.length ? cropRes.items : (DEMO_MODE ? DEMO_CROPS : []));

      const requests: Array<[string, PromiseSettledResult<unknown>]> = [
        ['farms', farmResult],
        ['public produce lots', lotResult],
        ['public harvest batches', harvestResult],
        ['crop catalog', cropResult],
      ];
      const describeFailure = (name: string, result: PromiseSettledResult<any>) => {
        if (result.status === 'rejected') {
          const reason = result.reason;
          return `${name}: ${reason instanceof Error ? reason.message : 'request failed'}`;
        }
        if (result.value?.error) return `${name}: ${result.value.error.message || 'Supabase query failed'}`;
        if (!Array.isArray(result.value) && !Array.isArray(result.value?.data) && name !== 'farms') {
          return `${name}: unexpected response format`;
        }
        return '';
      };
      const issues = requests.map(([name, result]) => describeFailure(name, result)).filter(Boolean);
      setErrorDetails(issues.length ? `Some harvest data could not be loaded. ${issues.join(' | ')}` : '');

      if (!farmId && farmRes[0]?.id) setFarmId(farmRes[0].id);
      if (!cropId && cropRes.items?.[0]?.id) setCropId(cropRes.items[0].id);
    } catch (error) {
      if (DEMO_MODE) {
        setFarms([DEMO_FARM]);
        setLots(DEMO_LOTS);
        setHarvestHistory(DEMO_HARVESTS);
        setCropOptions(DEMO_CROPS);
        setFarmId((current) => current || DEMO_FARM.id);
        setCropId((current) => current || DEMO_CROPS[0].id);
        setErrorDetails('');
      } else {
        setErrorDetails(error instanceof Error ? error.message : 'Unable to load harvest data.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData(profileId);
  }, [profileId]);

  const handleRecordHarvest = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!profileId) {
      setMessage('Error: Please sign in as a farmer to record a harvest.');
      return;
    }

    const quantity = Number(quantityKg);
    if (!farmId || !cropId) {
      setMessage('Error: Select a farm and crop first.');
      return;
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setMessage('Error: Enter a harvest quantity greater than 0 kg.');
      return;
    }

    setSubmitting(true);
    setMessage('');
    setErrorDetails('');

    if (DEMO_MODE) {
      const demoHarvestId = `demo-${Date.now()}`;
      const demoCultivationId = `demo-cult-${Date.now()}`;
      const demoLotId = `demo-lot-${Date.now()}`;
      const demoCrop = cropOptions.find((crop) => crop.id === cropId) || DEMO_CROPS[0];
      const newHarvest = {
        id: demoHarvestId,
        cultivation_id: demoCultivationId,
        harvest_date: harvestDate,
        total_quantity_kg: quantity,
        quality_grade: qualityGrade,
        trace_code: `AGR-DEMO-${harvestDate.replaceAll('-', '')}-${Date.now().toString().slice(-4)}`,
      };
      const newLot = {
        id: demoLotId,
        owner_id: DEMO_FARM.owner_id,
        cultivation_id: demoCultivationId,
        crop_id: demoCrop.id,
        crop_name: demoCrop.name,
        quantity,
        unit: 'kg',
        quality_grade: qualityGrade,
        available_quantity: quantity,
        status: 'available',
        harvested_at: harvestDate,
      } as ProduceLot;
      setHarvestHistory((current) => [newHarvest, ...current]);
      setLots((current) => [newLot, ...current]);
      setFarms((current) => current.length ? current : [DEMO_FARM]);
      setMessage('Demo harvest recorded successfully. A traceable demo lot was generated for this presentation session.');
      setQuantityKg('');
      setSubmitting(false);
      return;
    }

    try {
      const cultivation = await api.createCultivation({
        farm_id: farmId,
        crop_id: cropId,
        expected_harvest_date: harvestDate,
        status: 'harvested',
      });

      if (!cultivation?.id) throw new Error('Cultivation was not created, so the harvest could not be linked.');

      const harvest = await api.createHarvestBatch({
        cultivation_id: cultivation.id,
        harvest_date: harvestDate,
        total_quantity_kg: quantity,
        quality_grade: qualityGrade,
      });
      if (!harvest?.id) throw new Error('Harvest batch was not created.');

      const lot = await api.createProduceLot({
        cultivation_id: cultivation.id,
        crop_id: cropId,
        quantity,
        unit: 'kg',
        quality_grade: qualityGrade,
        available_quantity: quantity,
        harvested_at: harvestDate,
      });

      if (!lot?.id) throw new Error('Produce lot was not created.');

      setMessage('Harvest recorded successfully and a produce lot was generated.');
      setQuantityKg('');
      await loadData(profileId);
    } catch (error) {
      setMessage('Error: ' + (error instanceof Error ? error.message : 'Unable to record harvest.'));
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCrop = cropOptions.find((crop) => crop.id === cropId);
  const totalAvailableKg = lots.reduce((sum, lot) => sum + Number(lot.available_quantity ?? lot.quantity ?? 0), 0);

  const [activeView, setActiveView] = useState<'harvests' | 'lots' | 'inventory' | 'analytics'>('harvests');

  return (
    <div className="harvest-dashboard mx-auto max-w-[1500px] space-y-5 pb-8">
      <section className="harvest-hero relative overflow-hidden rounded-[24px] border border-emerald-500/50 px-6 py-7 md:px-8">
        <div className="harvest-hero-art" aria-hidden="true" />
        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/40 bg-emerald-400/10 text-emerald-300 shadow-[0_0_35px_rgba(16,185,129,.15)]"><Sprout className="h-9 w-9" /></div>
          <div className="max-w-3xl">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[.25em] text-emerald-300">AgriMark · Farm operations</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">Harvest Logs &amp; Produce Lots</h1>
            <p className="mt-2 text-sm text-slate-300 md:text-base">Record real harvest batches, generate traceable lots, and manage your inventory from one place.</p>
          </div>
          <div className="sm:ml-auto">{profileId ? <button type="button" onClick={() => void loadData(profileId)} className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/50 bg-slate-950/65 px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/15"><RefreshCw className="h-4 w-4" /> Refresh data</button> : <a href="/auth/login" className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300">Sign in <ArrowUpRight className="h-4 w-4" /></a>}</div>
        </div>
      </section>

      {message && <div className={'flex items-center gap-2 rounded-xl border p-4 text-sm ' + (message.startsWith('Error') ? 'border-red-800 bg-red-950/60 text-red-300' : 'border-emerald-800 bg-emerald-950/60 text-emerald-300')}>{message.startsWith('Error') ? <AlertCircle className="h-5 w-5 shrink-0" /> : <CheckCircle2 className="h-5 w-5 shrink-0" />}<span>{message}</span></div>}
      {errorDetails && !message && <div className="rounded-xl border border-amber-900 bg-amber-950/30 p-4 text-sm text-amber-200">{errorDetails}</div>}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Sprout className="h-7 w-7" />} label="Total harvests" value={harvestHistory.length} hint="Recorded batches" tint="emerald" />
        <StatCard icon={<Boxes className="h-7 w-7" />} label="Produce lots" value={lots.length} hint="Traceable inventory" tint="teal" />
        <StatCard icon={<Weight className="h-7 w-7" />} label="Available stock" value={<>{totalAvailableKg.toLocaleString()} <span className="text-base">kg</span></>} hint="Across all crops" tint="sky" />
        <StatCard icon={<FileText className="h-7 w-7" />} label="Available lots" value={lots.filter((lot) => (lot.status ?? 'available') === 'available').length} hint="Ready for dispatch" tint="violet" />
      </section>

      <div className="grid grid-cols-1 items-start gap-4 2xl:grid-cols-[minmax(400px,0.82fr)_minmax(0,1.25fr)]">
        <section className="harvest-panel p-5 md:p-6">
          <div className="mb-6 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300"><Plus className="h-7 w-7" /></div><div><h2 className="text-xl font-extrabold text-white">Record Harvest</h2><p className="mt-1 text-xs text-slate-400">Add a batch and create a traceable produce lot.</p></div></div>
          <form onSubmit={handleRecordHarvest} className="space-y-4">
            <div><label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-300">Select farm <span className="text-rose-400">*</span></label><div className="flex gap-2"><select required value={farmId} onChange={(event) => setFarmId(event.target.value)} className="harvest-input min-w-0 flex-1"><option value="">{farms.length ? 'Choose a farm' : 'No farm registered yet'}</option>{farms.map((farm) => <option key={farm.id} value={farm.id}>{farm.name || 'Farm'}</option>)}</select><a href="/farmer/farms" className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-emerald-500/60 px-3 text-xs font-bold text-emerald-300 hover:bg-emerald-500/10"><Plus className="h-4 w-4" /> Add farm</a></div>{profileId && !loading && farms.length === 0 && <p className="mt-2 text-xs text-amber-300">Register your farm in <a href="/farmer/farms" className="underline">My Farms</a> before recording a harvest.</p>}</div>
            <div><label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-300">Crop <span className="text-rose-400">*</span></label><select required value={cropId} onChange={(event) => setCropId(event.target.value)} className="harvest-input w-full"><option value="">{cropOptions.length ? 'Choose a crop' : loading ? 'Loading crop catalog…' : 'Crop catalog unavailable'}</option>{cropOptions.map((crop) => <option key={crop.id} value={crop.id}>{crop.name}</option>)}</select>{selectedCrop?.category && <p className="mt-2 flex items-center gap-1 text-xs text-slate-500"><Leaf className="h-3 w-3" />{selectedCrop.category}</p>}</div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><div><label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-300">Quantity (kg) <span className="text-rose-400">*</span></label><input type="number" min="0.1" step="0.1" required value={quantityKg} onChange={(event) => setQuantityKg(event.target.value)} placeholder="e.g. 500" className="harvest-input w-full" /></div><div><label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-300">Quality grade <span className="text-rose-400">*</span></label><select value={qualityGrade} onChange={(event) => setQualityGrade(event.target.value)} className="harvest-input w-full"><option>Grade A</option><option>Grade B</option><option>Grade C</option><option>Export Quality</option></select></div></div>
            <div><label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-300">Harvest date <span className="text-rose-400">*</span></label><div className="relative"><CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-300" /><input type="date" required value={harvestDate} onChange={(event) => setHarvestDate(event.target.value)} className="harvest-input w-full pl-10" /></div></div>
            <div><label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-300">Notes (optional)</label><textarea rows={3} placeholder="Add storage, field, or quality observations…" className="harvest-input w-full resize-y" /></div>
            <button type="submit" disabled={submitting || loading || farms.length === 0 || cropOptions.length === 0 || !profileId} className="harvest-primary-button w-full"><Sprout className="h-5 w-5" /> {submitting ? 'Saving harvest…' : farms.length === 0 ? 'Add a farm to continue' : 'Save harvest record'}</button>
            {!profileId && <p className="text-center text-xs text-slate-500">Sign in as a farmer to save harvest records to your account.</p>}
          </form>
        </section>

        <div className="space-y-4">
          <section className="harvest-panel overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/20 px-4 py-4 md:px-5"><div className="flex flex-wrap gap-2" role="tablist" aria-label="Harvest dashboard views">{([{ view: 'harvests', label: 'My Harvests', Icon: Sprout }, { view: 'lots', label: 'Produce Lots', Icon: Boxes }, { view: 'inventory', label: 'Inventory', Icon: PackageCheck }, { view: 'analytics', label: 'Analytics', Icon: BarChart3 }] as const).map(({ view, label, Icon }) => <button key={view} type="button" role="tab" aria-selected={activeView === view} onClick={() => setActiveView(view)} className={'harvest-tab ' + (activeView === view ? 'harvest-tab-active' : '')}><Icon className="h-4 w-4" />{label}</button>)}</div><button type="button" onClick={() => void loadData(profileId)} className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/35 px-3 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/10">Refresh <RefreshCw className="h-3.5 w-3.5" /></button></div>
            <div className="min-h-[330px] p-4 md:p-5">
              {loading ? <div className="flex min-h-[290px] items-center justify-center text-sm text-slate-400"><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Loading harvest records…</div> : activeView === 'analytics' ? (
                <div className="space-y-5 py-4"><div><h3 className="text-lg font-bold text-white">Harvest overview</h3><p className="mt-1 text-sm text-slate-400">Summary of records currently available in AgriMark.</p></div><div className="grid gap-4 sm:grid-cols-2"><div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-5"><p className="text-xs uppercase tracking-wide text-slate-400">Total harvested</p><p className="mt-2 text-3xl font-extrabold text-white">{harvestHistory.reduce((sum, item) => sum + Number(item.total_quantity_kg || 0), 0).toLocaleString()} kg</p></div><div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-5"><p className="text-xs uppercase tracking-wide text-slate-400">Stock utilized</p><p className="mt-2 text-3xl font-extrabold text-emerald-300">{Math.max(0, lots.reduce((sum, lot) => sum + Number(lot.quantity || 0), 0) - totalAvailableKg).toLocaleString()} kg</p><p className="mt-1 text-xs text-slate-500">Quantity no longer available</p></div></div>{harvestHistory.length ? <div className="space-y-3"><h4 className="text-sm font-bold text-slate-200">Latest harvest quantities</h4>{harvestHistory.slice(0, 5).map((item) => <div key={item.id} className="flex items-center gap-3"><span className="w-24 shrink-0 truncate text-xs text-slate-400">{item.harvest_date}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-300" style={{ width: Math.min(100, Number(item.total_quantity_kg || 0) / Math.max(1, ...harvestHistory.map((v) => Number(v.total_quantity_kg || 0))) * 100) + '%' }} /></div><span className="w-20 text-right text-xs font-semibold text-slate-200">{Number(item.total_quantity_kg).toLocaleString()} kg</span></div>)}</div> : <EmptyHarvest profileId={profileId} />}</div>
              ) : activeView === 'inventory' ? (
                <div><div className="mb-4"><h3 className="text-lg font-bold text-white">Stock inventory</h3><p className="text-sm text-slate-400">Available quantity by produce lot.</p></div>{lots.length ? <div className="space-y-3">{lots.map((lot) => <div key={lot.id} className="flex flex-col gap-3 rounded-xl border border-emerald-500/15 bg-slate-950/40 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-white">{lot.crop_name || lot.crop_id || 'Produce lot'}</p><p className="mt-1 font-mono text-[11px] text-slate-500">{lot.id.slice(0, 12)} · {lot.quality_grade || 'Grade not specified'}</p></div><div className="sm:text-right"><p className="text-lg font-bold text-emerald-300">{Number(lot.available_quantity ?? lot.quantity ?? 0).toLocaleString()} {lot.unit || 'kg'}</p><p className="text-xs capitalize text-slate-500">{lot.status || 'available'}</p></div></div>)}</div> : <EmptyHarvest profileId={profileId} />}</div>
              ) : activeView === 'lots' ? (
                <div><div className="mb-4"><h3 className="text-lg font-bold text-white">Produce lots</h3><p className="text-sm text-slate-400">Lot traceability, grade, quantity, and listing status.</p></div>{lots.length ? <div className="space-y-3">{lots.map((lot) => <div key={lot.id} className="rounded-xl border border-emerald-500/15 bg-slate-950/40 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-bold text-white">{lot.crop_name || lot.crop_id || 'Produce lot'}</p><p className="mt-1 font-mono text-[11px] text-slate-500">LOT {lot.id.slice(0, 8).toUpperCase()}</p></div><span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs capitalize text-emerald-300">{lot.status || 'available'}</span></div><div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4"><div><p className="text-xs text-slate-500">Total quantity</p><p className="mt-1 text-slate-200">{Number(lot.quantity).toLocaleString()} {lot.unit || 'kg'}</p></div><div><p className="text-xs text-slate-500">Available</p><p className="mt-1 text-emerald-300">{Number(lot.available_quantity ?? lot.quantity).toLocaleString()} {lot.unit || 'kg'}</p></div><div><p className="text-xs text-slate-500">Grade</p><p className="mt-1 text-slate-200">{lot.quality_grade || '—'}</p></div><div><p className="text-xs text-slate-500">Harvest date</p><p className="mt-1 text-slate-200">{lot.harvested_at || '—'}</p></div></div></div>)}</div> : <EmptyHarvest profileId={profileId} />}</div>
              ) : (
                <div><div className="mb-4 flex items-center justify-between gap-3"><div><h3 className="text-lg font-bold text-white">Recent harvest activity</h3><p className="text-sm text-slate-400">Your latest recorded batches and trace codes.</p></div><span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">{harvestHistory.length} records</span></div>{harvestHistory.length ? <div className="space-y-3">{harvestHistory.map((harvest) => { const linkedLot = lots.find((lot) => lot.cultivation_id === harvest.cultivation_id && lot.harvested_at === harvest.harvest_date); const stock = Number(linkedLot?.available_quantity ?? linkedLot?.quantity ?? harvest.total_quantity_kg ?? 0); const qty = Number(linkedLot?.quantity ?? harvest.total_quantity_kg ?? 0); const status = linkedLot?.status ?? 'available'; return <article key={harvest.id} className="rounded-xl border border-emerald-500/20 bg-slate-950/40 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h4 className="font-bold text-emerald-200">Harvest {harvest.id.slice(0, 8).toUpperCase()}</h4><p className="mt-1 text-xs text-slate-500">{harvest.trace_code || 'Trace code pending'}</p></div><span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs capitalize text-emerald-300">{status}</span></div><div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4"><div><p className="text-xs text-slate-500">Crop</p><p className="mt-1 text-slate-200">{linkedLot?.crop_name || linkedLot?.crop_id || 'Linked crop'}</p></div><div><p className="text-xs text-slate-500">Quantity</p><p className="mt-1 text-slate-200">{qty.toLocaleString()} {linkedLot?.unit || 'kg'}</p></div><div><p className="text-xs text-slate-500">Available stock</p><p className="mt-1 text-emerald-300">{stock.toLocaleString()} {linkedLot?.unit || 'kg'}</p></div><div><p className="text-xs text-slate-500">Harvested on</p><p className="mt-1 text-slate-200">{harvest.harvest_date}</p></div></div></article> })}</div> : <EmptyHarvest profileId={profileId} />}</div>
              )}
            </div>
          </section>

          <section className="harvest-panel p-5 md:p-6"><div className="mb-4 flex items-center gap-3"><Clock3 className="h-5 w-5 text-teal-300" /><h2 className="text-base font-bold text-white">Recent activity</h2></div>{harvestHistory.length ? <div className="space-y-4">{harvestHistory.slice(0, 3).map((item) => <div key={item.id} className="flex items-start gap-3"><div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-300"><CheckCircle2 className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-200">Harvest batch recorded</p><p className="mt-1 text-xs text-slate-500">{item.harvest_date} · {Number(item.total_quantity_kg).toLocaleString()} kg · {item.trace_code || 'Trace code available in batch details'}</p></div></div>)}</div> : <p className="text-sm text-slate-400">Your harvest activity will appear here after you save your first record.</p>}</section>
        </div>
      </div>

      <style jsx>{`
        .harvest-dashboard { color: #f7f5ee; }
        .harvest-hero { background: linear-gradient(105deg,rgba(2,28,21,.98) 0%,rgba(2,32,23,.91) 45%,rgba(3,22,17,.48) 100%), radial-gradient(ellipse at 78% 15%,rgba(16,185,129,.22),transparent 42%), #04120d; box-shadow: inset 0 0 60px rgba(16,185,129,.06); }
        .harvest-hero-art { position:absolute; inset:0; pointer-events:none; background:linear-gradient(90deg,rgba(3,20,15,.52),transparent 70%),radial-gradient(circle at 83% 38%,rgba(16,185,129,.16),transparent 22%); }
        .harvest-stat-card { display:flex; min-height:118px; align-items:center; gap:16px; border:1px solid rgba(16,185,129,.4); border-radius:21px; padding:20px; background:linear-gradient(135deg,rgba(3,38,29,.92),rgba(3,19,15,.92)); box-shadow:inset 0 1px 0 rgba(255,255,255,.025); }
        .harvest-stat-icon { display:flex; width:62px; height:62px; flex-shrink:0; align-items:center; justify-content:center; border:1px solid rgba(16,185,129,.26); border-radius:50%; }
        .harvest-panel { border:1px solid rgba(16,185,129,.38); border-radius:23px; background:linear-gradient(145deg,rgba(3,25,19,.96),rgba(4,15,12,.97)); box-shadow:0 12px 36px rgba(0,0,0,.14),inset 0 1px 0 rgba(255,255,255,.02); }
        .harvest-input { min-height:46px; border:1px solid rgba(71,119,98,.42); border-radius:13px; background:rgba(2,12,9,.84); padding:11px 13px; color:#f7f5ee; outline:none; transition:border-color .2s,box-shadow .2s; }
        .harvest-input:focus { border-color:#10b981; box-shadow:0 0 0 3px rgba(16,185,129,.11); }
        .harvest-input::placeholder { color:#64748b; }
        .harvest-primary-button { display:flex; min-height:48px; align-items:center; justify-content:center; gap:9px; border-radius:13px; background:linear-gradient(100deg,#059669,#10b981); padding:13px 16px; color:#f0fdf4; font-size:14px; font-weight:800; box-shadow:0 5px 20px rgba(16,185,129,.12); transition:filter .2s,transform .2s; }
        .harvest-primary-button:hover:not(:disabled) { filter:brightness(1.12); transform:translateY(-1px); }
        .harvest-primary-button:disabled { cursor:not-allowed; opacity:.48; filter:saturate(.5); }
        .harvest-tab { display:inline-flex; min-height:40px; align-items:center; gap:8px; border:1px solid transparent; border-radius:12px; padding:9px 12px; color:#9ca3af; font-size:12px; font-weight:700; transition:color .2s,background .2s,border-color .2s; }
        .harvest-tab:hover { color:#d1fae5; background:rgba(16,185,129,.07); }
        .harvest-tab-active { border-color:rgba(16,185,129,.55); background:linear-gradient(100deg,rgba(5,150,105,.35),rgba(16,185,129,.1)); color:#d1fae5; box-shadow:inset 0 0 18px rgba(16,185,129,.05); }
        @media(max-width:640px) { .harvest-stat-card { min-height:100px; padding:15px; } .harvest-stat-icon { width:48px; height:48px; } .harvest-hero { padding:22px 18px; } }
      `}</style>
    </div>
  );}
