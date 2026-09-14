'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { Farm, ProduceLot, MarketPriceObservation } from '@/types';
import { PlusCircle, Sprout, ShoppingCart, TrendingUp, Sparkles, MapPin, PackageCheck, AlertCircle } from 'lucide-react';

export default function FarmerDashboard() {
  const { t } = useI18n();
  const { user } = useAuth();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [lots, setLots] = useState<ProduceLot[]>([]);
  const [prices, setPrices] = useState<MarketPriceObservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [farmList, lotList, priceList] = await Promise.allSettled([
          api.getFarms(),
          api.getProduceLots(),
          api.getMarketPrices(),
        ]);

        if (farmList.status === 'fulfilled') setFarms(farmList.value);
        if (lotList.status === 'fulfilled') setLots(lotList.value);
        if (priceList.status === 'fulfilled') setPrices(priceList.value);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await api.askAgriAI(aiPrompt);
      setAiResponse(res.response);
    } catch (err: any) {
      setAiResponse(`Failed to consult AgriAI: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#121a16] border border-[#1e2d26] p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-emerald-400 font-bold">{t('farmer')} Dashboard</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">Welcome back, {user?.full_name || 'Farmer'}!</h1>
          <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
            <MapPin className="w-4 h-4 text-emerald-400" /> {user?.location || 'Tamil Nadu, India'}
          </p>
        </div>

        <Link
          href="/farmer/sell"
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 transition"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>{t('sellProduce')}</span>
        </Link>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: t('addFarm'), icon: PlusCircle, href: '/farmer/farms', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40' },
          { label: t('addCrop'), icon: Sprout, href: '/farmer/farms', color: 'text-teal-400 bg-teal-950/60 border-teal-800/40' },
          { label: t('recordHarvest'), icon: PackageCheck, href: '/farmer/harvest', color: 'text-amber-400 bg-amber-950/60 border-amber-800/40' },
          { label: t('sellProduce'), icon: ShoppingCart, href: '/farmer/sell', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40' },
          { label: t('viewOrders'), icon: ShoppingCart, href: '/farmer/dashboard', color: 'text-blue-400 bg-blue-950/60 border-blue-800/40' },
          { label: t('checkPrices'), icon: TrendingUp, href: '/farmer/dashboard#market-prices', color: 'text-purple-400 bg-purple-950/60 border-purple-800/40' },
        ].map((item, idx) => (
          <Link
            key={idx}
            href={item.href}
            className={`p-4 rounded-xl border ${item.color} hover:scale-[1.02] transition flex flex-col items-center justify-center text-center gap-2 shadow-sm`}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-xs font-bold leading-tight">{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Farms & Produce Lots */}
        <div className="lg:col-span-2 space-y-6">
          {/* Farms List */}
          <div className="bg-[#121a16] border border-[#1e2d26] p-5 rounded-2xl shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-400" /> {t('farms')}
              </h2>
              <Link href="/farmer/farms" className="text-xs font-semibold text-emerald-400 hover:underline">
                + {t('addFarm')}
              </Link>
            </div>

            {loading ? (
              <p className="text-sm text-gray-400">{t('loading')}</p>
            ) : farms.length === 0 ? (
              <div className="p-4 bg-[#0a0f0d] border border-dashed border-[#1e2d26] rounded-xl text-center text-sm text-gray-400">
                You have not added a farm yet. Click <strong>+ Add Farm</strong> to start.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {farms.map((farm) => (
                  <div key={farm.id} className="p-4 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl">
                    <h3 className="font-bold text-emerald-300">{farm.name}</h3>
                    <p className="text-xs text-gray-400">{farm.location} • {farm.area_acres} Acres</p>
                    <span className="mt-2 inline-block text-[10px] uppercase font-mono px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800/40 rounded">
                      Active Farm
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Harvest & Available Produce Lots */}
          <div className="bg-[#121a16] border border-[#1e2d26] p-5 rounded-2xl shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-amber-400" /> {t('harvest')} & Produce Lots
              </h2>
              <Link href="/farmer/harvest" className="text-xs font-semibold text-amber-400 hover:underline">
                + {t('recordHarvest')}
              </Link>
            </div>

            {loading ? (
              <p className="text-sm text-gray-400">{t('loading')}</p>
            ) : lots.length === 0 ? (
              <div className="p-4 bg-[#0a0f0d] border border-dashed border-[#1e2d26] rounded-xl text-center text-sm text-gray-400">
                Record your first harvest to start selling produce lots.
              </div>
            ) : (
              <div className="space-y-3">
                {lots.map((lot) => (
                  <div key={lot.id} className="p-4 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-200">{lot.crop_name}</h4>
                      <p className="text-xs text-gray-400">Qty: {lot.quantity_kg} kg • Grade: {lot.quality_grade}</p>
                      <span className="text-[10px] text-gray-500 font-mono">Harvest Date: {lot.harvest_date}</span>
                    </div>
                    {lot.is_listed ? (
                      <span className="text-xs px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full font-semibold">
                        Listed
                      </span>
                    ) : (
                      <Link
                        href={`/farmer/sell?lot_id=${lot.id}`}
                        className="text-xs px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition"
                      >
                        {t('sellProduce')}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Market Intelligence & AgriAI */}
        <div className="space-y-6">
          {/* Market Price Intelligence Widget */}
          <div id="market-prices" className="bg-[#121a16] border border-[#1e2d26] p-5 rounded-2xl shadow-md">
            <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-purple-400" /> {t('marketPrices')}
            </h2>

            <div className="space-y-3">
              <div className="p-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase font-bold text-gray-400">{t('marketReference')}</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Dindigul Mandi</span>
                </div>
                <div className="mt-1 text-sm font-bold text-emerald-300">Tomato (Hybrid) — ₹24.50 / kg</div>
                <div className="text-xs text-gray-400">Min: ₹21.00 • Modal: ₹24.50 • Max: ₹28.00</div>
              </div>

              <div className="p-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase font-bold text-gray-400">{t('aiIntelligence')}</span>
                  <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-1.5 py-0.5 rounded font-mono">92% Confidence</span>
                </div>
                <p className="mt-1 text-xs text-purple-200">Demand signal is rising (+12%) over next 5 days. Optimal selling window is today/tomorrow.</p>
              </div>

              <p className="text-[10px] text-gray-500 italic text-center">{t('disclaimer')}</p>
            </div>
          </div>

          {/* AgriAI Consult Card */}
          <div className="bg-[#121a16] border border-[#1e2d26] p-5 rounded-2xl shadow-md">
            <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-emerald-400" /> {t('agriAI')}
            </h2>

            <form onSubmit={handleAskAI} className="space-y-3">
              <textarea
                rows={3}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ask AgriAI: Should I sell my tomato crop today?"
                className="w-full p-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-sm text-white focus:border-emerald-500 focus:outline-none resize-none"
              />
              <button
                type="submit"
                disabled={aiLoading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-950 text-white font-bold rounded-xl text-sm transition"
              >
                {aiLoading ? t('loading') : 'Consult AgriAI'}
              </button>
            </form>

            {aiResponse && (
              <div className="mt-4 p-3 bg-[#0a0f0d] border border-emerald-900/60 rounded-xl text-xs text-emerald-200">
                <strong>AgriAI Advice:</strong> {aiResponse}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
