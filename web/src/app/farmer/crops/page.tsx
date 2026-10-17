'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Cultivation, CropCatalogItem } from '@/types';
import { dataService } from '@/lib/data-service';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Sprout, Plus } from 'lucide-react';

export default function FarmerCropsPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [cultivations, setCultivations] = useState<Cultivation[]>([]);
  const [catalog, setCatalog] = useState<CropCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [cropName, setCropName] = useState('Paddy (Rice)');
  const [variety, setVariety] = useState('CR-1009 Sub1');
  const [season, setSeason] = useState('Kharif');
  const [area, setArea] = useState<number>(5.0);
  const [farms, setFarms] = useState<Array<{ id: string; name?: string | null; village?: string | null; area_acres?: number | null }>>([]);
  const [farmId, setFarmId] = useState('');
  const [cropId, setCropId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sowingDate, setSowingDate] = useState('');
  const [expectedHarvestDate, setExpectedHarvestDate] = useState('');
  const [expectedYieldKg, setExpectedYieldKg] = useState<number | ''>('');

  useEffect(() => {
    async function loadData() {
      try {
        if (!user?.id) return;
        const [cults, cat, ownedFarms] = await Promise.all([
          dataService.getCultivations(undefined, user.id),
          dataService.getCropCatalog(),
          dataService.getFarms(user.id),
        ]);
        setCultivations(cults);
        setCatalog(cat);
        setFarms(ownedFarms);
        setCropId((current) => current || cat[0]?.id || '');
        setFarmId((current) => current || ownedFarms[0]?.id || '');
      } catch {
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleCreateCultivation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!user?.id) {
      showError('Authentication Required', 'Please sign in to record a cultivation plan.');
      return;
    }
    if (!farmId) {
      showError('Farm Required', 'Register a farm before recording cultivation.');
      return;
    }
    if (!cropId) {
      showError('Crop Required', 'Select a crop before saving cultivation.');
      return;
    }
    const acres = Number(area);
    if (!Number.isFinite(acres) || acres <= 0) {
      showError('Check acreage', 'Enter cultivation area greater than zero.');
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await dataService.createCultivation({
        farmer_id: user.id,
        farm_id: farmId,
        crop_id: cropId,
        crop_name: cropName,
        variety,
        season,
        sowing_date: sowingDate || null,
        expected_harvest_date: expectedHarvestDate || null,
        area_acres: acres,
        expected_yield_kg: expectedYieldKg === '' ? null : Number(expectedYieldKg),
        status: 'planned',
      });
      setCultivations((prev) => [created, ...prev.filter((item) => item.id !== created.id)]);
      showSuccess('Cultivation Recorded!', `Cultivation plan for ${cropName} (${variety}) saved.`);
      setIsModalOpen(false);
    } catch (err: unknown) {
      showError('Failed to record cultivation', err instanceof Error ? err.message : 'Could not save this record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['farmer', 'fpo', 'admin']}>
      <div className="space-y-6">
        <div className="bg-[#121a16] border border-[#1e2d26] p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded-full text-xs font-mono font-bold text-emerald-400">
              <Sprout className="w-4 h-4" /> Agronomy & Cultivation Cycle
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              Crops & Cultivation Seasons
            </h1>
            <p className="text-xs text-gray-300 max-w-xl">
              Track active crop varieties, sowing dates, expected harvest schedules, and organic farming guidelines.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Record New Cultivation</span>
          </button>
        </div>

        {/* Cultivation List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-3xl" />
            ))}
          </div>
        ) : cultivations.length === 0 ? (
          <EmptyState
            title="No Cultivation Plans Recorded"
            description="You have not recorded any active crop cultivations yet. Click 'Record New Cultivation' to begin."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cultivations.map((c) => (
              <div key={c.id} className="bg-[#121a16] border border-[#1e2d26] rounded-3xl p-6 space-y-4 shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-lg text-white">{c.crop_name}</h3>
                    <p className="text-xs text-emerald-400 font-medium">Variety: {c.variety}</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-mono font-bold uppercase rounded-full">
                    {c.status || 'active'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl">
                    <span className="text-gray-400 uppercase font-mono text-[10px]">Season</span>
                    <p className="font-bold text-white text-xs mt-0.5">{c.season || 'Kharif'}</p>
                  </div>
                  <div className="p-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl">
                    <span className="text-gray-400 uppercase font-mono text-[10px]">Area</span>
                    <p className="font-bold text-white text-xs mt-0.5">{c.area_acres} Acres</p>
                  </div>
                  <div className="p-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl">
                    <span className="text-gray-400 uppercase font-mono text-[10px]">Exp Yield</span>
                    <p className="font-bold text-emerald-400 text-xs mt-0.5">{c.expected_yield_kg ? `${(c.expected_yield_kg / 1000).toFixed(1)} Tons` : 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-[#1e2d26]">
                  <span>Sown: {c.sowing_date || 'N/A'}</span>
                  <span>Expected Harvest: {c.expected_harvest_date || 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record New Cultivation" subtitle="Enter crop variety and sowing date">
          <form onSubmit={handleCreateCultivation} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Crop Selection</label>
              <select value={cropId} onChange={(e) => { setCropId(e.target.value); setCropName(catalog.find((crop) => crop.id === e.target.value)?.name || ''); }} required className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none">
                <option value="">Select a crop</option>
                {catalog.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name} ({cat.category})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Farm</label>
              <select value={farmId} onChange={(e) => setFarmId(e.target.value)} required disabled={farms.length === 0} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none">
                <option value="">{farms.length ? 'Select a farm' : 'Register a farm first'}</option>
                {farms.map((farm) => (
                  <option key={farm.id} value={farm.id}>{farm.name || 'Unnamed farm'} · {farm.village || 'Location not set'} · {farm.area_acres ?? 0} acres</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Variety Name</label>
                <input type="text" required value={variety} onChange={(e) => setVariety(e.target.value)} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none" placeholder="CR-1009 Sub1" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Area (Acres)</label>
                <input type="number" step="0.5" required value={area} onChange={(e) => setArea(Number(e.target.value))} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Sowing Date</label>
                <input type="date" value={sowingDate} onChange={(e) => setSowingDate(e.target.value)} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Expected Harvest</label>
                <input type="date" min={sowingDate || undefined} value={expectedHarvestDate} onChange={(e) => setExpectedHarvestDate(e.target.value)} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Expected Yield (kg, optional)</label>
              <input type="number" min="0" step="1" value={expectedYieldKg} onChange={(e) => setExpectedYieldKg(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none" placeholder="Expected yield in kilograms" />
            </div>

            <button type="submit" disabled={isSubmitting || !farms.length || !catalog.length} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold rounded-xl shadow-lg transition">
              {isSubmitting ? 'Saving cultivation…' : 'Save Cultivation Record'}
            </button>
          </form>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
