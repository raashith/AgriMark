'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, MapPin, Plus, Ruler, Sprout } from 'lucide-react';
import AppShell from '@/app/_components/AppShell';
import { api, Farm } from '@/lib/api';
export default function FarmsPage(){
 const [farms,setFarms]=useState<Farm[]>([]); const [loading,setLoading]=useState(true);
 useEffect(()=>{api.me().then(me=>api.farms(me.id)).then(setFarms).catch(()=>setFarms([])).finally(()=>setLoading(false))},[]);
 return <AppShell><div className="page-title"><div><div className="eyebrow">Farm passport</div><h1>My farm lands</h1><p style={{color:'#707873',margin:'6px 0 0'}}>Keep land, location and production context together.</p></div><Link href="/farm/new" className="btn btn-primary"><Plus size={16}/> Add farm land</Link></div>
 {loading?<div className="loading"><Loader2 size={24}/></div>:farms.length===0?<div className="card empty"><MapPin size={26}/><div style={{fontWeight:800,color:'#2f3833',marginTop:10}}>No farm lands found</div><Link href="/farm/new" className="btn btn-primary" style={{marginTop:18}}>Add your first land</Link></div>:<div className="grid-3">{farms.map(f=><Link href={`/farm/${f.id}`} key={f.id} className="card"><div className="icon-tile"><MapPin size={19}/></div><h3>{f.name||'Untitled farm'}</h3><p>{[f.village,f.district,f.state].filter(Boolean).join(', ')||'Location not added'}</p><div style={{display:'flex',gap:14,marginTop:15,fontSize:12,color:'#68706b'}}><span><Ruler size={13} style={{verticalAlign:'-2px'}}/> {f.area_acres??'—'} acres</span><span><Sprout size={13} style={{verticalAlign:'-2px'}}/> {f.soil_type||'Soil not recorded'}</span></div></Link>)}</div>}
 </AppShell>;
}
