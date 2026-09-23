'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const LandingHeader: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-4 left-4 right-4 sm:left-6 sm:right-6 z-50 max-w-7xl mx-auto pointer-events-none">
      <nav
        className="pointer-events-auto rounded-full px-5 py-3 flex items-center justify-between border border-white/10 shadow-2xl transition-all duration-300 hover:border-[#E5A93C]/40"
        style={{
          background: 'rgba(5, 15, 10, 0.65)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        {/* Brand Lockup */}
        <a href="#scene-farm" className="flex items-center gap-3.5 group" aria-label="AgriMark.ai Home">
          <div className="w-9 h-9 rounded-full overflow-hidden border border-[#E5A93C]/60 p-0.5 bg-[#07110D] shadow-sm shadow-[#E5A93C]/25 group-hover:scale-105 transition-transform duration-300">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC16aDzshHjYoQqeR8RZaXbUKw1tTHm7MkKU0dJiy8LuMhcWiX8hAgTSl9HgudkdGO41rVqF8PBc_YIpYajfDDBJYnVbPGUtWo4AE2rrZ7a3Zm2EQ0hTaXY0Pk0MWc-y8os0mpzMybb5Vdb4NroG0QIj9quIA1E5AAtx8t-OaiWbYY7jcFNt80GoONKqjhiaO4hz_Z0MB7ijNvdfWQSH7onU33-PQX0hhxUu5yv-HpedNP-R7XH0f0daRPSQT-rNP2ddg"
              alt="AgriMark Official Heritage Emblem"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="flex items-baseline">
            <span className="font-display font-bold text-xl tracking-tight text-white">
              Agri<span className="text-[#E5A93C]">Mark</span>
            </span>
            <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-wider bg-[#1B4D3E] text-[#FCE196] rounded-full border border-[#E5A93C]/35">
              .ai
            </span>
          </div>
        </a>

        {/* Floating Pill Menu (Desktop) */}
        <div className="hidden xl:flex items-center gap-6 text-xs font-medium text-[#F7F5EE]/80 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/5">
          <a href="#scene-farm" className="hover:text-[#E5A93C] transition-colors">Living Farm</a>
          <a href="#scene-field" className="hover:text-[#E5A93C] transition-colors">Field Intel</a>
          <a href="#scene-market" className="hover:text-[#E5A93C] transition-colors flex items-center gap-1.5">
            Marketplace
            <span className="w-1.5 h-1.5 rounded-full bg-[#E5A93C] animate-pulse" />
          </a>
          <a href="#scene-traceability" className="hover:text-[#E5A93C] transition-colors">Traceability</a>
          <a href="#scene-ai" className="hover:text-[#E5A93C] transition-colors flex items-center gap-1">
            AgriAI
            <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-[#1B4D3E] text-[#9BC7A2]">v2.4</span>
          </a>
          <a href="#scene-network" className="hover:text-[#E5A93C] transition-colors">Network</a>
          <a href="#scene-logistics" className="hover:text-[#E5A93C] transition-colors">Logistics</a>
        </div>

        {/* Right Action CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="hidden sm:inline-flex px-3.5 py-1.5 text-xs font-mono text-[#F7F5EE]/80 hover:text-white transition-colors"
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            className="relative group overflow-hidden rounded-full p-[1px] font-medium text-xs transition-all duration-300 active:scale-95 shadow-md shadow-[#E5A93C]/15 hover:shadow-gold-glow"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-[#E5A93C] via-[#FCE196] to-[#E5A93C] opacity-90 group-hover:opacity-100 transition-opacity" />
            <span className="relative block px-4 py-1.5 rounded-full bg-[#07110D] group-hover:bg-opacity-80 text-[#FCE196] font-display font-semibold tracking-wide transition-colors">
              Start for Free
            </span>
          </Link>

          {/* Mobile Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="xl:hidden p-1.5 text-white/80 hover:text-white"
            aria-label="Toggle Mobile Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="pointer-events-auto xl:hidden mt-3 p-6 rounded-2xl holo-glass border border-white/10 space-y-4">
          <div className="flex flex-col gap-3 font-mono text-sm text-[#F7F5EE]/90">
            <a href="#scene-farm" onClick={() => setMobileOpen(false)} className="py-1 hover:text-[#E5A93C]">01 • Living Farm</a>
            <a href="#scene-field" onClick={() => setMobileOpen(false)} className="py-1 hover:text-[#E5A93C]">02 • Field Intel</a>
            <a href="#scene-market" onClick={() => setMobileOpen(false)} className="py-1 hover:text-[#E5A93C]">03 • Marketplace</a>
            <a href="#scene-traceability" onClick={() => setMobileOpen(false)} className="py-1 hover:text-[#E5A93C]">04 • Traceability</a>
            <a href="#scene-ai" onClick={() => setMobileOpen(false)} className="py-1 hover:text-[#E5A93C]">05 • AgriAI Command</a>
            <a href="#scene-network" onClick={() => setMobileOpen(false)} className="py-1 hover:text-[#E5A93C]">06 • Agricultural Network</a>
            <a href="#scene-logistics" onClick={() => setMobileOpen(false)} className="py-1 hover:text-[#E5A93C]">07 • Logistics Dispatch</a>
            <a href="#scene-final" onClick={() => setMobileOpen(false)} className="py-1 hover:text-[#E5A93C]">08 • Smart Trade Final</a>
          </div>
          <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5">
            <Link href="/auth/login" className="text-center py-2 text-xs font-mono text-white/80">Login</Link>
            <Link href="/auth/register" className="text-center py-2.5 rounded-full gold-shimmer text-[#07110D] font-bold text-xs font-display">Start for Free</Link>
          </div>
        </div>
      )}
    </header>
  );
};
