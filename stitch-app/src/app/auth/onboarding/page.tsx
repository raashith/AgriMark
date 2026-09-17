'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, BriefcaseBusiness, Leaf, ShieldCheck, Sprout, Truck, Users } from 'lucide-react';

const roles = [
  ['farmer','Farmer','Manage farms, crops, harvests and market sales.',Sprout],
  ['buyer','Buyer','Discover produce, post RFQs and manage procurement.',BriefcaseBusiness],
  ['fpo','FPO','Coordinate members, produce lots and group trade.',Users],
  ['logistics','Logistics','Track movement, cold chain and gate workflows.',Truck],
];

export default function OnboardingPage() {
  const [role, setRole] = useState('farmer');
  const selected = roles.find((item) => item[0] === role);
  const SelectedIcon = (selected?.[3] || Sprout) as typeof Sprout;
  return <div className="login-page"><div className="login-card" style={{maxWidth:720}}>
    <Link href="/" style={{display:'inline-flex',alignItems:'center',gap:7,fontSize:12,fontWeight:800,color:'#68716b'}}><Leaf size={15}/> AgriMark</Link>
    <div style={{marginTop:24}}><div className="eyebrow">Welcome to the ecosystem</div><h2 style={{fontSize:30,margin:'8px 0'}}>Choose your AgriMark role</h2><p style={{margin:0,color:'#717974'}}>Your role shapes the workspace, navigation and data you see. You can continue into the dedicated experience after this choice.</p></div>
    <div className="grid-4" style={{marginTop:24}}>{roles.map(([id,name,desc,Icon])=>{const RoleIcon=Icon as typeof Sprout;return <button key={String(id)} onClick={()=>setRole(String(id))} className="card" style={{textAlign:'left',borderColor:role===id?'#3E7B54':'#E2DDD1',boxShadow:role===id?'0 0 0 3px rgba(62,123,84,.10)':'none',background:role===id?'#F1F6F2':'#fff'}}><div className="icon-tile"><RoleIcon size={21}/></div><strong>{String(name)}</strong><p style={{marginTop:7}}>{String(desc)}</p></button>})}</div>
    <div style={{marginTop:20,padding:16,borderRadius:18,background:'#fbfaf7',border:'1px solid #e2ddd1',display:'flex',gap:12,alignItems:'center'}}><div className="icon-tile" style={{margin:0}}><SelectedIcon size={20}/></div><div style={{flex:1}}><strong>{String(selected?.[1])} workspace selected</strong><div style={{fontSize:12,color:'#737b76'}}>Next: complete the essentials for this role.</div></div><ShieldCheck size={18} color="#257042"/></div>
    <div className="cta-row"><Link href={role==='farmer'?'/onboarding/farmer':'/marketplace'} className="btn btn-primary">Continue as {String(selected?.[1])} <ArrowRight size={16}/></Link></div>
  </div></div>;
}
