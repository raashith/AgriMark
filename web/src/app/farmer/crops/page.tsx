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

  useEffect(() => {
    async function loadData() {
      try {
        const [cults, cat] = await Promise.all([
          dataService.getCultivations(undefined, user?.id),
          dataService.getCropCatalog(),
        ]);
        setCultivations(cults);
        setCatalog(cat);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleCreateCultivation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      showError('Authentication Required', 'Please sign in to record a cultivation plan.');
      return;
    }
    try {
      const created = await dataService.createCultivation({
        farmer_id: user.id,
        crop_name: cropName,
        variety,
        season,
        area_acres: Number(area),
      });
      if (created) {
        setCultivations((prev) => [created, ...prev]);
        showSuccess('Cultivation Recorded!', `Cultivation plan for ${cropName} (${variety}) saved.`);
        setIsModalOpen(false);
      } else {
        showError('Record Failed', 'Database submission failed.');
      }
    } catch (err: any) {
      showError('Failed to record cultivation', err.message);
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
              <select value={cropName} onChange={(e) => setCropName(e.target.value)} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none">
                {catalog.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name} ({cat.category})</option>
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

            <button type="submit" className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition">
              Save Cultivation Record
            </button>
          </form>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
