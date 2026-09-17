'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Filter, Loader2, MapPin, Search, ShieldCheck, ShoppingCart, Tag, X } from 'lucide-react';
import AppShell from '@/app/_components/AppShell';
import ActionButton from '@/app/_components/ActionButton';
import { api, Listing } from '@/lib/api';

export default function MarketplacePage() {
  const [items, setItems] = useState<Listing[]>([]);
  const [prices, setPrices] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState('');
  const load = async () => {
    setError('');
    try {
      const [list, market] = await Promise.all([api.listings(), api.marketPrices().catch(() => [])]);
      setItems(list); setPrices(market);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load marketplace.');
    } finally { setLoading(false); }
  };
  useEffect(()=>{ void load(); },[]);
  const filtered = useMemo(()=>items.filter(x=>`${x.title||''}`.toLowerCase().includes(q.toLowerCase())),[items,q]);
  return <AppShell>
    <div className="page-title"><div><div className="eyebrow">Agrimark live marketplace</div><h1>Buy and sell with context.</h1><p style={{color:'#707873',margin:'6px 0 0'}}>Produce listings connect back to lot records, farmer identity and operational workflows.</p></div><Link href="/produce" prefetch className="btn btn-primary">List produce <ArrowRight size={16}/></Link></div>
    <div className="card" style={{padding:12,marginBottom:18}}><div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:10}}><div style={{position:'relative'}}><Search size={17} style={{position:'absolute',left:14,top:16,color:'#7d8580'}}/><input aria-label="Search marketplace" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search produce, crop, grade…" style={{width:'100%',minHeight:48,border:'1px solid #e2ddd1',borderRadius:13,paddingLeft:42}}/></div><div style={{display:'flex',gap:8}}><ActionButton className="btn btn-secondary" onClick={()=>setShowFilters(v=>!v)} actionName="marketplace:filters"><Filter size={16}/> Filters</ActionButton><ActionButton className="btn btn-secondary" onClick={load} disabled={loading} actionName="marketplace:refresh">Refresh</ActionButton></div></div>{showFilters&&<div style={{marginTop:10,padding:12,borderTop:'1px solid #eee9de',display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:12,color:'#66706a'}}>Filters are ready for crop/grade/location refinements.<button className="btn btn-secondary" style={{minHeight:38,padding:'0 11px'}} onClick={()=>setShowFilters(false)} aria-label="Close filters"><X size={15}/></button></div>}</div>
    {error && <div className="error" style={{marginBottom:16}} aria-live="polite">{error}</div>}
    {prices.length>0 && <div className="market-strip" style={{marginBottom:18}}>{prices.slice(0,4).map((p:any,index)=> <div className="ticker" key={p.id||index}><small>{p.market_name||p.crop_name||'Market signal'}</small><strong>₹{Number(p.modal_price ?? p.price ?? 0).toLocaleString()}</strong></div>)}</div>}
    {loading ? <div className="loading"><Loader2 size={24}/></div> : filtered.length===0 ? <div className="card empty"><ShoppingCart size={26} style={{marginBottom:9}}/><div style={{fontWeight:800,color:'#2f3833'}}>No active listings found</div><div style={{marginTop:5}}>Try another search or list your own produce lot.</div><Link href="/produce" prefetch className="btn btn-primary" style={{marginTop:18}}>List produce</Link></div> : <div className="grid-3">{filtered.map((item)=><Link className="card" href={`/product/${item.id}`} prefetch key={item.id}><div style={{display:'flex',justifyContent:'space-between',gap:12}}><div><span className="badge"><ShieldCheck size={12} style={{marginRight:4}}/>Verified workflow</span><h3 style={{marginTop:12}}>{item.title || 'Produce listing'}</h3></div><Tag size={17} color="#E5A93C"/></div><div style={{marginTop:18,display:'flex',justifyContent:'space-between',alignItems:'end'}}><div><div style={{fontSize:11,color:'#7a827d'}}>PRICE</div><strong style={{fontFamily:'JetBrains Mono',fontSize:23}}>₹{Number(item.price_per_unit||0).toLocaleString()}</strong><span style={{fontSize:11,color:'#737b76'}}> / {item.currency||'unit'}</span></div><span className="side-link" style={{padding:0}}>View <ArrowRight size={14}/></span></div><div style={{marginTop:12,fontSize:12,color:'#6f7772'}}><MapPin size={13} style={{verticalAlign:'-2px'}}/> Farm-linked lot · Min order {item.min_order_quantity ?? 1}</div></Link>)}</div>}
  </AppShell>;
}
