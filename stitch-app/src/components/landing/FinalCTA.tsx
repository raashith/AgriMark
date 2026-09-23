'use client';

import React from 'react';
import Link from 'next/link';
import { Sprout, ArrowRight, Store, ShieldCheck } from 'lucide-react';

export const FinalCTA: React.FC = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-[#19201D] via-[#1B4D3E] to-[#143B30] text-white relative overflow-hidden">
      {/* Background Accent Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#E5A93C]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 md:px-8 relative z-10 text-center space-y-8">
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-emerald-950/80 border border-[#E5A93C]/40 rounded-full backdrop-blur-md">
          <Sprout className="w-4 h-4 text-[#E5A93C]" />
          <span className="text-xs font-mono font-bold text-[#E5A93C] uppercase tracking-wider">
            BHARAT AGRICULTURAL OS
          </span>
        </div>

        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight font-sans">
          Your harvest deserves a smarter journey.
        </h2>

        <p className="text-base sm:text-lg md:text-xl text-emerald-100/90 max-w-2xl mx-auto font-normal leading-relaxed">
          Join thousands of progressive farmers, FPOs, and verified wholesale buyers building a transparent, direct, and intelligent agricultural marketplace across India.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/onboarding/role-select"
            className="px-8 py-4 bg-[#E5A93C] hover:bg-[#d4982b] text-[#19201D] font-black text-sm rounded-2xl shadow-xl shadow-amber-500/20 flex items-center gap-3 transition transform hover:scale-[1.02]"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/marketplace"
            className="px-8 py-4 bg-emerald-900/90 hover:bg-emerald-800 border border-emerald-600/60 text-white font-bold text-sm rounded-2xl backdrop-blur-md shadow-lg flex items-center gap-2 transition"
          >
            <Store className="w-4 h-4 text-[#E5A93C]" />
            <span>Explore Marketplace</span>
          </Link>
        </div>

        <div className="pt-8 text-xs text-emerald-300/70 font-mono flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#E5A93C]" />
          <span>No hidden broker commissions • Bank Escrow Protected Trade</span>
        </div>
      </div>
    </section>
  );
};
