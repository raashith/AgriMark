'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sprout, ShieldCheck, Sparkles } from 'lucide-react';

export const FinalCTA: React.FC = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-[#0a0f0d] via-[#121a16] to-[#0a0f0d] relative overflow-hidden border-t border-[#1e2d26]/60 text-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-950/90 border border-emerald-500/40 rounded-full text-xs font-mono font-bold text-emerald-300 shadow-xl backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>JOIN THE AGRIMARK REVOLUTION</span>
        </div>

        <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
          THE FUTURE OF AGRICULTURE <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
            STARTS AT THE FIELD.
          </span>
        </h2>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-300 font-normal leading-relaxed">
          Whether you are a farmer looking for fair prices, a buyer seeking verified produce, or an FPO scaling operations — AgriMark is built for you.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/auth/register"
            className="px-8 py-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold rounded-full text-sm shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95 border border-emerald-300/30"
          >
            <span>GET STARTED WITH AGRIMARK</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/buyer/marketplace"
            className="px-7 py-4 bg-[#121a16]/90 border border-[#1e2d26] hover:border-emerald-600 text-gray-200 hover:text-white font-extrabold rounded-full text-sm backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95"
          >
            EXPLORE THE PLATFORM
          </Link>
        </div>
      </div>
    </section>
  );
};
