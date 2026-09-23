'use client';

import React from 'react';
import Link from 'next/link';

export const AgriAiScene: React.FC = () => {
  return (
    <section id="scene-ai" className="scene-target py-28 relative border-t border-white/10 reveal-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Copy & Explanation */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-block px-3 py-1 rounded-full holo-glass-subtle text-[11px] font-mono tracking-widest text-[#E5A93C] uppercase">
              05 // Cognitive Agri Models
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-white leading-tight">
              AI that understands the farm.
            </h2>
            <p className="text-base text-[#F7F5EE]/75 leading-relaxed">
              Not a generic text chatbot. AgriMark AI is a specialized decision engine ingesting satellite radar, soil probes, Mandi arrival volumes, and monsoon vectors to guide production and trading moves.
            </p>

            <div className="space-y-3">
              <div className="p-4 rounded-xl holo-glass border border-white/10">
                <div className="text-xs font-mono text-[#E5A93C] font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E5A93C]" />
                  DISEASE VECTOR DEFENSE
                </div>
                <p className="text-xs text-white/80 mt-1">
                  Predicts Early Blight and powdery mildew risk 96 hours before visual spore symptoms appear on foliar tissues.
                </p>
              </div>

              <div className="p-4 rounded-xl holo-glass border border-white/10">
                <div className="text-xs font-mono text-teal-300 font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-300" />
                  DYNAMIC PRICE ARBITRAGE
                </div>
                <p className="text-xs text-white/80 mt-1">
                  Calculates optimal freight routing to capture higher mandi spreads after net diesel and toll deductions.
                </p>
              </div>

              <div className="p-4 rounded-xl holo-glass border border-white/10">
                <div className="text-xs font-mono text-emerald-300 font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-300" />
                  AUTOMATED CONTRACT EXECUTION
                </div>
                <p className="text-xs text-white/80 mt-1">
                  Triggers automated purchase agreements when buyer bid spreads exceed pre-configured price targets.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-display font-bold text-sm bg-gradient-to-r from-[#E5A93C] to-amber-500 text-[#07110D] shadow-gold-glow hover:scale-[1.02] transition-transform"
              >
                LAUNCH AGRIAI CONSOLE
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right: 3D High-Tech Terminal Command Visualizer */}
          <div className="lg:col-span-7">
            <div className="holo-glass rounded-3xl p-6 sm:p-8 border border-[#E5A93C]/35 shadow-2xl relative">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E5A93C] animate-ping" />
                  <span className="font-mono text-xs font-bold text-white uppercase">
                    AGRIAI_CORE // ADVISORY_RUN_#992
                  </span>
                </div>
                <span className="text-xs font-mono text-[#9BC7A2]">CONFIDENCE: 94.2%</span>
              </div>

              {/* Ingestion Inputs Strip */}
              <div className="text-[10px] font-mono text-white/50 uppercase mb-2">
                TELEMETRY INGESTION STREAM
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                <div className="p-2.5 rounded-lg bg-black/50 border border-white/5 text-[10px] font-mono">
                  <span className="text-white/40 block">GENOTYPE</span>
                  <span className="text-white font-bold">Pomegranate (Bhagwa)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-black/50 border border-white/5 text-[10px] font-mono">
                  <span className="text-white/40 block">SOIL PROBES</span>
                  <span className="text-emerald-300 font-bold">12 Sensors Online</span>
                </div>
                <div className="p-2.5 rounded-lg bg-black/50 border border-white/5 text-[10px] font-mono">
                  <span className="text-white/40 block">RADAR NDVI</span>
                  <span className="text-teal-300 font-bold">Sentinel-2 10m VI</span>
                </div>
                <div className="p-2.5 rounded-lg bg-black/50 border border-white/5 text-[10px] font-mono">
                  <span className="text-white/40 block">MANDI INFLOW</span>
                  <span className="text-[#FCE196] font-bold">APMC Azadpur Feed</span>
                </div>
              </div>

              {/* AI Advisory Outputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                  <div className="text-[9px] font-mono text-white/50">HARVEST TIMING ADVICE</div>
                  <div className="font-display font-bold text-[#FCE196] text-sm mt-0.5">Defer 48h for Sugar Peak</div>
                  <div className="text-[11px] text-white/70 font-mono mt-1">Projected weight gain: +3.8%</div>
                </div>
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                  <div className="text-[9px] font-mono text-white/50">MANDI INFLOW SIGNAL</div>
                  <div className="font-display font-bold text-teal-300 text-sm mt-0.5">Surplus expected Monday</div>
                  <div className="text-[11px] text-teal-200 font-mono mt-1">Dispatch to Bangalore Hub</div>
                </div>
              </div>

              {/* Terminal Synthesis Output */}
              <div className="p-4 rounded-xl bg-[#04100B] border border-white/10 font-mono text-xs text-[#9BC7A2] space-y-1.5 shadow-inner">
                <div className="text-white/40 flex items-center justify-between">
                  <span>{'// Auto-generated prompt synthesis:'}</span>
                  <span className="text-[10px] text-emerald-400">STATUS: READY_FOR_EXECUTION</span>
                </div>
                <div>&gt; [AGRIAI]: Inflow at Azadpur down 22% due to road freight blockade in Yamuna corridor.</div>
                <div className="text-[#E5A93C] font-semibold">
                  &gt; ACTION: Lock contract with buyer #BY-901 at ₹52/kg before secondary supply arrives.
                </div>
                <div className="text-white/50 text-[11px]">
                  &gt; AUTO-ROUTE: Dispatch Reefer #12 via Western Peripheral Expressway to avoid bottleneck.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
