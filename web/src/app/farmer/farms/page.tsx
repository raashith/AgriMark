'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { api } from '@/lib/api';
import { Farm } from '@/types';
import { Sprout, Plus, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

export default function FarmerFarmsPage() {
  const { t } = useI18n();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [areaAcres, setAreaAcres] = useState('');
  const [soilType, setSoilType] = useState('Red Soil');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    try {
      const res = await api.getFarms();
      setFarms(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      await api.createFarm({
        name,
        location,
        area_acres: parseFloat(areaAcres) || 1.0,
        soil_type: soilType,
      });

      setMessage('Farm created successfully!');
      setName('');
      setLocation('');
      setAreaAcres('');
      fetchFarms();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">{t('farms')}</h1>
          <p className="text-sm text-gray-400">Register and manage your farm holdings and field details.</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-2 ${
          message.startsWith('Error') ? 'bg-red-950/60 border border-red-800 text-red-300' : 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
        }`}>
          {message.startsWith('Error') ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Card */}
        <div className="bg-[#121a16] border border-[#1e2d26] p-6 rounded-2xl shadow-md">
          <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5 text-emerald-400" /> {t('addFarm')}
          </h2>

          <form onSubmit={handleAddFarm} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Farm Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Green Acres Organic Farm"
                className="w-full px-4 py-2.5 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Location / Village</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Dindigul West, Tamil Nadu"
                className="w-full px-4 py-2.5 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Area (Acres)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={areaAcres}
                  onChange={(e) => setAreaAcres(e.target.value)}
                  placeholder="3.5"
                  className="w-full px-4 py-2.5 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Soil Type</label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Red Soil">Red Soil</option>
                  <option value="Black Cotton">Black Cotton</option>
                  <option value="Alluvial">Alluvial</option>
                  <option value="Clay Loam">Clay Loam</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-950 text-white font-bold rounded-xl shadow transition"
            >
              {submitting ? t('loading') : t('addFarm')}
            </button>
          </form>
        </div>

        {/* Existing Farms List */}
        <div className="bg-[#121a16] border border-[#1e2d26] p-6 rounded-2xl shadow-md space-y-4">
          <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-400" /> Registered Farm List
          </h2>

          {loading ? (
            <p className="text-sm text-gray-400">{t('loading')}</p>
          ) : farms.length === 0 ? (
            <div className="p-6 bg-[#0a0f0d] border border-dashed border-[#1e2d26] rounded-xl text-center text-sm text-gray-400">
              No farms registered yet. Fill out the form to register your first farm.
            </div>
          ) : (
            <div className="space-y-3">
              {farms.map((farm) => (
                <div key={farm.id} className="p-4 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl space-y-1">
                  <h3 className="font-bold text-emerald-300 text-base">{farm.name}</h3>
                  <p className="text-xs text-gray-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {farm.location}
                  </p>
                  <div className="flex gap-2 text-xs text-gray-400 font-mono mt-2 pt-2 border-t border-[#1e2d26]">
                    <span>Area: {farm.area_acres} Acres</span>
                    <span>•</span>
                    <span>Soil: {farm.soil_type || 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
