'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { Farm, ProduceLot, MarketPriceObservation } from '@/types';
import { PlusCircle, Sprout, ShoppingCart, TrendingUp, Sparkles, MapPin, PackageCheck } from 'lucide-react';

export default function FarmerDashboard() {
  const { t } = useI18n();
  const { user } = useAuth();
  const profileId = user?.id;

  const [farms, setFarms] = useState<Farm[]>([]);
  const [lots, setLots] = useState<ProduceLot[]>([]);
  const [prices, setPrices] = useState<MarketPriceObservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!profileId) {
      setLoading(false);
      return;
    }
    const id = profileId;
    async function loadDashboardData() {
      try {
        const [farmList, lotList, priceList] = await Promise.allSettled([
          api.getFarms(id),
          api.getProduceLots(),
          api.getMarketPrices(),
        ]);
        if (farmList.status === 'fulfilled') setFarms(farmList.value);
        if (lotList.status === 'fulfilled') setLots(lotList.value);
        if (priceList.status === 'fulfilled') setPrices(priceList.value);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [profileId]);

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await api.askAgriAI(aiPrompt);
      setAiResponse(res.answer);
    } catch (err: any) {
      setAiResponse(`Failed to consult AgriAI: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#121a16] border border-[#1e2d26] p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-emerald-400 font-bold">{t('farmer')} Dashboard</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">Welcome back, {user?.full_name || 'Farmer'}!</h1>
          <p className="text-sm text-gray-400 flex items-center gap-1 mt-1"><MapPin className="w-4 h-4 text-emerald-400" /> {user?.location || 'Location not set'}</p>
        </div>
        <Link href="/farmer/sell" className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 transition"><ShoppingCart className="w-5 h-5" /><span>{t('sellProduce')}</span></Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: t('addFarm'), icon: PlusCircle, href: '/farmer/farms' },
          { label: t('addCrop'), icon: Sprout, href: '/farmer/farms' },
          { label: t('recordHarvest'), icon: PackageCheck, href: '/farmer/harvest' },
          { label: t('sellProduce'), icon: ShoppingCart, href: '/farmer/sell' },
          { label: t('viewOrders'), icon: ShoppingCart, href: '/buyer/orders' },
          { label: t('checkPrices'), icon: TrendingUp, href: '/farmer/dashboard#market-prices' },
        ].map((item, idx) => <Link key={idx} href={item.href} className="p-4 rounded-xl border text-emerald-400 bg-emerald-950/60 border-emerald-800/40 hover:scale-[1.02] transition flex flex-col items-center justify-center text-center gap-2 shadow-sm"><item.icon className="w-6 h-6" /><span className="text-xs font-bold leading-tight">{item.label}</span></Link>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#121a16] border border-[#1e2d26] p-5 rounded-2xl shadow-md">
            <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-bold text-gray-100 flex items-center gap-2"><Sprout className="w-5 h-5 text-emerald-400" /> {t('farms')}</h2><Link href="/farmer/farms" className="text-xs font-semibold text-emerald-400 hover:underline">+ {t('addFarm')}</Link></div>
            {loading ? <p className="text-sm text-gray-400">{t('loading')}</p> : farms.length === 0 ? <div className="p-4 bg-[#0a0f0d] border border-dashed border-[#1e2d26] rounded-xl text-center text-sm text-gray-400">You have not added a farm yet. Click <strong>+ Add Farm</strong> to start.</div> : <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{farms.map((farm) => <div key={farm.id} className="p-4 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl"><h3 className="font-bold text-emerald-300">{farm.name || 'Farm'}</h3><p className="text-xs text-gray-400">{farm.village || farm.district || farm.state || 'Location not set'} • {farm.area_acres ?? 0} Acres</p><span className="mt-2 inline-block text-[10px] uppercase font-mono px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800/40 rounded">Active Farm</span></div>)}</div>}
          </div>
          <div className="bg-[#121a16] border border-[#1e2d26] p-5 rounded-2xl shadow-md">
            <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-bold text-gray-100 flex items-center gap-2"><PackageCheck className="w-5 h-5 text-amber-400" /> {t('harvest')} & Produce Lots</h2><Link href="/farmer/harvest" className="text-xs font-semibold text-amber-400 hover:underline">+ {t('recordHarvest')}</Link></div>
            {loading ? <p className="text-sm text-gray-400">{t('loading')}</p> : lots.length === 0 ? <div className="p-4 bg-[#0a0f0d] border border-dashed border-[#1e2d26] rounded-xl text-center text-sm text-gray-400">Record your first harvest to start selling produce lots.</div> : <div className="space-y-3">{lots.map((lot) => <div key={lot.id} className="p-4 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl flex items-center justify-between"><div><h4 className="font-bold text-gray-200">Lot {lot.id.slice(0, 8)}</h4><p className="text-xs text-gray-400">Qty: {lot.quantity} {lot.unit}</p><span className="text-[10px] text-gray-500 font-mono">Harvest Date: {lot.harvested_at || 'Not set'}</span></div>{lot.status === 'available' ? <Link href={`/farmer/sell?lot_id=${lot.id}`} className="text-xs px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition">{t('sellProduce')}</Link> : <span className="text-xs px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full font-semibold">{lot.status}</span>}</div>)}</div>}
          </div>
        </div>
        <div className="space-y-6">
          <div id="market-prices" className="bg-[#121a16] border border-[#1e2d26] p-5 rounded-2xl shadow-md"><h2 className="text-lg font-bold text-gray-100 flex items-center gap-2 mb-3"><TrendingUp className="w-5 h-5 text-purple-400" /> {t('marketPrices')}</h2><div className="space-y-3">{prices.length === 0 ? <p className="text-xs text-gray-500">No live market observations are available.</p> : prices.slice(0, 5).map((price) => <div key={price.id} className="p-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl"><div className="flex justify-between"><span className="text-xs uppercase font-bold text-gray-400">{price.commodity}</span><span className="text-[10px] text-emerald-400 font-mono">{price.mandi_name}</span></div><div className="mt-1 text-sm font-bold text-emerald-300">Modal: ₹{price.modal_price} / {price.unit}</div><div className="text-xs text-gray-400">Min: ₹{price.min_price} • Max: ₹{price.max_price} • {price.observation_date}</div><div className="text-[10px] text-gray-500">Source: {price.source}</div></div>)}</div><p className="mt-3 text-[10px] text-gray-500 italic text-center">{t('disclaimer')}</p></div>
          <div className="bg-[#121a16] border border-[#1e2d26] p-5 rounded-2xl shadow-md"><h2 className="text-lg font-bold text-gray-100 flex items-center gap-2 mb-3"><Sparkles className="w-5 h-5 text-emerald-400" /> {t('agriAI')}</h2><form onSubmit={handleAskAI} className="space-y-3"><textarea rows={3} value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="Ask AgriAI about your farm, crop, or selling decision..." className="w-full p-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-sm text-white focus:border-emerald-500 focus:outline-none resize-none" /><button type="submit" disabled={aiLoading} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-950 text-white font-bold rounded-xl text-sm transition">{aiLoading ? t('loading') : 'Consult AgriAI'}</button></form>{aiResponse && <div className="mt-4 p-3 bg-[#0a0f0d] border border-emerald-900/60 rounded-xl text-xs text-emerald-200"><strong>AgriAI Advice:</strong> {aiResponse}</div>}</div>
        </div>
      </div>
    </div>
  );
}
