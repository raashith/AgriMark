'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Leaf, Menu, Sparkles, Workflow, X } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';

export default function HomePage() {
  const { t } = useI18n();
  const { isAuthenticated, role, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 901) setMenuOpen(false); };
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('resize', onResize); window.removeEventListener('keydown', onKey); };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const primaryHref = useMemo(() => isAuthenticated ? (role === 'farmer' ? '/farmer/dashboard' : '/buyer/marketplace') : '/auth/register', [isAuthenticated, role]);
  const primaryLabel = isAuthenticated ? `Open ${(user?.role || role || 'user').toUpperCase()} Workspace` : t('register');

  return (
    <main className={`vesper-landing ${menuOpen ? 'menu-open' : ''}`}>
      <div className="vesper-photo" aria-hidden="true" />
      <div className="vesper-scrim" aria-hidden="true" />
      <div className="vesper-grain" aria-hidden="true" />
      <header className="vesper-header">
        <Link href="/" className="vesper-logo" aria-label="AgriMark home"><span className="vesper-logo-mark"><Leaf size={17} /></span><span>AgriMark<span className="vesper-logo-suffix">.ai</span></span></Link>
        <nav className="vesper-nav" aria-label="Primary">
          <a href="#benefits" onClick={() => setMenuOpen(false)}>Platform</a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How It Works</a>
          <a href="#ai" onClick={() => setMenuOpen(false)}>AI Insights</a>
          <a href="#marketplace" onClick={() => setMenuOpen(false)}>Marketplace</a>
        </nav>
        <div className="vesper-header-actions">
          <Link href={primaryHref} className="vesper-btn vesper-btn-solid">{isAuthenticated ? 'Workspace' : 'Start for Free'}</Link>
          <button type="button" className="vesper-burger" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)}>{menuOpen ? <X size={18} /> : <Menu size={18} />}</button>
        </div>
      </header>
      <div className={`vesper-menu-backdrop ${menuOpen ? 'is-open' : ''}`} onClick={() => setMenuOpen(false)} aria-hidden="true" />
      <section className="vesper-hero" id="top">
        <div className="vesper-copy">
          <div className="vesper-badge"><Sparkles className="vesper-badge-star" size={17} /><span>Connected Agricultural Intelligence</span></div>
          <h1>
            <span>Turn <em>agricultural intelligence</em> into</span>
            <span>action, from field to market.</span>
          </h1>
          <p className="vesper-lede">Deploy intelligent workflows that connect farms, market signals, traceability and logistics across your agricultural operation.</p>
          <div className="vesper-actions">
            <Link href={primaryHref} className="vesper-btn vesper-hero-btn vesper-btn-solid">{primaryLabel}<ArrowRight size={16} /></Link>
            <a href="#how-it-works" className="vesper-btn vesper-hero-btn vesper-btn-ghost">See it in action</a>
          </div>
        </div>
      </section>
      <footer className="vesper-stats">
        <div className="vesper-stat" id="benefits"><span className="vesper-stat-icon"><Workflow size={19} /></span><span>Connected farm-to-market workflows</span></div>
        <div className="vesper-stat" id="how-it-works"><span className="vesper-stat-icon vesper-stat-tile"><CheckCircle2 size={18} /></span><span>Evidence-first operational intelligence</span></div>
        <div className="vesper-stat" id="ai"><span className="vesper-avatar-stack"><i className="avatar-a" /><i className="avatar-b" /><i className="avatar-c">A</i></span><span>Built for farmers, buyers &amp; FPOs</span></div>
      </footer>
      <span id="marketplace" className="vesper-anchor" />
    </main>
  );
}
