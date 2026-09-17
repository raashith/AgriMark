'use client';

import { ArrowRight, Bot, CheckCircle2, CloudSun, Leaf, LineChart, MapPin, Menu, PackageCheck, ShieldCheck, ShoppingCart, Smartphone, Sprout, Truck, Users, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const features = [
  ['Farmer OS', Sprout, 'Plan farms, crops, field activities, harvests and tasks from one low-bandwidth friendly workspace.'],
  ['Live Marketplace', ShoppingCart, 'Move verified produce from farm lots to buyers with transparent pricing and order workflows.'],
  ['AgriAI', Bot, 'Ask practical farming questions and get a multilingual assistant connected to your AgriMark context.'],
  ['Traceable Logistics', Truck, 'Track dispatches, cold-chain telemetry, gate passes and delivery milestones in one flow.'],
  ['Farm Intelligence', LineChart, 'Turn field, finance, weather and market signals into a clearer operating picture.'],
  ['Trust Layer', ShieldCheck, 'Keep farmer, buyer, FPO and logistics workflows tied to role-aware data and traceability.'],
];

const journey = [
  ['01', 'Create your farm', 'Add land, location, soil and irrigation details with a simple guided flow.'],
  ['02', 'Plan & grow', 'Track crops, scouting, inputs, tasks and harvest readiness as the season progresses.'],
  ['03', 'List & trade', 'Create produce lots, discover buyers, place RFQs and manage orders.'],
  ['04', 'Move & learn', 'Track logistics and use AgriAI, market and farm data to improve the next decision.'],
];

export default function LandingPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link href="/" className="brand" aria-label="AgriMark home">
            <span className="logo"><Leaf /></span>
            <span>AgriMark<small>Indian Agriculture Ecosystem</small></span>
          </Link>
          <nav className="nav">
            <a href="#platform">Platform</a>
            <a href="#workflow">How it works</a>
            <a href="#market">Marketplace</a>
            <a href="#trust">Why AgriMark</a>
          </nav>
          <div className="actions">
            <Link href="/auth/login" className="btn btn-secondary">Log in</Link>
            <Link href="/auth/register" className="btn btn-primary">Get started <ArrowRight size={16} /></Link>
            <button className="btn btn-secondary" style={{padding:'0 13px'}} onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {open && <div className="container" style={{paddingBottom:14}}>
          <div className="card" style={{display:'grid',gap:8}}>
            <a href="#platform" onClick={() => setOpen(false)}>Platform</a>
            <a href="#workflow" onClick={() => setOpen(false)}>How it works</a>
            <a href="#market" onClick={() => setOpen(false)}>Marketplace</a>
            <a href="#trust" onClick={() => setOpen(false)}>Why AgriMark</a>
          </div>
        </div>}
      </header>

      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <span className="eyebrow">Agricultural Modernism · Built for India</span>
              <h1>From soil to sale, one connected farm ecosystem.</h1>
              <p>AgriMark brings farm operations, crop intelligence, produce trading, logistics, finance and AgriAI into a single experience designed around how farmers actually work.</p>
              <div className="cta-row">
                <Link href="/auth/register" className="btn btn-primary">Start with AgriMark <ArrowRight size={17} /></Link>
                <Link href="/marketplace" className="btn btn-secondary">Explore marketplace</Link>
              </div>
              <div style={{display:'flex',gap:16,flexWrap:'wrap',marginTop:22,color:'#63706a',fontSize:12,fontWeight:700}}>
                <span><CheckCircle2 size={14} style={{verticalAlign:'-2px',marginRight:5,color:'#257042'}} />Farmer-first workflows</span>
                <span><CheckCircle2 size={14} style={{verticalAlign:'-2px',marginRight:5,color:'#257042'}} />Role-aware access</span>
                <span><CheckCircle2 size={14} style={{verticalAlign:'-2px',marginRight:5,color:'#257042'}} />Real backend integration</span>
              </div>
            </div>
            <div className="hero-card">
              <div style={{position:'relative',zIndex:1}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
                  <div><div style={{fontSize:12,color:'rgba(255,255,255,.65)',fontWeight:700}}>TODAY AT AGRIMARK</div><strong style={{fontSize:24}}>The farm, connected.</strong></div>
                  <span className="badge" style={{background:'rgba(255,255,255,.09)',color:'#fff'}}>LIVE</span>
                </div>
                <div style={{marginTop:28,padding:15,borderRadius:18,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.14)'}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}><MapPin size={18} color="#E5A93C" /><div><strong style={{fontSize:14}}>Shree Ganesh Krishi Farm</strong><div style={{fontSize:11,color:'rgba(255,255,255,.62)'}}>Tamil Nadu · 4.8 acres · Active crop cycle</div></div></div>
                </div>
                <div className="hero-stats">
                  <div className="metric"><strong>24°C</strong><span>Field weather</span></div>
                  <div className="metric"><strong>₹6,240</strong><span>Market signal / qtl</span></div>
                  <div className="metric"><strong>3</strong><span>Tasks due today</span></div>
                  <div className="metric"><strong>98%</strong><span>Traceability ready</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="market" className="section" style={{paddingTop:24}}>
          <div className="container">
            <div className="market-strip">
              <div className="ticker"><small>Market pulse</small><strong>Chennai · Tamil Nadu</strong></div>
              <div className="ticker"><small>Tomato</small><strong>₹3,420</strong> <span className="up">+4.8%</span></div>
              <div className="ticker"><small>Onion</small><strong>₹2,960</strong> <span className="up">+2.3%</span></div>
              <div className="ticker"><small>Groundnut</small><strong>₹6,240</strong> <span className="up">+1.7%</span></div>
            </div>
          </div>
        </section>

        <section id="platform" className="section">
          <div className="container">
            <div className="section-head"><div><span className="eyebrow">One platform, many farm moments</span><h2>Everything your agricultural workflow needs to move.</h2><p>Designed as a coherent system—not a collection of disconnected utilities.</p></div></div>
            <div className="grid-3">
              {features.map(([title, Icon, body]) => {
                const FeatureIcon = Icon as typeof Sprout;
                return <div className="card" key={String(title)}><div className="icon-tile"><FeatureIcon size={21} /></div><h3>{String(title)}</h3><p>{String(body)}</p></div>;
              })}
            </div>
          </div>
        </section>

        <section id="workflow" className="section" style={{paddingTop:20}}>
          <div className="container">
            <div className="section-head"><div><span className="eyebrow">Simple by design</span><h2>A clearer journey from field to market.</h2></div></div>
            <div className="steps">
              {journey.map(([num, title, body]) => <div className="step" key={num}><div className="step-num">{num}</div><h3>{title}</h3><p>{body}</p></div>)}
            </div>
          </div>
        </section>

        <section id="trust" className="section">
          <div className="container">
            <div className="card" style={{padding:28,background:'linear-gradient(135deg,#fff 0%,#f0f5f1 100%)'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:28,alignItems:'center'}}>
                <div>
                  <span className="eyebrow">Built for real-world agriculture</span>
                  <h2 style={{fontSize:32,letterSpacing:'-.04em',margin:'10px 0'}}>One identity. One data foundation. Multiple experiences.</h2>
                  <p style={{color:'#69716c',lineHeight:1.75,maxWidth:650}}>The AgriMark web product and Stitch app are separate experiences sharing the same AgriMark API and Supabase foundation. The result is a consistent identity, data model and workflow across farmer, buyer, FPO and logistics journeys.</p>
                  <div className="cta-row"><Link href="/auth/onboarding" className="btn btn-primary">Set up your role <ArrowRight size={16} /></Link><Link href="/ai-assistant" className="btn btn-gold"><Bot size={16} />Meet AgriAI</Link></div>
                </div>
                <div style={{display:'grid',gap:10}}>
                  {[['Web','Canonical production experience',Smartphone],['App','Stitch-designed field experience',Leaf],['API','Shared business workflows',PackageCheck],['Supabase','Auth + PostgreSQL + storage',ShieldCheck]].map(([name,copy,Icon]) => { const ItemIcon = Icon as typeof Leaf; return <div key={String(name)} style={{display:'flex',gap:12,alignItems:'center',padding:15,background:'#fff',border:'1px solid #e2ddd1',borderRadius:16}}><div className="icon-tile" style={{margin:0,width:38,height:38}}><ItemIcon size={18}/></div><div><strong>{String(name)}</strong><div style={{fontSize:12,color:'#737b76',marginTop:2}}>{String(copy)}</div></div></div> })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" style={{paddingTop:6}}>
          <div className="container">
            <div className="card" style={{background:'#1B4D3E',color:'#fff',padding:'30px 28px'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:18,flexWrap:'wrap'}}>
                <div><div style={{fontSize:11,textTransform:'uppercase',letterSpacing:'.16em',fontWeight:800,color:'rgba(255,255,255,.6)'}}>Ready when your farm is</div><h2 style={{fontSize:30,margin:'8px 0 5px'}}>Build the next season with AgriMark.</h2><p style={{margin:0,color:'rgba(255,255,255,.7)'}}>Start simple. Add intelligence as your operation grows.</p></div>
                <Link href="/auth/register" className="btn btn-gold">Create your account <ArrowRight size={16}/></Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-grid">
          <div><div className="brand"><span className="logo"><Leaf /></span><span>AgriMark<small>Indian Agriculture Ecosystem</small></span></div><p style={{marginTop:14,maxWidth:470,lineHeight:1.7}}>A farmer-first digital agriculture ecosystem connecting operations, markets, intelligence and logistics.</p></div>
          <div><strong>Explore</strong><div style={{display:'grid',gap:9,marginTop:12,fontSize:13}}><Link href="/marketplace">Marketplace</Link><Link href="/ai-assistant">AgriAI</Link><Link href="/farmer/dashboard">Farmer dashboard</Link></div></div>
          <div><strong>Get started</strong><div style={{display:'grid',gap:9,marginTop:12,fontSize:13}}><Link href="/auth/register">Create account</Link><Link href="/auth/login">Log in</Link><Link href="/auth/onboarding">Choose your role</Link></div></div>
        </div>
      </footer>
    </div>
  );
}
