'use client';

import React from 'react';
import Link from 'next/link';

export const LogisticsScene: React.FC = () => {
  return (
    <section id="scene-logistics" className="scene-target py-28 relative border-t border-white/10 reveal-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Logistics Story Copy */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-block px-3 py-1 rounded-full holo-glass-subtle text-[11px] font-mono tracking-widest text-[#E5A93C] uppercase">
              07 // Real-Time Supply Chain
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-white leading-tight">
              Move produce with clarity.
            </h2>
            <p className="text-base text-[#F7F5EE]/75 leading-relaxed">
              Eliminate post-harvest spoilage and transit blind spots. Live sensor telemetry records chamber temperatures, speed limits, and route deviations from farm gate directly to buyer delivery docking.
            </p>
            <div className="p-4 rounded-2xl holo-glass border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#9BC7A2]">COLD CHAIN INTEGRITY SCORE</span>
                <span className="text-emerald-400 font-bold">99.8%</span>
              </div>
              <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full rounded-full" style={{ width: '99.8%' }} />
              </div>
              <div className="text-[11px] text-white/60 font-mono">
                Zero thermal breaches reported across 1,380 active shipment kilometers.
              </div>
            </div>
            <div className="pt-2">
              <Link
                href="/logistics/deliveries"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-display font-bold text-sm bg-[#1B4D3E] hover:bg-[#225c4b] text-[#FCE196] border border-[#E5A93C]/40 transition-all shadow-md"
              >
                TRACK LIVE FLEET
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right: Real-World Route Tracker Card & Delivery HUD */}
          <div className="lg:col-span-7">
            <div className="holo-glass rounded-3xl p-6 sm:p-8 border border-[#E5A93C]/30 shadow-2xl relative space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-mono text-xs font-bold text-white uppercase">
                    SHIPMENT DISPATCH // LOT #MH-8429-REEFER
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                  ACTIVE IN TRANSIT
                </span>
              </div>

              {/* Route Milestones Bar */}
              <div className="relative py-2">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/15 -translate-y-1/2" />
                <div className="absolute top-1/2 left-0 w-3/4 h-0.5 bg-gradient-to-r from-emerald-400 to-[#E5A93C] -translate-y-1/2" />
                <div className="relative z-10 grid grid-cols-4 gap-2 text-center text-[10px] font-mono">
                  <div>
                    <div className="w-6 h-6 rounded-full bg-emerald-400 text-[#07110D] font-bold flex items-center justify-center mx-auto mb-1">
                      ✓
                    </div>
                    <div className="text-white font-bold">FARM GATE</div>
                    <div className="text-white/40">Nashik</div>
                  </div>
                  <div>
                    <div className="w-6 h-6 rounded-full bg-emerald-400 text-[#07110D] font-bold flex items-center justify-center mx-auto mb-1">
                      ✓
                    </div>
                    <div className="text-white font-bold">SORTING HUB</div>
                    <div className="text-white/40">Pune Cluster</div>
                  </div>
                  <div>
                    <div className="w-6 h-6 rounded-full bg-[#E5A93C] text-[#07110D] font-bold flex items-center justify-center mx-auto mb-1 animate-pulse">
                      ●
                    </div>
                    <div className="text-[#FCE196] font-bold">ON HIGHWAY</div>
                    <div className="text-white/40">NH-48 Corridor</div>
                  </div>
                  <div>
                    <div className="w-6 h-6 rounded-full bg-white/20 text-white font-bold flex items-center justify-center mx-auto mb-1">
                      ○
                    </div>
                    <div className="text-white/60 font-bold">COLD DOCK</div>
                    <div className="text-white/40">Azadpur Hub</div>
                  </div>
                </div>
              </div>

              {/* Floating Delivery HUD Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <div className="text-[9px] font-mono text-[#9BC7A2]">STATUS</div>
                  <div className="font-display font-bold text-sm text-emerald-300 mt-0.5">ON ROUTE</div>
                  <div className="text-[9px] font-mono text-white/40">Speed: 62 km/h</div>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <div className="text-[9px] font-mono text-[#9BC7A2]">ESTIMATED ARRIVAL</div>
                  <div className="font-display font-bold text-sm text-[#FCE196] mt-0.5">14h 20m</div>
                  <div className="text-[9px] font-mono text-white/40">On Time Window</div>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <div className="text-[9px] font-mono text-[#9BC7A2]">VEHICLE</div>
                  <div className="font-display font-bold text-sm text-white mt-0.5">MH-15-EG-4402</div>
                  <div className="text-[9px] font-mono text-white/40">16-Ton Reefer</div>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <div className="text-[9px] font-mono text-[#9BC7A2]">INTERNAL TEMP</div>
                  <div className="font-display font-bold text-sm text-teal-300 mt-0.5">4.2°C</div>
                  <div className="text-[9px] font-mono text-emerald-400">Geo-Seal Locked</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between text-xs font-mono text-white/70">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-400" />
                  GEO-SEAL: <strong className="text-white">#4982-LOCKED</strong>
                </span>
                <span className="text-[#9BC7A2]">APEDA TRACE AUDIT: CONTINUOUS PASS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
