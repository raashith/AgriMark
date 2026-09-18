'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import {
  ArrowRight,
  BarChart3,
  Bot,
  Leaf,
  MapPinned,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Sprout,
  Truck,
  Users,
} from 'lucide-react';

function usePointerDepth() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    if (reduceMotion || !finePointer) return;

    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let raf = 0;

    const onMove = (event: PointerEvent) => {
      tx = event.clientX / window.innerWidth - 0.5;
      ty = event.clientY / window.innerHeight - 0.5;
    };

    const tick = () => {
      x += (tx - x) * 0.045;
      y += (ty - y) * 0.045;
      node.style.setProperty('--mx', x.toFixed(4));
      node.style.setProperty('--my', y.toFixed(4));
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return ref;
}

export default function HomePage() {
  const { t } = useI18n();
  const { isAuthenticated, role, user } = useAuth();
  const depthRef = usePointerDepth();
  const [scrolled, setScrolled] = useState(false);
  const [scene, setScene] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setScene((current) => (current + 1) % 3), 8500);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const primaryHref = useMemo(() => {
    if (isAuthenticated) {
      return role === 'farmer' ? '/farmer/dashboard' : '/buyer/marketplace';
    }
    return '/auth/register';
  }, [isAuthenticated, role]);

  const primaryLabel = useMemo(() => {
    if (isAuthenticated) return `Open ${(user?.role || role || 'user').toUpperCase()} Workspace`;
    return t('register');
  }, [isAuthenticated, role, t, user?.role]);

  const roles = [
    { title: 'Farmers', icon: Sprout, href: '/farmer/dashboard', body: 'Plan crops, record harvests, list verified lots and follow market signals.' },
    { title: 'Buyers', icon: ShoppingCart, href: '/buyer/marketplace', body: 'Discover produce, compare price intelligence and place direct orders.' },
    { title: 'FPO / Co-op', icon: Users, href: '/fpo/dashboard', body: 'Aggregate supply, coordinate members and manage bulk trade workflows.' },
    { title: 'Logistics', icon: Truck, href: '/logistics/deliveries', body: 'Coordinate pickups, delivery jobs and live movement updates.' },
  ];

  return (
    <main ref={depthRef} className="cinematic-landing relative overflow-hidden">
      <div className="cinematic-noise" aria-hidden="true" />
      <div className="agri-scene-stage" aria-hidden="true">
        <div className="agri-scene agri-scene-field">
          <div className="scene-sky" />
          <div className="field-horizon" />
          <div className="crop-field">
            {Array.from({ length: 36 }).map((_, i) => <span key={i} className="scene-crop-row" style={{ ['--i' as string]: i } as React.CSSProperties} />)}
          </div>
          <div className="scene-sun" />
          <div className="scene-heat-haze" />
          <div className="scene-particles scene-fireflies" />
        </div>
        <div className="agri-scene agri-scene-rain">
          <div className="rain-sky" />
          <div className="rain-cloud cloud-a" />
          <div className="rain-cloud cloud-b" />
          <div className="rain-mountain rain-mountain-back" />
          <div className="rain-mountain rain-mountain-front" />
          <div className="rain-field-reflection" />
          <div className="rain-sheet" />
          <div className="rain-splash-layer" />
          <div className="scene-mist" />
        </div>
        <div className="agri-scene agri-scene-mountain">
          <div className="mountain-sky" />
          <div className="mountain-range range-back" />
          <div className="mountain-range range-mid" />
          <div className="mountain-range range-front" />
          <div className="upper-ridge-tree" />
          <div className="mountain-mist" />
          <div className="mountain-birds" />
        </div>
        <div className="scene-vignette" />
      </div>
      <div className="scene-dots" aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <button key={index} type="button" aria-label={`Show agricultural scene ${index + 1}`} className={`scene-dot ${scene === index ? 'scene-dot-active' : ''}`} onClick={() => setScene(index)} />
        ))}
      </div>
      <div className="hero-orbit hero-orbit-a" aria-hidden="true" />
      <div className="hero-orbit hero-orbit-b" aria-hidden="true" />
      <div className="hero-glow hero-glow-a" aria-hidden="true" />
      <div className="hero-glow hero-glow-b" aria-hidden="true" />

      <nav className={`cinematic-nav ${scrolled ? 'cinematic-nav-scrolled' : ''}`}>
        <Link href="/" className="brand-lockup" aria-label="AgriMark home">
          <span className="brand-mark"><Leaf className="h-5 w-5" /></span>
          <span>
            <strong>AgriMark</strong>
            <small>AGRICULTURAL INTELLIGENCE</small>
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-7 text-sm text-emerald-100/75">
          <a href="#platform">Platform</a>
          <a href="#intelligence">Intelligence</a>
          <a href="#ecosystem">Ecosystem</a>
          <Link href="/about">About</Link>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/auth/login" className="cinematic-nav-link">{t('login')}</Link>
          <Link href={primaryHref} className="cinematic-nav-cta">{isAuthenticated ? 'Workspace' : t('register')}</Link>
        </div>
      </nav>

      <section className="hero-stage">
        <div className="hero-copy-wrap">
          <div className="hero-eyebrow">
            <span className="pulse-dot" />
            <span>REAL-TIME FARM • MARKET • LOGISTICS INTELLIGENCE</span>
          </div>

          <div className="hero-title-wrap">
            <p className="hero-kicker">THE DIGITAL AGRICULTURAL OPERATING SYSTEM</p>
            <h1 className="hero-title">
              <span className="hero-title-line">From <em>soil</em></span>
              <span className="hero-title-line hero-title-accent">to smart trade.</span>
            </h1>
            <p className="hero-description">
              AgriMark connects farmers, buyers, FPOs and logistics through trusted market intelligence,
              traceable produce workflows and AI-assisted agricultural decisions.
            </p>
          </div>

          <div className="hero-actions">
            <Link href={primaryHref} className="hero-primary">
              <span>{primaryLabel}</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a href="#platform" className="hero-secondary">
              Explore platform
              <Sparkles className="h-4 w-4" />
            </a>
          </div>

          <div className="hero-trust-row">
            <span><ShieldCheck className="h-4 w-4" /> Verified workflows</span>
            <span><MapPinned className="h-4 w-4" /> Location-aware delivery</span>
            <span><Bot className="h-4 w-4" /> AI decision support</span>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="hero-visual-backdrop" />
          <div className="hero-ring hero-ring-outer" />
          <div className="hero-ring hero-ring-inner" />
          <div className="hero-card hero-card-float">
            <div className="hero-card-top">
              <div>
                <span>AGRI COMMAND</span>
                <strong>Today&apos;s field signal</strong>
              </div>
              <span className="hero-live-dot">LIVE</span>
            </div>
            <div className="hero-metric"><strong>+18.6%</strong><span>Tomato reference</span></div>
            <div className="mini-chart">
              <i /><i /><i /><i /><i /><i /><i /><i /><i />
            </div>
            <div className="hero-card-grid">
              <div><small>Harvest</small><b>86%</b></div>
              <div><small>Demand</small><b>High</b></div>
              <div><small>Trace</small><b>100%</b></div>
            </div>
          </div>
          <div className="hero-chip chip-one"><Sprout className="h-4 w-4" /><span>Field health</span><b>92%</b></div>
          <div className="hero-chip chip-two"><BarChart3 className="h-4 w-4" /><span>Market pulse</span><b>+12.4%</b></div>
          <div className="hero-chip chip-three"><Truck className="h-4 w-4" /><span>Dispatch</span><b>On route</b></div>
          <div className="hero-flare" />
        </div>
      </section>

      <section id="platform" className="section-shell">
        <div className="section-heading">
          <span className="section-number">01</span>
          <div>
            <p className="section-kicker">ONE CONNECTED FLOW</p>
            <h2>Every agricultural role, in one operating layer.</h2>
          </div>
        </div>

        <div className="role-grid">
          {roles.map((item) => (
            <Link key={item.title} href={item.href} className="role-3d-card">
              <div className="role-icon"><item.icon className="h-6 w-6" /></div>
              <div>
                <span className="role-label">AGRIMARK ROLE</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
              <ArrowRight className="role-arrow h-5 w-5" />
            </Link>
          ))}
        </div>
      </section>

      <section id="intelligence" className="section-shell intelligence-section">
        <div className="intelligence-panel">
          <div className="intelligence-copy">
            <span className="section-kicker">MARKET INTELLIGENCE</span>
            <h2>See the market before you make the move.</h2>
            <p>
              Surface observed mandi prices, farmer listing data and clearly-labelled AI signals in one visual layer.
              Keep evidence, timestamps and confidence visible instead of hiding them behind a black box.
            </p>
            <Link href="/market-prices" className="text-link">Open market intelligence <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="signal-stack">
            <div className="signal-card signal-card-main">
              <div className="signal-label"><span>MARKET PULSE</span><b>LIVE</b></div>
              <div className="signal-price">₹ 4,860 <small>/ quintal</small></div>
              <div className="signal-line"><span /><span /><span /><span /><span /></div>
              <div className="signal-footer"><span>Reference range</span><b>+12.4%</b></div>
            </div>
            <div className="signal-card signal-card-side side-a"><span>AI CONFIDENCE</span><strong>87%</strong></div>
            <div className="signal-card signal-card-side side-b"><span>TRACEABILITY</span><strong>100%</strong></div>
          </div>
        </div>
      </section>

      <section id="ecosystem" className="section-shell ecosystem-section">
        <div className="section-heading">
          <span className="section-number">02</span>
          <div>
            <p className="section-kicker">BUILT FOR THE REAL FIELD</p>
            <h2>Designed to feel calm when the work is complex.</h2>
          </div>
        </div>

        <div className="feature-grid">
          {[
            ['01', 'Trace every lot', 'Harvest, quality, listing and transaction context stay connected.'],
            ['02', 'Act on evidence', 'Market observations and AI signals remain visibly separated.'],
            ['03', 'Move with confidence', 'Orders, pickup workflows and delivery status stay in one system.'],
          ].map(([number, title, body]) => (
            <article className="feature-3d-card" key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="final-cta">
        <div className="final-cta-orb" aria-hidden="true" />
        <div>
          <span className="section-kicker">AGRIMARK • CONNECTED AGRICULTURE</span>
          <h2>Turn field data into the next smart move.</h2>
          <p>Start with a farmer, buyer, FPO or logistics workflow and grow from there.</p>
        </div>
        <Link href={primaryHref} className="hero-primary">
          <span>{primaryLabel}</span>
          <ArrowRight className="h-5 w-5" />
        </Link>
      </section>

      <footer className="cinematic-footer">
        <span>© AgriMark</span>
        <span>Farm • Market • AI • Traceability • Logistics</span>
      </footer>
    </main>
  );
}
