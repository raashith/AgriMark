'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, CloudSun, Droplets, Loader2, MapPin, PackageCheck, Sprout, TrendingUp } from 'lucide-react';
import AppShell from '@/app/_components/AppShell';
import { api, Cultivation, Farm, ProduceLot } from '@/lib/api';

export default function FarmerDashboardPage() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [cultivations, setCultivations] = useState<Cultivation[]>([]);
  const [lots, setLots] = useState<ProduceLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    Promise.all([api.me(), api.cultivations(), api.produceLots()])
      .then(async ([me, c, l]) => { const f = await api.farms(me.id).catch(()=>[]); setFarms(f); setCultivations(c); setLots(l); })
      .catch((err)=>setError(err instanceof Error ? err.message : 'Unable to load dashboard.'))
      .finally(()=>setLoading(false));
  }, []);
  return <AppShell>
    <div className="page-title"><div><div className="eyebrow">Farmer command centre</div><h1>Your farm, at a glance.</h1><p style={{color:'#707873',margin:'6px 0 0'}}>A connected view of land, crop cycles and produce readiness.</p></div><Link href="/farm/new" className="btn btn-primary"><Sprout size={16}/> Add farm</Link></div>
    {error && <div className="error" style={{marginBottom:16}}>{error}</div>}
    {loading ? <div className="loading"><Loader2 size={24}/></div> : <>
      <div className="stats">
        <div className="stat-card"><small>Farm lands</small><strong>{farms.length}</strong></div>
        <div className="stat-card"><small>Active crop cycles</small><strong>{cultivations.filter(c=>c.status==='active').length}</strong></div>
        <div className="stat-card"><small>Produce lots</small><strong>{lots.length}</strong></div>
        <div className="stat-card"><small>Available produce</small><strong>{Math.round(lots.reduce((n,l)=>n+Number(l.available_quantity ?? l.quantity ?? 0),0)).toLocaleString()}</strong></div>
      </div>

      <div className="grid-3">
        <div className="card"><div className="icon-tile"><CloudSun size={20}/></div><h3>Field conditions</h3><p>Use the live weather workflow for operational checks before irrigation, scouting and harvest.</p><Link href="/ai-assistant" className="side-link" style={{paddingLeft:0,marginTop:10}}>Ask AgriAI <ArrowRight size={14}/></Link></div>
        <div className="card"><div className="icon-tile"><TrendingUp size={20}/></div><h3>Market pulse</h3><p>Check current marketplace listings and price signals before deciding where to sell.</p><Link href="/marketplace" className="side-link" style={{paddingLeft:0,marginTop:10}}>Explore market <ArrowRight size={14}/></Link></div>
        <div className="card"><div className="icon-tile"><PackageCheck size={20}/></div><h3>Produce readiness</h3><p>{lots.length ? `${lots.length} produce lot${lots.length===1?'':'s'} are recorded in your account.` : 'No produce lots yet. Add your first harvest record when produce is ready.'}</p><Link href="/produce" className="side-link" style={{paddingLeft:0,marginTop:10}}>Open produce ledger <ArrowRight size={14}/></Link></div>
      </div>

      <div className="section" style={{paddingTop:24}}><div className="section-head"><div><h2>My farms</h2><p>Use your farm records as the foundation for every crop and financial workflow.</p></div><Link href="/farmer/farms" className="btn btn-secondary">View all</Link></div>
        {farms.length===0 ? <div className="card empty"><MapPin size={24} style={{marginBottom:8}}/><div style={{fontWeight:800,color:'#313934'}}>No farms added yet</div><div style={{marginTop:5}}>Create your first farm land record to unlock crop planning, scouting and finance.</div><Link href="/farm/new" className="btn btn-primary" style={{marginTop:18}}>Add first farm</Link></div> : <div className="grid-3">{farms.slice(0,6).map((farm)=> <Link href={`/farm/${farm.id}`} className="card" key={farm.id}><div style={{display:'flex',justifyContent:'space-between',gap:10}}><div><h3>{farm.name || 'Untitled farm'}</h3><p><MapPin size={13} style={{verticalAlign:'-2px'}}/> {[farm.village,farm.district,farm.state].filter(Boolean).join(', ') || 'Location not added'}</p></div><span className="badge">Active</span></div><div style={{display:'flex',gap:16,marginTop:16,fontSize:12,color:'#6f7772'}}><span><strong style={{color:'#19201D'}}>{farm.area_acres ?? '—'}</strong> acres</span><span><strong style={{color:'#19201D'}}>{farm.soil_type ?? '—'}</strong> soil</span></div></Link>)}</div>}
      </div>
    </>}
  </AppShell>;
}
