'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { CardPanel } from '@/components/ui/CardPanel';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/InputControls';
import { ShoppingCart, Truck, Plus, ShieldCheck, RefreshCw } from 'lucide-react';

type Order = { id:string; listing_id:string; seller_id:string; quantity_kg:number; total_price:number; currency:string; status:string; delivery_address:any; created_at:string; listing?:{title?:string}|null; seller?:{full_name?:string}|null };

export default function BuyerDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/buyer/orders', { cache: 'no-store' }); const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Could not load orders.');
      setOrders(body.orders || []); setMessage('');
    } catch (err) { setMessage(err instanceof Error ? err.message : 'Could not load buyer orders.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void loadOrders(); }, [loadOrders]);
  const activeOrders = orders.filter(o => !['delivered','cancelled','rejected'].includes(o.status));
  const totalKg = activeOrders.reduce((s,o)=>s+Number(o.quantity_kg||0),0);
  const totalValue = activeOrders.reduce((s,o)=>s+Number(o.total_price||0),0);

  return <div className="space-y-6">
    <PageHeader title="Buyer Procurement Dashboard" subtitle="Track your actual orders, order value and fulfilment status." action={<div className="flex gap-2"><Link href="/buyer/rfqs"><Button variant="secondary" size="md"><Plus className="w-4 h-4" /><span>Issue New RFQ</span></Button></Link><Link href="/marketplace"><Button size="md"><ShoppingCart className="w-4 h-4" /><span>Browse Marketplace</span></Button></Link></div>} />
    {message && <div role="status" className="rounded-xl border border-[#E7E5DC] bg-white p-3 text-sm text-[#1B4D3E]">{message}</div>}
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3"><MetricCard title="Active Procurements" value={loading?'—':totalKg.toLocaleString()+' kg'} subtitle={loading?'Loading orders':activeOrders.length+' active orders'} icon={<ShoppingCart className="w-5 h-5" />} /><MetricCard title="Order Value" value={loading?'—':'₹'+Math.round(totalValue).toLocaleString('en-IN')} subtitle="Calculated from your orders" icon={<ShieldCheck className="w-5 h-5" />} /><MetricCard title="Orders In Progress" value={loading?'—':String(activeOrders.filter(o=>['processing','ready_for_dispatch','dispatched','in_transit'].includes(o.status)).length)} subtitle="Processing through delivery" icon={<Truck className="w-5 h-5" />} /></div>
    <CardPanel title="Your Orders & Dispatches"><div className="mb-4 flex justify-end"><Button size="sm" variant="secondary" onClick={() => void loadOrders()}><RefreshCw className="h-3.5 w-3.5" /> Refresh</Button></div>
      {loading ? <p className="p-6 text-sm text-gray-500">Loading orders…</p> : orders.length===0 ? <div className="p-6 text-sm text-gray-500">You have not placed an order yet. <Link className="font-semibold text-[#1B4D3E] underline" href="/marketplace">Browse the marketplace</Link> to buy available produce.</div> :
        <div className="space-y-3">{orders.map(o=><div key={o.id} className="flex flex-col justify-between gap-3 rounded-xl border border-[#E7E5DC] bg-[#F6F4ED] p-4 md:flex-row md:items-center"><div className="space-y-1"><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs font-bold text-[#1B4D3E]">ORD-{o.id.slice(0,8).toUpperCase()}</span><b className="text-sm text-[#19201D]">{o.listing?.title || 'Produce order'}</b><StatusBadge status={o.status} /></div><p className="text-xs text-gray-500">Seller: {o.seller?.full_name || 'AgriMark seller'} · {Number(o.quantity_kg).toLocaleString()} kg · Placed {new Date(o.created_at).toLocaleDateString('en-IN')}</p></div><div className="text-left md:text-right"><p className="font-mono text-sm font-extrabold text-[#19201D]">{o.currency==='INR'?'₹':o.currency+' '}{Number(o.total_price).toLocaleString('en-IN')}</p></div></div>)}</div>}
    </CardPanel>
  </div>;
}
