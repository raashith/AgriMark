'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BarChart3, Bot, BrainCircuit, Leaf, MapPinned, ShieldCheck, Sprout, Store, Truck, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth';

function usePointerMotion() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.matchMedia('(pointer:fine)').matches) return;
    let raf = 0, tx = 0, ty = 0, x = 0, y = 0;
    const move = (e: PointerEvent) => { tx = e.clientX / window.innerWidth - .5; ty = e.clientY / window.innerHeight - .5; };
    const tick = () => { x += (tx-x)*.05; y += (ty-y)*.05; el.style.setProperty('--mx', x.toFixed(4)); el.style.setProperty('--my', y.toFixed(4)); raf = requestAnimationFrame(tick); };
    window.addEventListener('pointermove', move, { passive: true }); tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('pointermove', move); };
  }, []);
  return ref;
}

export default function HomePage() {
  const { isAuthenticated, role, user } = useAuth();
  const rootRef = usePointerMotion();
  const [activeScene, setActiveScene] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const scenes = [
    { title:'FIELD', label:'Live crop intelligence', tone:'green' },
    { title:'MARKET', label:'Price & demand signals', tone:'gold' },
    { title:'ROUTE', label:'Traceable movement', tone:'blue' },
  ];
  const workspaceHref = useMemo(() => {
    if (!isAuthenticated) return '/dashboard';
    switch (role || user?.role) {
      case 'farmer': return '/farmer/dashboard';
      case 'buyer': return '/buyer/marketplace';
      case 'fpo': return '/dashboard';
      case 'logistics': return '/logistics/deliveries';
      case 'admin': return '/admin/dashboard';
      default: return '/dashboard';
    }
  }, [isAuthenticated, role, user?.role]);
  const workspaceLabel = isAuthenticated ? \`OPEN \${(user?.role || role || 'USER').toUpperCase()} WORKSPACE\` : 'OPEN DASHBOARD';
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const id = window.setInterval(() => setActiveScene(s => (s + 1) % scenes.length), 5200);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => { document.body.style.overflow = menuOpen ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [menuOpen]);

  return (
    <main ref={rootRef} className="agri3d-page">
      <div className="agri3d-bg" aria-hidden="true">
        <div className={\`agri3d-scene agri3d-scene-\${scenes[activeScene].tone}\`}>
          <div className="agri3d-horizon" />
          <div className="agri3d-sun" />
          <div className="agri3d-mist agri3d-mist-a" />
          <div className="agri3d-mist agri3d-mist-b" />
          <div className="agri3d-field agri3d-field-back" />
          <div className="agri3d-field agri3d-field-mid" />
          <div className="agri3d-field agri3d-field-front" />
          <div className="agri3d-orbit agri3d-orbit-a" />
          <div className="agri3d-orbit agri3d-orbit-b" />
        </div>
        <div className="agri3d-noise" />
      </div>

      <header className={\`agri3d-nav \${menuOpen ? 'is-open' : ''}\`}>
        <Link href="/" className="agri3d-logo" onClick={closeMenu}><span className="agri3d-logo-mark"><Leaf size={20}/></span><span>AgriMark<span>.ai</span></span></Link>
        <nav className="agri3d-links">
          <a href="#platform" onClick={closeMenu}>Platform</a>
          <a href="#intelligence" onClick={closeMenu}>Intelligence</a>
          <a href="#ecosystem" onClick={closeMenu}>Ecosystem</a>
          <Link href="/marketplace" onClick={closeMenu}>Marketplace</Link>
        </nav>
        <div className="agri3d-nav-actions"><Link href={workspaceHref} className="agri3d-top-cta">{isAuthenticated ? 'WORKSPACE' : 'OPEN DASHBOARD'}</Link><button className="agri3d-menu-btn" onClick={()=>setMenuOpen(v=>!v)} aria-label="Toggle navigation" aria-expanded={menuOpen}>☰</button></div>
        <div className="agri3d-mobile-panel">
          <a href="#platform" onClick={()=>setMenuOpen(false)}>Platform</a><a href="#intelligence" onClick={()=>setMenuOpen(false)}>Intelligence</a><a href="#ecosystem" onClick={()=>setMenuOpen(false)}>Ecosystem</a><Link href="/marketplace" onClick={()=>setMenuOpen(false)}>Marketplace</Link>
          <Link href={workspaceHref} className="agri3d-top-cta">{isAuthenticated ? 'WORKSPACE' : 'OPEN DASHBOARD'}</Link>
        </div>
      </header>

      <section className="agri3d-hero" id="platform">
        <div className="agri3d-copy">
          <div className="agri3d-kicker"><span className="live-dot"/> LIVE AGRICULTURAL INTELLIGENCE</div>
          <div className="scene-caption">{scenes[activeScene].title} · {scenes[activeScene].label}</div>
          <h1>FROM <em>SOIL</em><br/>TO SMART TRADE.</h1>
          <p>One connected operating layer for farms, markets, AI decisions, traceability and logistics.</p>
          <div className="agri3d-actions"><Link href={workspaceHref} className="agri3d-primary">{workspaceLabel}<ArrowRight size={17}/></Link><a href="#intelligence" className="agri3d-secondary">EXPLORE AGRIMARK</a></div>
          <div className="agri3d-trust"><span><ShieldCheck size={16}/> VERIFIED</span><span><MapPinned size={16}/> LOCATION-AWARE</span><span><Bot size={16}/> AI-ASSISTED</span></div>
        </div>

        <div className="agri3d-dashboard" aria-hidden="true">
          <div className="dashboard-top"><div><span>AGRIMARK COMMAND</span><strong>Public overview</strong></div><b>OPEN</b></div>
          <div className="dashboard-main"><div className="dashboard-value">LIVE <small>agriculture intelligence</small></div><div className="dashboard-chart"><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></div>
          <div className="dashboard-grid"><div><span>FIELD HEALTH</span><b>VIEW</b></div><div><span>MARKET</span><b>VIEW</b></div><div><span>TRACE</span><b>VIEW</b></div></div>
        </div>

        <Link href="/farmer/dashboard" className="agri3d-float agri3d-float-a"><Sprout size={15}/><span>Crop intelligence</span><b>OPEN</b></Link>
        <Link href="/marketplace" className="agri3d-float agri3d-float-b"><BarChart3 size={15}/><span>Market intelligence</span><b>OPEN</b></Link>
        <Link href="/logistics/deliveries" className="agri3d-float agri3d-float-c"><Truck size={15}/><span>Logistics view</span><b>OPEN</b></Link>
      </section>

      <section className="agri3d-bottom" id="intelligence">
        <Link href="/farmer/dashboard"><span>FARMERS</span><b>Explore dashboard</b><small>Sign in only when saving farm data</small></Link>
        <Link href="/buyer/marketplace"><span>BUYERS</span><b>Browse marketplace</b><small>Public discovery before account actions</small></Link>
        <Link href="/dashboard#ecosystem"><span>FPO / CO-OP</span><b>Explore workspace</b><small>Account required for protected actions</small></Link>
        <Link href="/logistics/deliveries"><span>LOGISTICS</span><b>View logistics</b><small>Account required for protected updates</small></Link>
      </section>

      <section className="agri3d-ecosystem" id="ecosystem">
        <div className="agri3d-eco-card">
          <span>ECOSYSTEM</span><h2>ONE OPERATING LAYER FOR AGRICULTURE.</h2>
          <p>Browse AgriMark without an account. Authentication is reserved for private data, edits, transactions and role-specific actions.</p>
          <div className="agri3d-eco-actions">
            <Link href="/dashboard" className="agri3d-secondary"><Users size={16}/> OPEN DASHBOARD</Link>
            <Link href="/ai-assistant" className="agri3d-secondary"><BrainCircuit size={16}/> ASK AGRIAI</Link>
            <Link href="/marketplace" className="agri3d-secondary"><Store size={16}/> EXPLORE MARKET</Link>
          </div>
        </div>
      </section>

      <div className="agri3d-dots" aria-label="Hero scenes">{scenes.map((s,i)=><button key={s.title} className={i===activeScene?'active':''} onClick={()=>setActiveScene(i)} aria-label={\`Show \${s.title} scene\`}/>)}</div>
    </main>
  );
}
