'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { CardPanel } from '@/components/ui/CardPanel';
import { Input, Button } from '@/components/ui/InputControls';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Plus, Check, RefreshCw } from 'lucide-react';

type RFQ = { id: string; quantity: number; unit: string; target_price: number | null; delivery_district: string | null; delivery_state: string | null; deadline: string | null; status: string; created_at: string; crops?: { name?: string } | null };

export default function BuyerRFQPage() {
  const [showNewModal, setShowNewModal] = useState(false);
  const [cropName, setCropName] = useState('');
  const [targetQty, setTargetQty] = useState('1000');
  const [targetPrice, setTargetPrice] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [deadline, setDeadline] = useState('');
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadRFQs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/buyer/rfqs', { cache: 'no-store' });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Could not load RFQs.');
      setRfqs(body.rfqs || []); setMessage('');
    } catch (err) { setMessage(err instanceof Error ? err.message : 'Could not load RFQs.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void loadRFQs(); }, [loadRFQs]);

  const publishRFQ = async () => {
    setMessage('');
    const quantity = Number(targetQty);
    if (!cropName.trim() || !Number.isFinite(quantity) || quantity <= 0 || (targetPrice !== '' && (!Number.isFinite(Number(targetPrice)) || Number(targetPrice) < 0)) || !deadline || new Date(deadline) <= new Date()) {
      setMessage('Enter a crop, positive quantity, optional valid target price, and a future deadline.'); return;
    }
    setSaving(true);
    try {
      const response = await fetch('/api/buyer/rfqs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cropName: cropName.trim(), quantity, targetPrice, district: district.trim(), state: state.trim(), deadline }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Could not publish RFQ.');
      setShowNewModal(false); setCropName(''); setTargetQty('1000'); setTargetPrice(''); setDistrict(''); setState(''); setDeadline('');
      setMessage('RFQ published successfully.'); await loadRFQs();
    } catch (err) { setMessage(err instanceof Error ? err.message : 'Could not publish RFQ.'); }
    finally { setSaving(false); }
  };

  return <div className="space-y-6">
    <PageHeader title="Buyer RFQ Procurement Desk" subtitle="Publish your produce requirements and manage real procurement requests." action={<Button size="md" onClick={() => setShowNewModal(true)}><Plus className="w-4 h-4" /><span>Issue New RFQ</span></Button>} />
    {message && <div role="status" className="rounded-xl border border-[#E7E5DC] bg-white p-3 text-sm text-[#1B4D3E]">{message}</div>}
    <CardPanel title="Your Procurement RFQs">
      <div className="mb-4 flex justify-end"><Button size="sm" variant="secondary" onClick={() => void loadRFQs()}><RefreshCw className="h-3.5 w-3.5" /> Refresh</Button></div>
      {loading ? <p className="p-6 text-sm text-gray-500">Loading your RFQs…</p> : rfqs.length === 0 ? <p className="p-6 text-sm text-gray-500">No RFQs yet. Issue a new RFQ to start receiving offers from sellers.</p> :
        <div className="space-y-3">{rfqs.map((rfq) => <div key={rfq.id} className="flex flex-col justify-between gap-3 rounded-xl border border-[#E7E5DC] bg-[#F6F4ED] p-4 md:flex-row md:items-center">
          <div className="space-y-1"><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs font-bold text-[#1B4D3E]">RFQ-{rfq.id.slice(0,8).toUpperCase()}</span><b className="text-sm text-[#19201D]">{rfq.crops?.name || 'Crop requirement'}</b><StatusBadge status={rfq.status} /></div>
            <p className="text-xs text-gray-600">Quantity: {Number(rfq.quantity).toLocaleString()} {rfq.unit} · Target: {rfq.target_price == null ? 'Open to offers' : '₹' + Number(rfq.target_price).toLocaleString() + ' / ' + rfq.unit} · Delivery: {[rfq.delivery_district, rfq.delivery_state].filter(Boolean).join(', ') || 'Not specified'}</p>
            <p className="text-xs text-gray-500">Deadline: {rfq.deadline ? new Date(rfq.deadline).toLocaleDateString('en-IN') : 'Not specified'}</p>
          </div></div>)}</div>}
    </CardPanel>
    {showNewModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-xl">
      <h3 className="text-lg font-bold text-[#19201D]">Create Procurement RFQ</h3>
      <Input label="Crop name (use AgriMark catalogue name)" value={cropName} onChange={(e) => setCropName(e.target.value)} />
      <div className="grid grid-cols-2 gap-3"><Input label="Target Quantity (kg)" type="number" value={targetQty} onChange={(e) => setTargetQty(e.target.value)} /><Input label="Target Price (₹/kg, optional)" type="number" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-3"><Input label="Delivery District" value={district} onChange={(e) => setDistrict(e.target.value)} /><Input label="Delivery State" value={state} onChange={(e) => setState(e.target.value)} /></div>
      <Input label="Delivery Deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
      <div className="flex justify-end gap-2 pt-2"><Button variant="secondary" onClick={() => setShowNewModal(false)} disabled={saving}>Cancel</Button><Button onClick={() => void publishRFQ()} disabled={saving}><Check className="h-4 w-4" />{saving ? 'Publishing…' : 'Publish RFQ'}</Button></div>
    </div></div>}
  </div>;
}
