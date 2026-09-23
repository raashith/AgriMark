'use client';

import React from 'react';
import Link from 'next/link';

export const SmartTradeFinalScene: React.FC = () => {
  return (
    <section id="scene-final" className="scene-target py-32 relative text-center overflow-hidden border-t border-white/10 reveal-section">
      {/* Golden Backlight Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-t from-[#E5A93C]/25 via-[#1B4D3E]/25 to-transparent blur-[140px] pointer-events-none" />
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 space-y-8">
        {/* AgriMark Official Circular Emblem Artwork */}
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#E5A93C] p-1.5 mx-auto bg-[#07110D] shadow-gold-glow hover:scale-105 transition-transform duration-500">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIZj13d8kVjT0XGKVeX8NPdOMnLe8V_0YObPFGChKDlYs5FrhtPOf3Eb3oDRd5SZdPi_HdsZxgL9Ac6jqn3qDzBgdrZGxC0Hs5ob76ivRyN9-Pnb-ZM_UInA8T5l55ylv5l7Kn-VQxQaeUdWRWaiDGp1ZmL8RCMF560ujZlSIpzh9ttTfzPFXqUu0Kzyqd49M269utiZLihPTTkFycJDg1NT_7UNM5z4SmDTiYJabt4T8J_UZz-wpgvLgRQUEWEJ6LTA"
            alt="AgriMark Official Heritage Emblem"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        <h2 className="font-display text-4xl sm:text-6xl xl:text-7xl font-bold text-white tracking-tight leading-tight">
          FROM SOIL TO SMART TRADE.
        </h2>
        <p className="text-lg sm:text-xl text-[#F7F5EE]/80 max-w-2xl mx-auto leading-relaxed font-normal">
          Start your farm, marketplace, FPO, or logistics workflow today on AgriMark.ai.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/auth/register"
            className="px-9 py-4 rounded-xl font-display font-bold text-sm tracking-wider text-[#07110D] bg-gradient-to-r from-[#E5A93C] via-[#FCE196] to-[#E5A93C] shadow-gold-glow hover:scale-105 transition-all duration-300"
          >
            START FOR FREE
          </Link>
          <a
            href="#scene-farm"
            className="px-8 py-4 rounded-xl holo-glass font-display font-semibold text-sm text-white border border-white/20 hover:border-[#E5A93C]/50 hover:bg-white/5 transition-all duration-300"
          >
            EXPLORE THE PLATFORM
          </a>
        </div>
        {/* Enterprise Trust Markers */}
        <div className="pt-8 text-xs font-mono text-white/50 flex flex-wrap justify-center gap-6">
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-400">✓</span> APEDA &amp; e-NAM Compatible
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-400">✓</span> Supabase Realtime Architecture
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-400">✓</span> ISO 22000 Provenance
          </span>
        </div>
      </div>
    </section>
  );
};
