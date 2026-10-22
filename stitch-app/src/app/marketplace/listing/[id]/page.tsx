'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { CardPanel } from '@/components/ui/CardPanel';
import { MetricCard } from '@/components/ui/MetricCard';
import { Button } from '@/components/ui/InputControls';
import { ShieldCheck, MapPin, Package, ShoppingCart, ArrowRight } from 'lucide-react';

type Listing = { id:string; title:string; pricePerUnit:number; currency:string; minOrderQuantity:number; availableKg:number; grade:string; sellerName:string; cropName:string; district:string; state:string };
export default function ListingDetailsPage() {
  const params = useParams<{id:string}>();
  const [listing,setListing] = useState<Listing|null>(null);
  const [loading,setLoading] = useState(true);
  const [message,setMessage] = useState('');
  useEffect(()=>{const load=async()=>{try{const response=await fetch('/api/marketplace/listings',{cache:'no-store'});const body=await response.json();if(!response.ok)throw new Error(body.error||'Could not load listing.');const item=(body.listings||[]).find((x:Listing)=>x.id===params.id);if(!item)throw new Error('This listing is no longer active or available.');setListing(item);}catch(err){setMessage(err instanceof Error?err.message:'Could not load listing.');}finally{setLoading(false);}};void load();},[params.id]);
  const money=(amount:number)=>'₹'+amount.toLocaleString('en-IN',{maximumFractionDigits:2});
  return <div className="space-y-6">
    {loading?<CardPanel><div className="h-48 animate-pulse rounded-xl bg-gray-100"/></CardPanel>:listing?<><PageHeader title={listing.title} subtitle={`Offered by ${listing.sellerName} · ${[listing.district,listing.state].filter(Boolean).join(', ')||'Location not provided'}`} action={<Link href={`/checkout/${listing.id}`}><Button size="lg"><ShoppingCart className="h-4 w-4"/> Buy / Place Order</Button></Link>}/>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3"><MetricCard title="Asking Price" value={money(listing.pricePerUnit)+' / kg'} subtitle={listing.currency} icon={<ShoppingCart className="h-5 w-5"/>}/><MetricCard title="Available Quantity" value={listing.availableKg.toLocaleString()+' kg'} subtitle={`Minimum ${listing.minOrderQuantity.toLocaleString()} kg`} icon={<Package className="h-5 w-5"/>}/><MetricCard title="Produce Grade" value={listing.grade} subtitle="From seller's lot record" icon={<ShieldCheck className="h-5 w-5"/>}/></div>
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3"><div className="space-y-6 md:col-span-2"><CardPanel title="Listing details"><h2 className="text-lg font-bold text-[#19201D]">{listing.cropName||listing.title}</h2><p className="mt-2 text-sm leading-relaxed text-gray-600">This listing is loaded from AgriMark’s live marketplace database. Available quantity and the minimum order are checked again when the order is submitted.</p><p className="mt-4 flex items-center gap-2 text-sm text-gray-500"><MapPin className="h-4 w-4 text-[#1B4D3E]"/>{[listing.district,listing.state].filter(Boolean).join(', ')||'Seller has not shared location'}</p></CardPanel></div><CardPanel title="Order protection"><div className="space-y-4"><div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900"><div className="mb-1 flex items-center gap-2 font-bold"><ShieldCheck className="h-4 w-4"/>Inventory validation</div>Orders require a signed-in buyer and are reserved server-side to prevent overselling.</div><Link href={`/checkout/${listing.id}`}><Button className="w-full" size="md">Continue to checkout <ArrowRight className="h-4 w-4"/></Button></Link></div></CardPanel></div></>:<CardPanel title="Listing unavailable"><p className="text-sm text-gray-600">{message}</p><div className="mt-4"><Link className="text-sm font-semibold text-[#1B4D3E] underline" href="/marketplace">Back to marketplace</Link></div></CardPanel>}
  </div>;
}
