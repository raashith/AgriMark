'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { ProduceLot } from '@/types';
import { ShoppingCart, CheckCircle2, AlertCircle } from 'lucide-react';

function SellForm() {
  const { t } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [lots, setLots] = useState<ProduceLot[]>([]);
  const [selectedLotId, setSelectedLotId] = useState(searchParams.get('lot_id') || '');
  const [askingPrice, setAskingPrice] = useState('');
  const [minOrderQty, setMinOrderQty] = useState('50');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    fetchLots();
  }, [user?.id]);

  const fetchLots = async () => {
    try {
      const res = await api.getProduceLots();
      const unlisted = res.filter((l) => !l.is_listed);
      setLots(unlisted);
      if (unlisted.length > 0 && !selectedLotId) setSelectedLotId(unlisted[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const selectedLot = lots.find((l) => l.id === selectedLotId);

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLot) {
      setMessage('Error: Please select a valid produce lot.');
      return;
    }
    const unitPrice = Number(askingPrice);
    const minimum = Number(minOrderQty);
    if (!Number.isFinite(unitPrice) || unitPrice < 0 || !Number.isFinite(minimum) || minimum <= 0) {
      setMessage('Error: Enter a valid price and minimum order quantity.');
      return;
    }
    setSubmitting(true);
    setMessage('');
    try {
      await api.createListing({
        lot_id: selectedLot.id,
        title: selectedLot.quality_grade ? `${selectedLot.quality_grade} produce lot` : 'Produce lot',
        price_per_unit: unitPrice,
        currency: 'INR',
        min_order_quantity: minimum,
      });
      setMessage('Listing published to AgriMark Marketplace!');
      setTimeout(() => router.push('/buyer/marketplace'), 1200);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#121a16] border border-[#1e2d26] p-6 rounded-2xl shadow-md">
      {message && <div className={`mb-4 p-4 rounded-xl text-sm flex items-center gap-2 ${message.startsWith('Error') ? 'bg-red-950/60 border border-red-800 text-red-300' : 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'}`}>{message.startsWith('Error') ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}<span>{message}</span></div>}
      {loading ? <p className="text-sm text-gray-400">{t('loading')}</p> : lots.length === 0 ? (
        <div className="p-6 bg-[#0a0f0d] border border-dashed border-[#1e2d26] rounded-xl text-center space-y-3 text-gray-400"><p>No available unlisted produce lots found.</p><p className="text-xs">Record a harvest first before creating a marketplace listing.</p><button onClick={() => router.push('/farmer/harvest')} className="px-4 py-2 bg-amber-600 text-white font-bold text-xs rounded-lg">+ Go Record Harvest</button></div>
      ) : (
        <form onSubmit={handleCreateListing} className="space-y-4">
          <div><label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Select Available Produce Lot</label><select value={selectedLotId} onChange={(e) => setSelectedLotId(e.target.value)} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white">{lots.map((lot) => <option key={lot.id} value={lot.id}>Lot {lot.id.slice(0, 8)} — {lot.quantity_kg} KG ({lot.quality_grade})</option>)}</select></div>
          {selectedLot && <div className="p-3 bg-[#0a0f0d] border border-emerald-950 rounded-xl text-xs text-emerald-300 space-y-1 font-mono"><p><strong>Lot ID:</strong> {selectedLot.id}</p><p><strong>Quantity:</strong> {selectedLot.quantity_kg} KG</p><p><strong>Quality:</strong> {selectedLot.quality_grade}</p></div>}
          <div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-semibold uppercase text-gray-400 mb-1">{t('askingPrice')} (₹ / KG)</label><input type="number" min="0" step="0.01" required value={askingPrice} onChange={(e) => setAskingPrice(e.target.value)} placeholder="26.50" className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white" /></div><div><label className="block text-xs font-semibold uppercase text-gray-400 mb-1">{t('minOrderQty')} (KG)</label><input type="number" min="0.01" step="0.01" required value={minOrderQty} onChange={(e) => setMinOrderQty(e.target.value)} placeholder="50" className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white" /></div></div>
          <button type="submit" disabled={submitting} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-950 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"><ShoppingCart className="w-5 h-5" /><span>{submitting ? t('loading') : t('sellProduce')}</span></button>
        </form>
      )}
    </div>
  );
}

export default function SellProducePage() {
  const { t } = useI18n();
  return <div className="max-w-2xl mx-auto space-y-6"><div className="text-center"><h1 className="text-2xl font-bold text-gray-100">{t('sellProduce')}</h1><p className="text-sm text-gray-400">Publish your verified produce lot to direct wholesale buyers across the network.</p></div><Suspense fallback={<p className="text-sm text-gray-400 text-center py-6">{t('loading')}</p>}><SellForm /></Suspense></div>;
}
