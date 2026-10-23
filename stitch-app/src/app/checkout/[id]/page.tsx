'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { CardPanel } from '@/components/ui/CardPanel';
import { Button } from '@/components/ui/InputControls';
import { ShieldCheck, ShoppingCart, ArrowLeft } from 'lucide-react';

type Listing = { id:string; title:string; pricePerUnit:number; currency:string; minOrderQuantity:number; availableKg:number; grade:string; sellerName:string; cropName:string; district:string; state:string };
export default function BuyerCheckoutPage() {
  const params = useParams<{id:string}>();
  const router = useRouter();
  const [listing,setListing] = useState<Listing|null>(null);
  const [quantity,setQuantity] = useState('1000');
  const [address,setAddress] = useState('');
  const [note,setNote] = useState('');
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [message,setMessage] = useState('');
  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/marketplace/listings', { cache:'no-store' });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || 'Could not load listing.');
        const current = (body.listings || []).find((x:Listing)=>x.id===params.id);
        if (!current) throw new Error('This listing is no longer available.');
        setListing(current); setQuantity(String(current.minOrderQuantity));
      } catch(err) { setMessage(err instanceof Error ? err.message : 'Could not load listing.'); }
      finally { setLoading(false); }
    };
    void load();
  },[params.id]);
  const qty = Number(quantity);
  const total = listing && Number.isFinite(qty) ? listing.pricePerUnit * qty : 0;
  const placeOrder = async () => {
    setMessage('');
    if (!listing || !Number.isFinite(qty) || qty < listing.minOrderQuantity || qty > listing.availableKg || !address.trim()) {
      setMessage('Enter a quantity within available stock and the minimum order, plus a delivery address.'); return;
    }
    setSaving(true);
    try {
      const response = await fetch('/api/marketplace/order', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({listingId:listing.id,quantityKg:qty,deliveryAddress:address.trim(),note:note.trim()}) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Order could not be placed.');
      router.push('/buyer/dashboard?orderPlaced=1');
    } catch(err) { setMessage(err instanceof Error ? err.message : 'Order could not be placed.'); }
    finally { setSaving(false); }
  };
  return <div className="space-y-6">
    <PageHeader title="Secure Order Checkout" subtitle="Review the produce, quantity and delivery destination before creating your order." action={<Link href={`/marketplace/listing/${params.id}`}><Button variant="secondary" size="sm"><ArrowLeft className="h-4 w-4"/> Back to listing</Button></Link>} />
    {message && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{message}</div>}
    {loading ? <CardPanel><div className="h-40 animate-pulse rounded-xl bg-gray-100"/></CardPanel> : listing && <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2"><CardPanel title="Order details"><h2 className="text-xl font-bold text-[#19201D]">{listing.title}</h2><p className="mt-1 text-sm text-gray-500">{listing.sellerName} · {[listing.district,listing.state].filter(Boolean).join(', ')}</p><div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-xl bg-[#F6F4ED] p-3"><p className="text-xs text-gray-500">Price per kg</p><p className="text-lg font-bold text-[#1B4D3E]">₹{listing.pricePerUnit.toLocaleString('en-IN')}</p></div><div className="rounded-xl bg-[#F6F4ED] p-3"><p className="text-xs text-gray-500">Available</p><p className="text-lg font-bold">{listing.availableKg.toLocaleString()} kg</p></div></div>
        <label className="mt-5 block text-sm font-semibold text-[#19201D]">Order quantity (kg)<input type="number" min={listing.minOrderQuantity} max={listing.availableKg} step="1" value={quantity} onChange={e=>setQuantity(e.target.value)} className="mt-1 w-full rounded-xl border border-[#E7E5DC] bg-white p-3 outline-none focus:border-[#1B4D3E]"/></label><p className="mt-1 text-xs text-gray-500">Minimum order: {listing.minOrderQuantity.toLocaleString()} kg</p>
        <label className="mt-4 block text-sm font-semibold text-[#19201D]">Delivery address<textarea required maxLength={1000} rows={3} value={address} onChange={e=>setAddress(e.target.value)} placeholder="Full delivery address, district, state and PIN code" className="mt-1 w-full rounded-xl border border-[#E7E5DC] bg-white p-3 outline-none focus:border-[#1B4D3E]"/></label>
        <label className="mt-4 block text-sm font-semibold text-[#19201D]">Note to seller (optional)<textarea maxLength={500} rows={2} value={note} onChange={e=>setNote(e.target.value)} placeholder="Preferred delivery window or handling notes" className="mt-1 w-full rounded-xl border border-[#E7E5DC] bg-white p-3 outline-none focus:border-[#1B4D3E]"/></label>
      </CardPanel></div>
      <div><CardPanel title="Order summary"><div className="space-y-4"><div className="flex justify-between text-sm"><span className="text-gray-500">Quantity</span><b>{Number.isFinite(qty)&&qty>0?qty.toLocaleString():'—'} kg</b></div><div className="flex justify-between text-sm"><span className="text-gray-500">Price</span><b>₹{listing.pricePerUnit.toLocaleString('en-IN')} / kg</b></div><div className="border-t border-[#E7E5DC] pt-4"><div className="flex justify-between"><span className="font-semibold">Estimated total</span><b className="text-xl text-[#1B4D3E]">₹{Math.max(total,0).toLocaleString('en-IN',{maximumFractionDigits:2})}</b></div><p className="mt-1 text-xs text-gray-500">Final logistics charges, if any, are handled separately.</p></div><div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900"><div className="mb-1 flex items-center gap-2 font-bold"><ShieldCheck className="h-4 w-4"/>Stock-checked order request</div>AgriMark rechecks current stock during checkout to prevent overselling. This screen does not collect or transfer payment.</div><Button size="lg" className="w-full" disabled={saving||qty<listing.minOrderQuantity||qty>listing.availableKg||!address.trim()} onClick={()=>void placeOrder()}><ShoppingCart className="h-4 w-4"/>{saving?'Placing order…':'Place order request'}</Button></div></CardPanel></div>
    </div>}
  </div>;
}
