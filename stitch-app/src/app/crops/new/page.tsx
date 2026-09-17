'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Leaf, Loader2 } from 'lucide-react';
import Link from 'next/link';
import AppShell from '@/app/_components/AppShell';
import ActionButton from '@/app/_components/ActionButton';
import { api, Cultivation } from '@/lib/api';

export default function NewCropEntryPage(){
  const [items,setItems]=useState<Cultivation[]>([]); const [loading,setLoading]=useState(true); const [selected,setSelected]=useState(''); const [error,setError]=useState('');
  useEffect(()=>{void api.cultivations().then(rows=>{setItems(rows);if(rows[0])setSelected(rows[0].crop_id)}).catch(e=>setError(e instanceof Error?e.message:'Unable to load crop plans.')).finally(()=>setLoading(false))},[]);
  const continueFlow=()=>{if(!selected){setError('Select a crop first.');return;} window.location.assign(`/crops/${selected}/harvest/new`)};
  return <AppShell><div className="page-title"><div><Link href="/produce" style={{display:'inline-flex',gap:7,alignItems:'center',fontSize:12,fontWeight:800,color:'#68716b'}}><ArrowLeft size={15}/> Produce inventory</Link><div className="eyebrow" style={{marginTop:14}}>Harvest entry</div><h1>Select the crop to record.</h1><p style={{color:'#707873',margin:'6px 0 0'}}>Choose an existing cultivation and continue to the traceable harvest capture.</p></div></div><div className="card" style={{maxWidth:760}}>{loading?<div className="loading"><Loader2 size={22}/> Loading cultivations…</div>:items.length===0?<div className="empty"><Leaf size={24}/><h3 style={{marginTop:8}}>No cultivations yet</h3><p>Create a farm and crop cultivation first, then return here to record a harvest.</p><Link href="/farmer/dashboard" className="btn btn-primary" style={{marginTop:16}}>Go to dashboard</Link></div>:<><div className="field"><label>Crop cultivation</label><select value={selected} onChange={e=>setSelected(e.target.value)}>{items.map(item=><option key={item.id} value={item.crop_id}>{item.crop_id} · Farm {item.farm_id.slice(0,8)} · {item.status||'planned'}</option>)}</select></div>{error&&<div className="error" style={{marginTop:12}}>{error}</div>}<ActionButton className="btn btn-primary" type="button" style={{marginTop:16}} onClick={continueFlow} actionName="harvest:select-crop">Continue to harvest <ArrowRight size={16}/></ActionButton></>}</div></AppShell>
}
