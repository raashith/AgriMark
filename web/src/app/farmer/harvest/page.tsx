'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { api } from '@/lib/api';
import { Farm, ProduceLot } from '@/types';
import { PackageCheck, Plus, CheckCircle2, AlertCircle } from 'lucide-react';

export default function HarvestPage() {
  const { t } = useI18n();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [lots, setLots] = useState<ProduceLot[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [farmId, setFarmId] = useState('');
  const [cropName, setCropName] = useState('');
  const [quantityKg, setQuantityKg] = useState('');
  const [qualityGrade, setQualityGrade] = useState('Grade A (Premium)');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [farmRes, lotRes] = await Promise.all([
        api.getFarms(),
        api.getProduceLots(),
      ]);
      setFarms(farmRes);
      setLots(lotRes);
      if (farmRes.length > 0) setFarmId(farmRes[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordHarvest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      await api.createProduceLot({
        farm_id: farmId,
        crop_name: cropName,
        quantity_kg: parseFloat(quantityKg) || 100,
        quality_grade: qualityGrade,
        harvest_date: harvestDate,
      });

      setMessage('Harvest recorded & Produce Lot generated!');
      setCropName('');
      setQuantityKg('');
      loadData();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">{t('harvest')} Logs</h1>
        <p className="text-sm text-gray-400">Record your crop harvests to generate verified produce lots for selling.</p>
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
        {/* Record Harvest Form */}
        <div className="bg-[#121a16] border border-[#1e2d26] p-6 rounded-2xl shadow-md">
          <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5 text-amber-400" /> {t('recordHarvest')}
          </h2>

          <form onSubmit={handleRecordHarvest} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Select Farm</label>
              <select
                value={farmId}
                onChange={(e) => setFarmId(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white focus:border-emerald-500 focus:outline-none"
              >
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>{f.name} ({f.location})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Crop / Commodity Name</label>
              <input
                type="text"
                required
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                placeholder="Tomato (Hybrid)"
                className="w-full px-4 py-2.5 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Quantity (KG)</label>
                <input
                  type="number"
                  required
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(e.target.value)}
                  placeholder="500"
                  className="w-full px-4 py-2.5 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Quality Grade</label>
                <select
                  value={qualityGrade}
                  onChange={(e) => setQualityGrade(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Grade A (Premium)">Grade A (Premium)</option>
                  <option value="Grade B (Standard)">Grade B (Standard)</option>
                  <option value="Grade C (Processing)">Grade C (Processing)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Harvest Date</label>
              <input
                type="date"
                required
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || farms.length === 0}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-950 text-white font-bold rounded-xl shadow transition"
            >
              {submitting ? t('loading') : t('recordHarvest')}
            </button>
          </form>
        </div>

        {/* Existing Lots List */}
        <div className="bg-[#121a16] border border-[#1e2d26] p-6 rounded-2xl shadow-md space-y-4">
          <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-amber-400" /> Active Produce Lots
          </h2>

          {loading ? (
            <p className="text-sm text-gray-400">{t('loading')}</p>
          ) : lots.length === 0 ? (
            <div className="p-6 bg-[#0a0f0d] border border-dashed border-[#1e2d26] rounded-xl text-center text-sm text-gray-400">
              No produce lots generated yet.
            </div>
          ) : (
            <div className="space-y-3">
              {lots.map((lot) => (
                <div key={lot.id} className="p-4 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-amber-300 text-base">{lot.crop_name}</h3>
                    <p className="text-xs text-gray-300">Quantity: {lot.quantity_kg} KG • Grade: {lot.quality_grade}</p>
                    <span className="text-[10px] text-gray-500 font-mono">Date: {lot.harvest_date}</span>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                    lot.is_listed ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-amber-950 text-amber-300 border-amber-800'
                  }`}>
                    {lot.is_listed ? 'Listed' : 'Unlisted'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
