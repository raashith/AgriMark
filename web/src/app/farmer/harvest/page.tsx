'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, ClipboardList, PackageCheck, Plus, RefreshCw } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { Farm, ProduceLot } from '@/types';

type CropOption = { id: string; name: string; category?: string | null };
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
      const [farmRes, lotRes, harvestRes, cropRes] = await Promise.all([
        id ? api.getFarms(id) : Promise.resolve([] as Farm[]),
        api.getPublicProduceLots(),
        api.getPublicHarvestBatches(),
        api.getCrops(),
      ]);
      setFarms(farmRes.length ? farmRes : (DEMO_MODE ? [DEMO_FARM] : []));
      setLots(lotRes.length ? lotRes : (DEMO_MODE ? DEMO_LOTS : []));
      setHarvestHistory(harvestRes.length ? harvestRes : (DEMO_MODE ? DEMO_HARVESTS : []));
      setCropOptions(cropRes.items?.length ? cropRes.items : (DEMO_MODE ? DEMO_CROPS : []));

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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="rounded-2xl border border-emerald-900/70 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-200">
        <span className="font-semibold">{DEMO_MODE ? 'AgriMark Demo Mode:' : 'Public harvest view:'}</span>{' '}
        {DEMO_MODE
          ? 'Presentation data is available immediately without login. You can browse farms, harvest batches, traceable lots, stock and quality details.'
          : 'Anyone can browse available AgriMark harvest and produce-lot information. Sign in only when you want to create your own farm harvest record.'}
      </div>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">{t('harvest')} & Produce Lots</h1>
          <p className="text-sm text-gray-400 mt-1">Record real harvest batches, generate traceable lots, and see inventory details immediately.</p>
        </div>
        {profileId && (
          <button type="button" onClick={() => void loadData(profileId)} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#294136] bg-[#121a16] text-gray-200 hover:border-emerald-600">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        )}
      </div>

      {message && (
        <div className={'p-4 rounded-xl text-sm flex items-center gap-2 ' + (message.startsWith('Error') ? 'bg-red-950/60 border border-red-800 text-red-300' : 'bg-emerald-950/60 border border-emerald-800 text-emerald-300')}>
          {message.startsWith('Error') ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span>{message}</span>
        </div>
      )}
      {errorDetails && !message && <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-900 text-amber-200 text-sm">{errorDetails}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)] gap-6">
        <div className="bg-[#121a16] border border-[#1e2d26] p-6 rounded-2xl shadow-md">
          <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2 mb-5"><Plus className="w-5 h-5 text-amber-400" /> {t('recordHarvest')}</h2>
          <form onSubmit={handleRecordHarvest} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Select Farm</label>
              <select required value={farmId} onChange={(event) => setFarmId(event.target.value)} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#294136] rounded-xl text-white">
                <option value="">{farms.length ? 'Choose a farm' : 'No farm registered yet'}</option>
                {farms.map((farm) => <option key={farm.id} value={farm.id}>{farm.name || 'Farm'}</option>)}
              </select>
              {profileId && !loading && farms.length === 0 && (
                <p className="text-xs text-amber-300 mt-2">Create a farm first in <a href="/farmer/farms" className="underline hover:text-amber-200">My Farms</a>.</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Crop</label>
              <select required value={cropId} onChange={(event) => setCropId(event.target.value)} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#294136] rounded-xl text-white">
                <option value="">{cropOptions.length ? 'Choose a crop' : 'Loading crop catalog…'}</option>
                {cropOptions.map((crop) => <option key={crop.id} value={crop.id}>{crop.name}</option>)}
              </select>
              {selectedCrop?.category && <p className="text-xs text-gray-500 mt-1">{selectedCrop.category}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Quantity (KG)</label>
                <input type="number" min="0.1" step="0.1" required value={quantityKg} onChange={(event) => setQuantityKg(event.target.value)} placeholder="500" className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#294136] rounded-xl text-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Quality Grade</label>
                <select value={qualityGrade} onChange={(event) => setQualityGrade(event.target.value)} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#294136] rounded-xl text-white">
                  <option>Grade A</option><option>Grade B</option><option>Grade C</option><option>Export Quality</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Harvest Date</label>
              <input type="date" required value={harvestDate} onChange={(event) => setHarvestDate(event.target.value)} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#294136] rounded-xl text-white" />
            </div>

            <button type="submit" disabled={submitting || loading || farms.length === 0 || cropOptions.length === 0 || !profileId} className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-950 disabled:text-amber-700 text-white font-bold rounded-xl">
              {submitting ? 'Saving harvest...' : farms.length === 0 ? 'Add a Farm to Continue' : 'Record Harvest & Generate Lot'}
            </button>

            {!profileId && <p className="text-xs text-amber-300">Demo browsing is available without login. Sign in only when you want to save a real farmer record.</p>}
          </form>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#121a16] border border-[#1e2d26] rounded-2xl p-5"><p className="text-xs uppercase text-gray-500">Produce lots</p><p className="text-2xl font-black text-white mt-1">{lots.length}</p></div>
            <div className="bg-[#121a16] border border-[#1e2d26] rounded-2xl p-5"><p className="text-xs uppercase text-gray-500">Available stock</p><p className="text-2xl font-black text-emerald-300 mt-1">{totalAvailableKg.toLocaleString()} kg</p></div>
            <div className="bg-[#121a16] border border-[#1e2d26] rounded-2xl p-5"><p className="text-xs uppercase text-gray-500">Available lots</p><p className="text-2xl font-black text-amber-300 mt-1">{lots.filter((lot) => (lot.status ?? 'available') === 'available').length}</p></div>
          </div>

          <div className="bg-[#121a16] border border-[#1e2d26] p-5 rounded-2xl shadow-md">
            <div className="flex items-center gap-2 mb-4"><PackageCheck className="w-5 h-5 text-amber-400" /><h2 className="text-lg font-bold text-gray-100">Harvest & Lot Details</h2></div>

            {loading ? <div className="py-12 text-center text-gray-400">Loading AgriMark harvest records...</div> : harvestHistory.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-[#294136] rounded-xl text-gray-400">
                <ClipboardList className="w-8 h-8 mx-auto mb-3 text-gray-600" />
                <p>No public harvest lots are available yet.</p>
                {profileId ? (
                  <a href="/farmer/farms" className="inline-flex mt-4 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-semibold">Open My Farms</a>
                ) : (
                  <a href="/auth/login" className="inline-flex mt-4 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-semibold">Sign in to add a harvest</a>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {harvestHistory.map((harvest) => {
                  const linkedLot = lots.find((lot) => lot.cultivation_id === harvest.cultivation_id && lot.harvested_at === harvest.harvest_date);
                  const stock = Number(linkedLot?.available_quantity ?? linkedLot?.quantity ?? harvest.total_quantity_kg ?? 0);
                  const qty = Number(linkedLot?.quantity ?? harvest.total_quantity_kg ?? 0);
                  const status = linkedLot?.status ?? 'available';
                  return (
                    <div key={harvest.id} className="rounded-2xl border border-[#294136] bg-[#0a0f0d] p-5">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-amber-300">Harvest {harvest.id.slice(0, 8)}</h3><span className="text-[11px] px-2.5 py-1 rounded-full border border-emerald-900 bg-emerald-950/50 text-emerald-300">{status}</span></div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-3 mt-4 text-sm">
                            <div><p className="text-gray-500 text-xs">Crop</p><p className="text-white">{linkedLot?.crop_name || linkedLot?.crop_id || 'Linked crop'}</p></div>
                            <div><p className="text-gray-500 text-xs">Quantity</p><p className="text-white">{qty.toLocaleString()} {linkedLot?.unit || 'kg'}</p></div>
                            <div><p className="text-gray-500 text-xs">Available</p><p className="text-emerald-300">{stock.toLocaleString()} {linkedLot?.unit || 'kg'}</p></div>
                            <div><p className="text-gray-500 text-xs">Quality</p><p className="text-white">{harvest.quality_grade || linkedLot?.quality_grade || 'Not specified'}</p></div>
                            <div><p className="text-gray-500 text-xs">Harvested</p><p className="text-white">{harvest.harvest_date}</p></div>
                            <div><p className="text-gray-500 text-xs">Trace code</p><p className="text-white font-mono break-all">{harvest.trace_code || 'Generated trace code'}</p></div>
                            <div><p className="text-gray-500 text-xs">Listed</p><p className="text-white">{linkedLot?.is_listed ? 'Yes' : 'No'}</p></div>
                            <div><p className="text-gray-500 text-xs">Lot ID</p><p className="text-gray-300 font-mono text-xs break-all">{linkedLot?.id || 'Generated from harvest'}</p></div>
                          </div>
                        </div>
                        <div className="shrink-0 text-xs text-gray-500 flex items-center gap-1"><ClipboardList className="w-4 h-4" />Harvest batch recorded</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
