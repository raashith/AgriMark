'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Farm } from '@/types';
import { dataService } from '@/lib/data-service';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { MapPin, Plus, Droplets, Zap, ShieldCheck, Layers } from 'lucide-react';

export default function FarmerFarmsPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('Thanjavur');
  const [state, setState] = useState('Tamil Nadu');
  const [areaAcres, setAreaAcres] = useState<number>(3.0);
  const [soilType, setSoilType] = useState('Alluvial Clay Loam');
  const [irrigation, setIrrigation] = useState('Canal & Borewell');

  useEffect(() => {
    dataService.getFarms(user?.id).then(setFarms);
  }, [user]);

  const handleAddFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await dataService.createFarm({
        owner_id: user?.id || 'user-farmer-01',
        name,
        village,
        district,
        state,
        area_acres: Number(areaAcres),
        soil_type: soilType,
        irrigation_source: irrigation,
      });
      setFarms((prev) => [created, ...prev]);
      showSuccess('Farm Created Successfully!', `${name} added to your AgriMark profile.`);
      setIsModalOpen(false);
      setName('');
    } catch (err: any) {
      showError('Failed to create farm', err.message);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['farmer', 'fpo', 'admin']}>
      <div className="space-y-6">
        <div className="bg-[#121a16] border border-[#1e2d26] p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded-full text-xs font-mono font-bold text-emerald-400">
              <MapPin className="w-4 h-4" /> Agricultural Land & Infrastructure
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              My Farms & Field Coordinates
            </h1>
            <p className="text-xs text-gray-300 max-w-xl">
              Manage your registered farm acreage, soil characteristics, water sources, and field infrastructure.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Farm</span>
          </button>
        </div>

        {/* Farms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {farms.map((farm) => (
            <div key={farm.id} className="bg-[#121a16] border border-[#1e2d26] rounded-3xl p-6 space-y-4 shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-lg text-white">{farm.name}</h3>
                  <p className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" /> {farm.village}, {farm.district}, {farm.state}
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-mono font-bold rounded-full">
                  {farm.area_acres} Acres
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl">
                  <span className="text-gray-400 uppercase font-mono text-[10px]">Soil Type</span>
                  <p className="font-bold text-white text-xs mt-0.5">{farm.soil_type}</p>
                </div>
                <div className="p-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl">
                  <span className="text-gray-400 uppercase font-mono text-[10px]">Irrigation Source</span>
                  <p className="font-bold text-white text-xs mt-0.5">{farm.irrigation_source}</p>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[#1e2d26]">
                <span className="text-[10px] font-mono uppercase text-gray-400">Registered Infrastructure</span>
                <div className="flex flex-wrap gap-1.5">
                  {(farm.infrastructure || ['Borewell Pump', 'Drip Lines']).map((infra, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 bg-[#0a0f0d] border border-[#1e2d26] text-gray-300 text-[10px] rounded-lg">
                      {infra}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Farm" subtitle="Enter your field location & acreage">
          <form onSubmit={handleAddFarm} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Farm Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none" placeholder="e.g. Kaveri Delta Field 1" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Village</label>
                <input type="text" required value={village} onChange={(e) => setVillage(e.target.value)} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none" placeholder="Papanasam" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">District</label>
                <input type="text" required value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none" placeholder="Thanjavur" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Area (in Acres)</label>
                <input type="number" step="0.1" required value={areaAcres} onChange={(e) => setAreaAcres(Number(e.target.value))} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Soil Type</label>
                <select value={soilType} onChange={(e) => setSoilType(e.target.value)} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none">
                  <option value="Alluvial Clay Loam">Alluvial Clay Loam</option>
                  <option value="Red Sandy Loam">Red Sandy Loam</option>
                  <option value="Black Cotton Soil">Black Cotton Soil</option>
                  <option value="Laterite Soil">Laterite Soil</option>
                </select>
              </div>
            </div>

            <button type="submit" className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition">
              Save Farm Details
            </button>
          </form>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
