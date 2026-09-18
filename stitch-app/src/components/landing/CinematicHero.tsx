'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sprout,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Store,
  Sparkles,
  Zap,
  ChevronDown,
} from 'lucide-react';
import { CinematicDepth } from './CinematicDepth';

export const CinematicHero: React.FC = () => {
  return (
    <section className="relative min-h-[95vh] pt-28 pb-16 md:pt-36 md:pb-24 flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#19201D] via-[#1B4D3E] to-[#143B30] text-white [perspective:1400px]">
      <CinematicDepth />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-br from-[#E5A93C]/20 via-[#3E7B54]/30 to-transparent rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute top-1/3 right-[-10%] w-[600px] h-[600px] bg-[#1B4D3E]/40 rounded-full blur-3xl pointer-events-none z-0" />

      <div
        className="absolute inset-0 opacity-10 pointer-events-none z-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(229, 169, 60, 0.4) 1px, transparent 0)',
          backgroundSize: '36px 36px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 w-full flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-7 space-y-6 text-left [transform-style:preserve-3d]">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-emerald-950/80 border border-[#E5A93C]/40 rounded-full backdrop-blur-md shadow-lg [transform:translateZ(24px)]">
              <span className="w-2 h-2 rounded-full bg-[#E5A93C] animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-widest text-[#E5A93C] uppercase">
                AGRICULTURE • AI • MARKET
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-white font-sans [transform:translateZ(55px)]">
              GROW <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E5A93C] via-amber-200 to-emerald-300">SMARTER.</span>
              <br />
              SELL <span className="text-[#E5A93C]">BETTER.</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-emerald-100/90 max-w-2xl font-normal leading-relaxed [transform:translateZ(28px)]">
              AgriMark connects farmers, buyers, markets and logistics in one intelligent agricultural ecosystem — helping every harvest move from field to opportunity.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4 [transform:translateZ(34px)]">
              <a
                href="#platform"
                className="px-7 py-4 bg-[#E5A93C] hover:bg-[#d4982b] text-[#19201D] font-black text-sm rounded-2xl shadow-xl shadow-amber-500/20 flex items-center gap-3 transition transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Explore AgriMark</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                href="/marketplace"
                className="px-7 py-4 bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-600/60 text-white font-bold text-sm rounded-2xl backdrop-blur-md shadow-lg flex items-center gap-2 transition hover:border-[#E5A93C]/50"
              >
                <Store className="w-4 h-4 text-[#E5A93C]" />
                <span>Enter Marketplace</span>
              </Link>
              <Link
                href="/onboarding/role-select"
                className="px-5 py-4 text-emerald-200 hover:text-white font-bold text-sm underline underline-offset-4 decoration-amber-400/50 hover:decoration-amber-400 transition"
              >
                Get Started
              </Link>
            </div>

            <div className="pt-6 border-t border-emerald-900/60 flex flex-wrap items-center gap-6 text-xs text-emerald-200/80 font-medium [transform:translateZ(20px)]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#E5A93C]" />
                <span>NABL Quality Assayed</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#E5A93C]" />
                <span>NABARD & Bank Escrow Safe</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#E5A93C]" />
                <span>GPS Reefer Telemetry</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative [transform-style:preserve-3d]">
            <div className="absolute -inset-8 rounded-[2rem] bg-amber-400/10 blur-3xl [transform:translateZ(-50px)]" />
            <div className="absolute -inset-1 bg-gradient-to-r from-[#E5A93C] via-emerald-500 to-[#3E7B54] rounded-3xl blur-xl opacity-30 animate-pulse [transform:translateZ(-10px)]" />

            <div className="relative bg-[#19201D]/90 border border-emerald-700/60 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-5 [transform:rotateX(2deg)_rotateY(-5deg)_translateZ(45px)] transition-transform duration-700 hover:[transform:rotateX(0deg)_rotateY(-2deg)_translateZ(60px)]">
              <div className="flex items-center justify-between pb-4 border-b border-emerald-900/60">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-900/90 rounded-xl border border-emerald-700/50">
                    <Sprout className="w-5 h-5 text-[#E5A93C]" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                      Nashik APMC Mandi <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    </h3>
                    <p className="text-[11px] font-mono text-emerald-300/80">PLOT #402 • CADASTRAL 7/12</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-amber-500/20 border border-amber-400/40 rounded-full text-[10px] font-mono font-bold text-[#E5A93C]">
                  LIVE TELEMETRY
                </span>
              </div>

              <div className="bg-[#143B30]/80 border border-emerald-800/80 rounded-2xl p-4 space-y-3 [transform:translateZ(18px)]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-200/90 font-semibold">Red Onion (Grade A)</span>
                  <span className="font-mono font-bold text-amber-300 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> ₹2,650 / Qtl (+4.8%)
                  </span>
                </div>
                <div className="w-full bg-emerald-950 rounded-full h-2 overflow-hidden border border-emerald-800">
                  <div className="bg-gradient-to-r from-emerald-500 to-[#E5A93C] h-full w-[78%]" />
                </div>
                <div className="flex items-center justify-between text-[11px] text-emerald-300/70 font-mono">
                  <span>Modal APMC: ₹2,450</span>
                  <span>AI Demand Forecast: ₹2,750</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#19201D] p-3 rounded-xl border border-emerald-900/60 space-y-1 [transform:translateZ(20px)]">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase">NABL Quality</span>
                  <p className="font-bold text-white">18,500 kg Grade A</p>
                  <p className="text-[10px] text-emerald-300/70">Moisture: 12.2% • Assayed</p>
                </div>
                <div className="bg-[#19201D] p-3 rounded-xl border border-emerald-900/60 space-y-1 [transform:translateZ(24px)]">
                  <span className="text-[10px] font-mono text-[#E5A93C] uppercase">Cold Chain Reefer</span>
                  <p className="font-bold text-white">+4.2°C Telemetry</p>
                  <p className="text-[10px] text-emerald-300/70">Bhiwandi Bay 2 • In Transit</p>
                </div>
              </div>

              <div className="p-3 bg-gradient-to-r from-amber-500/10 via-emerald-900/30 to-transparent border border-amber-400/30 rounded-xl flex items-center justify-between gap-3 [transform:translateZ(28px)]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#E5A93C] shrink-0" />
                  <p className="text-[11px] text-emerald-100 font-medium">
                    "नाशिक कांद्याचा बाजार भाव कधी वाढेल?" (Ask AgriAI)
                  </p>
                </div>
                <Link
                  href="/ai-assistant"
                  className="px-3 py-1.5 bg-[#E5A93C] hover:bg-[#d4982b] text-[#19201D] font-bold text-[11px] rounded-lg shrink-0 transition"
                >
                  Ask
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 text-center pt-8">
        <a href="#platform" className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-emerald-300/70 hover:text-[#E5A93C] transition">
          <span>DISCOVER THE OPERATING SYSTEM</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </a>
      </div>
    </section>
  );
};