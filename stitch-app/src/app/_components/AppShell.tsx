'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BarChart3, Bot, Boxes, ClipboardList, Home, Leaf, LogOut, MapPinned, Menu, Package, Settings, ShoppingCart, Sprout, Truck, UserCircle, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { api, UserProfile } from '@/lib/api';

const nav = [
  ['/farmer/dashboard','Dashboard',Home],
  ['/farmer/farms','My farms',MapPinned],
  ['/produce','Produce',Package],
  ['/marketplace','Marketplace',ShoppingCart],
  ['/finance','Finance',BarChart3],
  ['/ai-assistant','AgriAI',Bot],
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const boot = async () => {
      try { const profile = await api.me(); setUser(profile); localStorage.setItem('agrimark_user', JSON.stringify(profile)); }
      catch { setUser(null); }
    };
    void boot();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut().catch(() => {});
    await api.logout().catch(() => {});
    localStorage.removeItem('agrimark_token'); localStorage.removeItem('agrimark_user');
    window.location.assign('/auth/login');
  };

  return <div className="app-stage">
    <header className="topbar"><div className="topbar-inner"><Link href="/" className="brand"><span className="logo"><Leaf/></span><span>AgriMark<small>{user?.role || 'Workspace'}</small></span></Link><button className="btn btn-secondary" style={{padding:'0 12px'}} onClick={()=>setMenu(v=>!v)}><Menu size={17}/><span style={{fontSize:12}}>Menu</span></button></div></header>
    <div className="dashboard">
      <aside className="sidebar">
        <div style={{padding:'4px 12px 14px',fontSize:10,textTransform:'uppercase',letterSpacing:'.15em',fontWeight:800,color:'#7a827d'}}>Workspace</div>
        {nav.map(([href,label,Icon])=>{const NavIcon=Icon as typeof Home; return <Link className="side-link" key={String(href)} href={String(href)}><NavIcon size={17}/>{String(label)}</Link>})}
        <div style={{marginTop:18,padding:'14px 12px',borderTop:'1px solid #e2ddd1'}}><button onClick={logout} className="side-link" style={{border:0,background:'transparent',width:'100%'}}><LogOut size={17}/> Sign out</button></div>
      </aside>
      <main className="content">{children}</main>
    </div>
    {menu && <div className="container" style={{position:'fixed',top:74,right:12,zIndex:50,maxWidth:340}}><div className="card" style={{boxShadow:'0 18px 45px rgba(27,77,62,.15)'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}><strong>AgriMark menu</strong><button className="btn btn-secondary" style={{padding:'0 11px',minHeight:40}} onClick={()=>setMenu(false)}><X size={16}/></button></div>{nav.map(([href,label,Icon])=>{const NavIcon=Icon as typeof Home;return <Link key={String(href)} href={String(href)} onClick={()=>setMenu(false)} className="side-link"><NavIcon size={17}/>{String(label)}</Link>})}<Link href="/auth/onboarding" className="side-link"><Sprout size={17}/> Role setup</Link></div></div>}
    <nav className="bottom-dock">{nav.slice(0,4).map(([href,label,Icon],i)=>{const DockIcon=Icon as typeof Home;return <Link className={`dock-item ${i===0?'active':''}`} key={String(href)} href={String(href)}><DockIcon size={17}/><span>{String(label)}</span></Link>})}</nav>
  </div>;
}
