'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2, Package, Plus, ShieldCheck } from 'lucide-react';
import AppShell from '@/app/_components/AppShell';
import { api, ProduceLot } from '@/lib/api';

export default function ProducePage(){
 const [lots,setLots]=useState<ProduceLot[]>([]); const [loading,setLoading]=useState(true);
 useEffect(()=>{api.produceLots().then(setLots).catch(()=>setLots([])).finally(()=>setLoading(false))},[]);
 return <AppShell><div className="page-title"><div><div className="eyebrow">Produce inventory</div><h1>Lot ledger</h1><p style={{color:'#707873',margin:'6px 0 0'}}>Track quantity, grade, availability and harvest status before listing.</p></div><Link href="/crops/new" className="btn btn-primary"><Plus size={16}/> Add lot</Link></div>
 {loading?<div className="loading"><Loader2 size={24}/></div>:lots.length===0?<div className="card empty"><Package size={26} style={{marginBottom:8}}/><div style={{fontWeight:800,color:'#2f3833'}}>No produce lots logged</div><div style={{marginTop:5}}>Create a harvest record to start your traceable produce inventory.</div><Link href="/crops/new" className="btn btn-primary" style={{marginTop:18}}>Record harvest</Link></div>:<div className="table-wrap"><table><thead><tr><th>Lot</th><th>Quantity</th><th>Available</th><th>Grade</th><th>Status</th><th>Action</th></tr></thead><tbody>{lots.map(l=><tr key={l.id}><td><strong style={{fontSize:13}}>{l.id.slice(0,8).toUpperCase()}</strong><div style={{color:'#79817c',fontSize:11,marginTop:3}}><ShieldCheck size={12} style={{verticalAlign:'-2px'}}/> Traceable</div></td><td>{Number(l.quantity||0).toLocaleString()} {l.unit||'kg'}</td><td>{Number(l.available_quantity??l.quantity??0).toLocaleString()} {l.unit||'kg'}</td><td>{l.quality_grade||'Unrated'}</td><td><span className="badge">{l.status||'available'}</span></td><td><Link className="side-link" style={{padding:0}} href={`/product/${l.id}`}>Details <ArrowRight size={14}/></Link></td></tr>)}</tbody></table></div>}
 </AppShell>
}
