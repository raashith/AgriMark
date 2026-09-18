'use client';

import React, { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, MapPinned, ShieldCheck, Sparkles, Sprout, Truck, Users } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';

export default function HomePage() {
  const { t } = useI18n();
  const { isAuthenticated, role, user } = useAuth();

  useEffect(() => {
    if (document.getElementById('agrimark-reference-css')) return;
    const link = document.createElement('link');
    link.id = 'agrimark-reference-css';
    link.rel = 'stylesheet';
    link.href = '/agrimark-landing-reference.css';
    document.head.appendChild(link);
    return () => link.remove();
  }, []);

  const primaryHref = useMemo(() => {
    if (isAuthenticated) return role === 'farmer' ? '/farmer/dashboard' : '/buyer/marketplace';
    return '/auth/register';
  }, [isAuthenticated, role]);

  const primaryLabel = useMemo(() => {
    if (isAuthenticated) return `Open ${(user?.role || role || 'user').toUpperCase()} Workspace`;
    return t('register');
  }, [isAuthenticated, role, t, user?.role]);

  const roleLinks = [
    { title: 'FARMERS', href: '/farmer/dashboard', icon: Sprout, text: 'Grow with field intelligence' },
    { title: 'BUYERS', href: '/buyer/marketplace', icon: Users, text: 'Source trusted produce' },
    { title: 'LOGISTICS', href: '/logistics/deliveries', icon: Truck, text: 'Move every order clearly' },
  ];

  return (
    <main className="agri-reference-stage">
      <div className="agri-reference-halo" aria-hidden="true" />
      <div className="agri-reference-nav">
        <Link href="/" className="agri-reference-brand" aria-label="AgriMark home">agri<span>mark</span></Link>
        <nav className="agri-reference-links" aria-label="Primary">
          <a className="active" href="#platform">Platform</a>
          <a href="#market">Market</a>
          <a href="#roles">Roles</a>
          <Link href="/ai-assistant">AgriAI</Link>
          <Link className="agri-reference-enroll" href={primaryHref}>{isAuthenticated ? 'WORKSPACE' : 'JOIN AGRIMARK'}</Link>
        </nav>
        <div className="md:hidden flex items-center gap-2">
          <Link href="/auth/login" className="text-white text-xs px-3 py-2 rounded-full border border-white/15">{t('login')}</Link>
        </div>
      </div>

      <section className="agri-reference-main" id="platform">
        <div className="agri-reference-orb agri-reference-orb-left" aria-hidden="true">
          <div className="h-full w-full rounded-full border border-emerald-200/20 bg-[radial-gradient(circle_at_35%_30%,#b8e69a,#3e7b54_48%,#0a2618_82%)] shadow-[0_30px_80px_rgba(0,0,0,.45)]" />
        </div>
        <div className="agri-reference-orb agri-reference-orb-right" aria-hidden="true">
          <div className="h-full w-full rounded-full border border-amber-200/15 bg-[radial-gradient(circle_at_35%_30%,#efd58b,#a36c20_48%,#261506_84%)] shadow-[0_30px_80px_rgba(0,0,0,.45)]" />
        </div>
        <span className="agri-reference-label agri-reference-label-left">FARMER</span>
        <span className="agri-reference-label agri-reference-label-right">BUYER</span>

        <div className="agri-reference-copy">
          <div className="agri-reference-eyebrow">AGRICULTURAL INTELLIGENCE</div>
          <h1 className="agri-reference-title">AGRIMARK</h1>
          <div className="agri-reference-rule" />
          <p className="agri-reference-lede">
            Connect farms, markets, AI and logistics in one calm digital agriculture experience.
            Discover produce, understand market signals, trace every lot and move from harvest to trade with confidence.
          </p>
          <Link href={primaryHref} className="agri-reference-cta">
            {primaryLabel.toUpperCase()} <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>

        <div className="agri-reference-stats" id="market">
          <span className="agri-reference-stat"><ShieldCheck className="inline h-3 w-3 mr-1" /> VERIFIED WORKFLOWS</span>
          <span className="agri-reference-stat"><MapPinned className="inline h-3 w-3 mr-1" /> LOCATION-AWARE</span>
          <span className="agri-reference-stat"><Sparkles className="inline h-3 w-3 mr-1" /> AI-ASSISTED</span>
        </div>
      </section>

      <section id="roles" className="relative z-[3] px-6 pb-16 md:px-12">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-3 md:grid-cols-3">
          {roleLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.title} href={item.href} className="group rounded-2xl border border-white/10 bg-black/15 p-5 backdrop-blur-xl transition hover:-translate-y-1 hover:border-amber-300/25">
                <div className="flex items-center justify-between"><span className="text-[11px] tracking-[.25em] text-amber-200/70">{item.title}</span><Icon className="h-5 w-5 text-amber-200/80" /></div>
                <p className="mt-3 text-sm text-white/60">{item.text}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-amber-200">EXPLORE <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
