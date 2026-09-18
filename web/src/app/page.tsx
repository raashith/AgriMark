// AgriMark Production Web Application - Vesper-Style Cinematic Landing Page
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import {
  Sprout,
  ArrowRight,
  Menu,
  X,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Layers,
  ChevronRight,
} from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, role, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Determine role-aware CTA link for authenticated users
  const getAuthenticatedDashboardUrl = () => {
    if (role === 'farmer') return '/farmer/dashboard';
    if (role === 'buyer') return '/buyer/marketplace';
    if (role === 'fpo') return '/fpo/dashboard';
    if (role === 'logistics') return '/logistics/deliveries';
    if (role === 'admin') return '/admin/disputes';
    return '/farmer/dashboard';
  };

  const navLinks = [
    { label: 'Platform', href: '#platform' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'AI Insights', href: '#ai-insights' },
    { label: 'Marketplace', href: '/marketplace' },
  ];

  return (
    <div className="relative min-h-screen bg-[#000000] text-white flex flex-col justify-between overflow-x-hidden selection:bg-[#1B4D3E] selection:text-white font-sans">
      {/* Visual Background: Cinematic Dark Agricultural Glow & Noise Scrim */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Deep Black Scrim Base */}
        <div className="absolute inset-0 bg-[#000000]" />

        {/* Ambient Emerald & Gold Atmospheric Lights */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-[#1B4D3E]/25 via-[#3E7B54]/15 to-transparent rounded-full blur-3xl opacity-80" />
        <div className="absolute top-1/3 right-[-5%] w-[500px] h-[500px] bg-[#E5A93C]/10 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#1B4D3E]/15 rounded-full blur-3xl opacity-50" />

        {/* Subtle Agricultural Contour / Grid Lines Texture */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.04]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid-pattern"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>

        {/* Top Scrim Gradient for Header Contrast */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black via-black/80 to-transparent z-10" />
      </div>

      {/* THREE-COLUMN LIQUID-GLASS METALLIC NAVIGATION */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'py-3 bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-2xl' : 'py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Left: Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-2 bg-[#1B4D3E] border border-[#3E7B54]/50 rounded-xl group-hover:border-[#E5A93C] transition duration-300 shadow-md">
              <Sprout className="w-5 h-5 text-[#E5A93C]" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white font-sans flex items-center gap-1">
              AgriMark<span className="text-[#9A9A9A] font-light text-base">.ai</span>
            </span>
          </Link>

          {/* Center: Liquid-Glass Metallic Navigation Pill (Desktop > 900px) */}
          <nav className="hidden min-[901px]:flex items-center gap-1 px-4 py-1.5 bg-[#121214]/80 border border-white/15 rounded-full backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] relative overflow-hidden group">
            {/* Subtle Metallic Shine effect */}
            <div className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shine pointer-events-none" />

            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-1.5 text-xs font-medium text-gray-300 hover:text-white transition duration-200 hover:bg-white/10 rounded-full"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right: Actions (Desktop) */}
          <div className="hidden min-[901px]:flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                href={getAuthenticatedDashboardUrl()}
                className="px-5 py-2.5 bg-gradient-to-b from-white via-[#f0f0f5] to-[#d8d8e0] text-black font-semibold text-xs rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:scale-[1.02] transition duration-300 flex items-center gap-2"
              >
                <span>Dashboard ({user?.role?.toUpperCase()})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-xs font-medium text-gray-300 hover:text-white transition px-3 py-2"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="px-5 py-2.5 bg-gradient-to-b from-white via-[#f0f0f5] to-[#d8d8e0] text-black font-semibold text-xs rounded-full shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:scale-[1.02] transition duration-300 flex items-center gap-2"
                >
                  <span>Start for Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button (<= 900px) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 min-[901px]:hidden text-gray-300 hover:text-white bg-white/5 border border-white/10 rounded-xl backdrop-blur-md"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-[#E5A93C]" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Responsive Mobile Navigation Drawer (<= 900px) */}
        {mobileMenuOpen && (
          <div className="min-[901px]:hidden fixed inset-0 top-[72px] z-40 bg-black/95 backdrop-blur-2xl px-6 py-8 flex flex-col justify-between animate-scale-up">
            <div className="flex flex-col space-y-6 text-center">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xl font-medium text-gray-200 hover:text-white py-2 border-b border-white/10"
                >
                  {link.label}
                </a>
              ))}
              {!isAuthenticated && (
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-medium text-gray-300 hover:text-white py-2"
                >
                  Login
                </Link>
              )}
            </div>

            <div className="pt-6">
              {isAuthenticated ? (
                <Link
                  href={getAuthenticatedDashboardUrl()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-4 bg-gradient-to-b from-white to-[#d8d8e0] text-black font-bold text-sm rounded-2xl text-center shadow-xl flex items-center justify-center gap-2"
                >
                  <span>Go to Workspace ({user?.role?.toUpperCase()})</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-4 bg-gradient-to-b from-white to-[#d8d8e0] text-black font-bold text-sm rounded-2xl text-center shadow-xl flex items-center justify-center gap-2"
                >
                  <span>Start for Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION (Centered Editorial Composition) */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-32 pb-16 max-w-5xl mx-auto text-center space-y-8 animate-fade-in-up">
        {/* Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-[#1B4D3E]/30 border border-[#1B4D3E]/60 rounded-full backdrop-blur-md shadow-lg">
          <span className="w-2 h-2 rounded-full bg-[#E5A93C] animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-widest text-[#E5A93C] uppercase">
            Connected Agricultural Intelligence
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08] max-w-4xl font-sans">
          Turn{' '}
          <span className="font-serif italic text-[#9A9A9A] font-normal">
            agricultural intelligence
          </span>{' '}
          into action, from field to market.
        </h1>

        {/* Supporting Text */}
        <p className="text-base sm:text-lg md:text-xl text-[#9A9A9A] max-w-2xl font-normal leading-relaxed">
          Connect farms, market signals, traceability and logistics in one intelligent agricultural operating layer.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full sm:w-auto">
          {isAuthenticated ? (
            <Link
              href={getAuthenticatedDashboardUrl()}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-b from-white via-[#f0f0f5] to-[#d8d8e0] text-black font-bold text-sm rounded-full shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:shadow-[0_0_35px_rgba(255,255,255,0.5)] hover:scale-[1.02] transition duration-300 flex items-center justify-center gap-2"
            >
              <span>Go to Workspace ({user?.role?.toUpperCase()})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href="/auth/register"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-b from-white via-[#f0f0f5] to-[#d8d8e0] text-black font-bold text-sm rounded-full shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:shadow-[0_0_35px_rgba(255,255,255,0.5)] hover:scale-[1.02] transition duration-300 flex items-center justify-center gap-2"
            >
              <span>Start for Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}

          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-8 py-4 bg-white/[0.04] backdrop-blur-md border border-white/20 hover:bg-white/[0.08] hover:border-white/40 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] text-white font-semibold text-sm rounded-full transition duration-300 flex items-center justify-center gap-2"
          >
            <span>See it in action</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </a>
        </div>
      </main>

      {/* SUB-SECTIONS FOR DEEP ANCHOR EXPLORATION */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 space-y-24 py-12">
        {/* Section 1: Platform Overview */}
        <section id="platform" className="scroll-mt-32 pt-8">
          <div className="p-8 md:p-12 rounded-3xl bg-[#0e0e10]/80 border border-white/10 backdrop-blur-xl relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="p-3 bg-[#1B4D3E]/40 border border-[#1B4D3E]/60 rounded-2xl w-fit text-[#E5A93C]">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Cadastral Plot Passports</h3>
                <p className="text-xs text-[#9A9A9A] leading-relaxed">
                  Digitize 7/12 land records, plot boundaries, and soil health metrics into immutable agricultural assets.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-[#1B4D3E]/40 border border-[#1B4D3E]/60 rounded-2xl w-fit text-[#E5A93C]">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Transparent 3-Tier Prices</h3>
                <p className="text-xs text-[#9A9A9A] leading-relaxed">
                  Compare observed APMC Mandi rates, direct farmer ask prices, and 7-day AI demand signals.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-[#1B4D3E]/40 border border-[#1B4D3E]/60 rounded-2xl w-fit text-[#E5A93C]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">NABL & Escrow Trade</h3>
                <p className="text-xs text-[#9A9A9A] leading-relaxed">
                  Verified quality assays paired with Bank Escrow locks to guarantee instant payment settlement upon gate delivery.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: How It Works */}
        <section id="how-it-works" className="scroll-mt-32 pt-4">
          <div className="text-center space-y-3 max-w-2xl mx-auto pb-10">
            <span className="text-xs font-mono font-bold text-[#E5A93C] uppercase tracking-wider">
              OPERATIONAL EXECUTION
            </span>
            <h2 className="text-3xl font-extrabold text-white">
              End-to-End Farm-to-Market Workflow
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { num: '01', title: 'Plot Passport', desc: 'Farmer registers plot & crop cultivation details.' },
              { num: '02', title: 'NABL Quality', desc: 'Harvest batch is assayed and lot passcode assigned.' },
              { num: '03', title: 'B2B Trade', desc: 'Buyers bid directly with Bank Escrow protection.' },
              { num: '04', title: 'GPS Reefer', desc: 'Cold logistics track delivery until instant payout.' },
            ].map((step, i) => (
              <div
                key={i}
                className="p-6 bg-[#0c0c0e]/90 border border-white/10 rounded-2xl space-y-3 hover:border-white/20 transition"
              >
                <span className="text-2xl font-mono font-extrabold text-[#E5A93C]">{step.num}</span>
                <h3 className="font-bold text-base text-white">{step.title}</h3>
                <p className="text-xs text-[#9A9A9A] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* BOTTOM CREDIBILITY STATS (Exactly 3 compact items) */}
      <footer className="relative z-10 border-t border-white/10 py-10 px-6 bg-black/60 backdrop-blur-md">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-2 h-2 rounded-full bg-[#1B4D3E] shrink-0" />
            <span className="text-xs sm:text-sm text-[#9A9A9A] font-medium">
              Connected farm-to-market workflows
            </span>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-2 h-2 rounded-full bg-[#E5A93C] shrink-0" />
            <span className="text-xs sm:text-sm text-[#9A9A9A] font-medium">
              Evidence-first operational intelligence
            </span>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-2 h-2 rounded-full bg-[#3E7B54] shrink-0" />
            <span className="text-xs sm:text-sm text-[#9A9A9A] font-medium">
              Built for farmers, buyers & FPOs
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
