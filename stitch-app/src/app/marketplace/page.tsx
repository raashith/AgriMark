'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { CardPanel } from '@/components/ui/CardPanel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/InputControls';
import { Search, Filter, MapPin, Tag, ArrowRight, RefreshCw } from 'lucide-react';

type Listing = { id:string; title:string; pricePerUnit:number; currency:string; minOrderQuantity:number; availableKg:number; grade:string; sellerName:string; cropName:string; district:string; state:string };

export default function LiveMarketplacePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const loadListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      if (selectedGrade !== 'all') params.set('grade', selectedGrade);
      const response = await fetch('/api/marketplace/listings?' + params.toString(), { cache: 'no-store' });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Could not load marketplace listings.');
      setListings(body.listings || []); setMessage('');
    } catch (err) { setMessage(err instanceof Error ? err.message : 'Could not load listings.'); setListings([]); }
    finally { setLoading(false); }
  }, [searchTerm, selectedGrade]);
  useEffect(() => { const timer = setTimeout(() => void loadListings(), 250); return () => clearTimeout(timer); }, [loadListings]);

  return <div className="space-y-6">
    <PageHeader title="AgriMark Live Mandi Marketplace" subtitle="Browse currently active farmer listings and order against verified available inventory." action={<Link href="/marketplace/new"><Button size="md"><Tag className="w-4 h-4" /><span>List Your Produce</span></Button></Link>} />
    <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#E7E5DC] bg-white p-4 shadow-sm sm:flex-row">
      <div className="relative w-full sm:w-96"><Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" /><input aria-label="Search listings" type="text" placeholder="Search produce or variety…" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="w-full rounded-xl border border-[#E7E5DC] bg-[#F6F4ED] py-2.5 pl-10 pr-4 text-xs outline-none focus:border-[#1B4D3E]" /></div>
      <div className="flex w-full items-center gap-2 sm:w-auto"><Filter className="h-4 w-4 text-[#1B4D3E]" /><span className="text-xs font-bold text-[#19201D]">Grade:</span>{['all','Grade A','Grade B','Grade C'].map(g=><button key={g} onClick={()=>setSelectedGrade(g)} className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${selectedGrade===g?'bg-[#1B4D3E] text-white':'bg-[#F6F4ED] text-gray-600 hover:bg-gray-200'}`}>{g==='all'?'All':g}</button>)}</div>
    </div>
    {message && <div role="status" className="rounded-xl border border-[#E7E5DC] bg-white p-3 text-sm text-[#1B4D3E]">{message}</div>}
    {loading ? <div className="grid grid-cols-1 gap-6 md:grid-cols-3">{[1,2,3].map(n=><div key={n} className="h-64 animate-pulse rounded-2xl border border-[#E7E5DC] bg-white p-5"><div className="mb-5 h-4 w-24 rounded bg-gray-200" /><div className="mb-3 h-6 w-3/4 rounded bg-gray-200" /><div className="mb-8 h-4 w-1/2 rounded bg-gray-200" /><div className="h-20 rounded bg-gray-100" /></div>)}</div> :
      listings.length===0 ? <CardPanel title="No active listings found"><div className="space-y-3 p-5 text-sm text-gray-500">There are no active listings matching your search in the live database. Check back later or create an RFQ to tell sellers what you need.<div><Link className="font-semibold text-[#1B4D3E] underline" href="/buyer/rfqs">Create a buyer RFQ</Link></div><Button variant="secondary" size="sm" onClick={()=>void loadListings()}><RefreshCw className="h-3.5 w-3.5" /> Refresh</Button></div></CardPanel> :
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">{listings.map(item=><CardPanel key={item.id} className="flex flex-col justify-between space-y-4 transition hover:border-[#1B4D3E]/40"><div className="space-y-3"><div className="flex items-center justify-between"><span className="font-mono text-xs font-bold text-[#1B4D3E]">LOT-{item.id.slice(0,8).toUpperCase()}</span><StatusBadge status={item.grade} /></div><div><h3 className="text-lg font-bold text-[#19201D]">{item.title}</h3><p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500"><MapPin className="h-3.5 w-3.5 text-[#1B4D3E]" />{[item.district,item.state].filter(Boolean).join(', ') || 'Location not provided'}</p></div><div className="space-y-2 rounded-xl bg-[#F6F4ED] p-3 text-xs"><div className="flex justify-between"><span className="text-gray-500">Available:</span><b className="font-mono">{item.availableKg.toLocaleString()} kg</b></div><div className="flex items-baseline justify-between"><span className="text-gray-500">Price:</span><b className="font-mono text-base text-[#1B4D3E]">{item.currency==='INR'?'₹':item.currency+' '}{item.pricePerUnit.toLocaleString('en-IN')} / kg</b></div><div className="flex justify-between border-t border-[#E7E5DC] pt-1 text-gray-500"><span>Minimum order</span><b>{item.minOrderQuantity.toLocaleString()} kg</b></div></div><p className="text-xs font-medium text-gray-600">{item.sellerName}</p></div><Link href={`/marketplace/listing/${item.id}`} className="pt-2"><Button size="md" className="w-full"><span>Inspect & Buy</span><ArrowRight className="h-4 w-4" /></Button></Link></CardPanel>)}</div>}
  </div>;
}
