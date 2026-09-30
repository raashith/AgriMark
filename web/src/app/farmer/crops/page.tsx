'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Cultivation, CropCatalogItem } from '@/types';
import { dataService } from '@/lib/data-service';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Sprout, Plus, RefreshCw } from 'lucide-react';

export default function FarmerCropsPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [cultivations, setCultivations] = useState<Cultivation[]>([]);
  const [farms, setFarms] = useState<Array<{ id: string; name?: string | null }>>([]);
  const [catalog, setCatalog] = useState<CropCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [selectedCropId, setSelectedCropId] = useState('');
  const [season, setSeason] = useState('Kharif');
  const [area, setArea] = useState(5);
  const [sowingDate, setSowingDate] = useState(new Date().toISOString().slice(0, 10));
  const [expectedHarvestDate, setExpectedHarvestDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [cults, cat, farmList] = await Promise.all([
        dataService.getCultivations(undefined, user.id),
        dataService.getCropCatalog(),
        dataService.getFarms(user.id),
      ]);
      setCultivations(cults);
      setCatalog(cat);
      setFarms(farmList);
      if (!selectedFarmId && farmList[0]?.id) setSelectedFarmId(farmList[0].id);
      if (!selectedCropId && cat[0]?.id) setSelectedCropId(cat[0].id);
    } catch (error) {
      showError('Unable to load crops', error instanceof Error ? error.message : 'Please retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [user?.id]);

  const selectedCrop = catalog.find((crop) => crop.id === selectedCropId);
  const selectedFarm = farms.find((farm) => farm.id === selectedFarmId);
  const totalArea = useMemo(
    () => cultivations.reduce((sum, cultivation) => sum + Number(cultivation.area_acres || 0), 0),
    [cultivations],
  );

  const handleCreateCultivation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !selectedFarmId || !selectedCropId) {
      showError('Missing details', 'Select a farm and crop before saving.');
      return;
    }
    if (!Number.isFinite(area) || area <= 0) {
      showError('Invalid area', 'Cultivation area must be greater than 0 acres.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await dataService.createCultivation({
        farm_id: selectedFarmId,
        crop_id: selectedCropId,
        season,
        area_acres: Number(area),
        sowing_date: sowingDate || null,
        expected_harvest_date: expectedHarvestDate || null,
        status: 'planned',
      });
      if (!created) throw new Error('Database submission failed.');
      setCultivations((prev) => [created, ...prev]);
      setIsModalOpen(false);
      setSowingDate(new Date().toISOString().slice(0, 10));
      setExpectedHarvestDate('');
      showSuccess(
        'Cultivation recorded',
        `${selectedCrop?.name || 'Crop'} linked to ${selectedFarm?.name || 'farm'}.`,
      );
    } catch (error) {
      showError('Failed to record cultivation', error instanceof Error ? error.message : 'Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['farmer', 'fpo', 'admin']}>
      <div className="space-y-6">
        <section className="rounded-[28px] border border-[#24382e] bg-[#07110d] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.32)] md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#3e7b54]/60 bg-[#1b4d3e]/30 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#9bc7a2]">
                <Sprout className="h-3.5 w-3.5" /> Agronomy Operations
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-[#f7f5ee] md:text-5xl">Crops & Cultivation</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#adbdb2]">
                Link each cultivation to a real farm and catalog crop so every later harvest and produce lot has traceable origin data.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                disabled={!farms.length || !catalog.length}
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#3e7b54] px-4 text-sm font-black text-[#f7f5ee] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus className="h-4 w-4" /> Record cultivation
              </button>
              <button
                type="button"
                onClick={() => void loadData()}
                disabled={loading}
                className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-[#2a3b32] bg-[#07110d] px-4 text-sm font-bold text-[#f7f5ee]"
              >
                <RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} /> Refresh
              </button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#0e1712] p-5">
            <p className="text-xs uppercase tracking-wider text-[#70887a]">Active records</p>
            <p className="mt-2 text-3xl font-black text-[#f7f5ee]">{loading ? '—' : cultivations.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0e1712] p-5">
            <p className="text-xs uppercase tracking-wider text-[#70887a]">Cultivated area</p>
            <p className="mt-2 text-3xl font-black text-[#f7f5ee]">{loading ? '—' : `${totalArea.toFixed(1)} ac`}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0e1712] p-5">
            <p className="text-xs uppercase tracking-wider text-[#70887a]">Registered farms</p>
            <p className="mt-2 text-3xl font-black text-[#f7f5ee]">{loading ? '—' : farms.length}</p>
          </div>
        </section>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-44 rounded-3xl" />)}
          </div>
        ) : !farms.length ? (
          <EmptyState
            title="Register a farm first"
            description="Harvest tracing starts with a real farm. Add the farm boundary and acreage before recording a cultivation."
          />
        ) : !cultivations.length ? (
          <EmptyState
            title="No cultivations recorded"
            description="Create a farm-linked cultivation plan, then use that cultivation in Harvest & Produce Lots."
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {cultivations.map((c) => {
              const crop = catalog.find((entry) => entry.id === c.crop_id);
              const farm = farms.find((entry) => entry.id === c.farm_id);
              return (
                <article key={c.id} className="rounded-3xl border border-[#24382e] bg-[#0e1712] p-6 shadow-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#70887a]">Cultivation</p>
                      <h2 className="mt-1 text-xl font-extrabold text-[#f7f5ee]">{crop?.name || c.crop_id}</h2>
                      <p className="mt-1 text-xs text-[#52a67a]">{farm?.name || c.farm_id}</p>
                    </div>
                    <span className="rounded-full border border-[#3e7b54]/60 bg-[#1b4d3e]/30 px-3 py-1 text-[10px] font-mono uppercase text-[#9bc7a2]">
                      {c.status}
                    </span>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/5 bg-[#07110d] p-3"><p className="text-[10px] uppercase text-[#596d61]">Season</p><p className="mt-1 text-sm font-bold text-[#f7f5ee]">{c.season || '—'}</p></div>
                    <div className="rounded-xl border border-white/5 bg-[#07110d] p-3"><p className="text-[10px] uppercase text-[#596d61]">Area</p><p className="mt-1 text-sm font-bold text-[#f7f5ee]">{Number(c.area_acres || 0).toLocaleString()} ac</p></div>
                    <div className="rounded-xl border border-white/5 bg-[#07110d] p-3"><p className="text-[10px] uppercase text-[#596d61]">Sowing</p><p className="mt-1 text-sm font-bold text-[#f7f5ee]">{c.sowing_date || '—'}</p></div>
                    <div className="rounded-xl border border-white/5 bg-[#07110d] p-3"><p className="text-[10px] uppercase text-[#596d61]">Expected harvest</p><p className="mt-1 text-sm font-bold text-[#f7f5ee]">{c.expected_harvest_date || '—'}</p></div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record New Cultivation" subtitle="Use only real farm and crop records">
          <form onSubmit={handleCreateCultivation} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-[#70887a]">Farm</label>
              <select required value={selectedFarmId} onChange={(e) => setSelectedFarmId(e.target.value)} className="w-full rounded-xl border border-[#2a3b32] bg-[#07110d] px-4 py-3 text-sm text-[#f7f5ee]">
                {farms.map((farm) => <option key={farm.id} value={farm.id}>{farm.name || 'Farm'}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-[#70887a]">Crop</label>
              <select required value={selectedCropId} onChange={(e) => setSelectedCropId(e.target.value)} className="w-full rounded-xl border border-[#2a3b32] bg-[#07110d] px-4 py-3 text-sm text-[#f7f5ee]">
                {catalog.map((crop) => <option key={crop.id} value={crop.id}>{crop.name} · {crop.category}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-[#70887a]">Season</label>
                <select value={season} onChange={(e) => setSeason(e.target.value)} className="w-full rounded-xl border border-[#2a3b32] bg-[#07110d] px-4 py-3 text-sm text-[#f7f5ee]">
                  <option>Kharif</option><option>Rabi</option><option>Zaid</option><option>Perennial</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-[#70887a]">Area (acres)</label>
                <input type="number" min="0.1" step="0.1" required value={area} onChange={(e) => setArea(Number(e.target.value))} className="w-full rounded-xl border border-[#2a3b32] bg-[#07110d] px-4 py-3 text-sm text-[#f7f5ee]" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-[#70887a]">Sowing date</label>
                <input type="date" required value={sowingDate} onChange={(e) => setSowingDate(e.target.value)} className="w-full rounded-xl border border-[#2a3b32] bg-[#07110d] px-4 py-3 text-sm text-[#f7f5ee]" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-[#70887a]">Expected harvest date <span className="normal-case text-[#596d61]">(optional)</span></label>
              <input type="date" value={expectedHarvestDate} onChange={(e) => setExpectedHarvestDate(e.target.value)} className="w-full rounded-xl border border-[#2a3b32] bg-[#07110d] px-4 py-3 text-sm text-[#f7f5ee]" />
            </div>
            <button type="submit" disabled={submitting || !farms.length || !catalog.length} className="min-h-12 w-full rounded-xl bg-[#e5a93c] text-sm font-black text-[#19201d] disabled:opacity-40">
              {submitting ? 'Saving…' : 'Save Cultivation Record'}
            </button>
          </form>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
