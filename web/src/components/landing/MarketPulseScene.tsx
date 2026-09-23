'use client';

import React from 'react';

export const MarketPulseScene: React.FC = () => {
  return (
    <section id="scene-market" className="scene-target py-28 relative border-t border-white/10 reveal-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-block px-3 py-1 rounded-full holo-glass-subtle text-[11px] font-mono tracking-widest text-[#E5A93C] uppercase">
              03 // Live Mandi Signals &amp; Arbitrage
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-white">
              See the market before you make the move.
            </h2>
            <p className="text-base text-[#F7F5EE]/75">
              Transparent distinction between verified real-time Mandi transaction receipts and predictive AI forecast models.
            </p>
          </div>

          {/* Legend Pill */}
          <div className="flex items-center gap-4 text-xs font-mono holo-glass px-4 py-2 rounded-xl border border-white/10">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
              <span className="text-white/80">OBSERVED DATA (APMC)</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E5A93C]" />
              <span className="text-[#FCE196]">AI PREDICTIVE SIGNAL</span>
            </span>
          </div>
        </div>

        {/* Live Commodity Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {/* Commodity 1: Tomato Hybrid */}
          <div className="holo-glass rounded-2xl p-5 border border-white/10 hover:border-[#E5A93C]/60 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🍅</span>
                <div>
                  <h4 className="font-display font-bold text-base text-white">Tomato (Hybrid)</h4>
                  <div className="text-[10px] font-mono text-[#9BC7A2]">Azadpur APMC • Delhi</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 text-[9px] font-mono font-bold border border-teal-500/40">
                OBSERVED
              </span>
            </div>
            <div className="space-y-2 py-1">
              <div className="flex justify-between items-baseline">
                <span className="text-[11px] font-mono text-white/50">Spot Price:</span>
                <span className="font-display text-xl font-bold text-white">
                  ₹ 4,860 <span className="text-[10px] font-normal">/ Qtl</span>
                </span>
              </div>
              <div className="flex justify-between items-baseline text-xs font-mono">
                <span className="text-white/50">Day Trend:</span>
                <span className="font-bold text-emerald-400">▲ +18.6%</span>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-[#E5A93C]/30 text-[10px] font-mono text-[#FCE196] flex justify-between items-center">
                <span>AgriAI 72h Forecast:</span>
                <span className="font-bold">₹ 5,200 (89%)</span>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-white/10 flex justify-between text-[10px] font-mono text-white/50">
              <span>VOL: 420 MT</span>
              <span>SPREAD: +₹340/Qtl</span>
            </div>
          </div>

          {/* Commodity 2: Basmati 1121 */}
          <div className="holo-glass rounded-2xl p-5 border border-white/10 hover:border-[#E5A93C]/60 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌾</span>
                <div>
                  <h4 className="font-display font-bold text-base text-white">Basmati 1121</h4>
                  <div className="text-[10px] font-mono text-[#9BC7A2]">Karnal Mandi • Haryana</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 text-[9px] font-mono font-bold border border-teal-500/40">
                OBSERVED
              </span>
            </div>
            <div className="space-y-2 py-1">
              <div className="flex justify-between items-baseline">
                <span className="text-[11px] font-mono text-white/50">Spot Price:</span>
                <span className="font-display text-xl font-bold text-white">
                  ₹ 3,920 <span className="text-[10px] font-normal">/ Qtl</span>
                </span>
              </div>
              <div className="flex justify-between items-baseline text-xs font-mono">
                <span className="text-white/50">Day Trend:</span>
                <span className="font-bold text-teal-300">▲ +3.2%</span>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-[#E5A93C]/30 text-[10px] font-mono text-[#FCE196] flex justify-between items-center">
                <span>AgriAI 72h Forecast:</span>
                <span className="font-bold">₹ 4,050 (94%)</span>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-white/10 flex justify-between text-[10px] font-mono text-white/50">
              <span>VOL: 1,840 MT</span>
              <span>SPREAD: +₹130/Qtl</span>
            </div>
          </div>

          {/* Commodity 3: Soybean Yellow */}
          <div className="holo-glass rounded-2xl p-5 border border-white/10 hover:border-[#E5A93C]/60 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌱</span>
                <div>
                  <h4 className="font-display font-bold text-base text-white">Soybean Yellow</h4>
                  <div className="text-[10px] font-mono text-[#9BC7A2]">Indore APMC • MP</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-[#FCE196] text-[9px] font-mono font-bold border border-amber-500/40">
                AI SIGNAL
              </span>
            </div>
            <div className="space-y-2 py-1">
              <div className="flex justify-between items-baseline">
                <span className="text-[11px] font-mono text-white/50">Spot Price:</span>
                <span className="font-display text-xl font-bold text-white">
                  ₹ 4,680 <span className="text-[10px] font-normal">/ Qtl</span>
                </span>
              </div>
              <div className="flex justify-between items-baseline text-xs font-mono">
                <span className="text-white/50">Day Trend:</span>
                <span className="font-bold text-amber-400">▼ -1.1%</span>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-[#E5A93C]/30 text-[10px] font-mono text-[#FCE196] flex justify-between items-center">
                <span>Arbitrage Destination:</span>
                <span className="font-bold">Latur (+₹140 margin)</span>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-white/10 flex justify-between text-[10px] font-mono text-white/50">
              <span>VOL: 950 MT</span>
              <span>CRUSH PARITY: HIGH</span>
            </div>
          </div>

          {/* Commodity 4: Cotton Shankar-6 */}
          <div className="holo-glass rounded-2xl p-5 border border-white/10 hover:border-[#E5A93C]/60 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">☁️</span>
                <div>
                  <h4 className="font-display font-bold text-base text-white">Cotton Shankar-6</h4>
                  <div className="text-[10px] font-mono text-[#9BC7A2]">Rajkot APMC • Gujarat</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-[#FCE196] text-[9px] font-mono font-bold border border-amber-500/40">
                AI SIGNAL
              </span>
            </div>
            <div className="space-y-2 py-1">
              <div className="flex justify-between items-baseline">
                <span className="text-[11px] font-mono text-white/50">Spot Price:</span>
                <span className="font-display text-xl font-bold text-white">
                  ₹ 7,120 <span className="text-[10px] font-normal">/ Candy</span>
                </span>
              </div>
              <div className="flex justify-between items-baseline text-xs font-mono">
                <span className="text-white/50">Day Trend:</span>
                <span className="font-bold text-emerald-400">▲ +2.4%</span>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-[#E5A93C]/30 text-[10px] font-mono text-[#FCE196] flex justify-between items-center">
                <span>AgriAI 72h Forecast:</span>
                <span className="font-bold">₹ 7,340 (91%)</span>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-white/10 flex justify-between text-[10px] font-mono text-white/50">
              <span>VOL: 2,100 Bales</span>
              <span>EXPORT DEMAND: STRONG</span>
            </div>
          </div>
        </div>

        {/* Interactive Arbitrage Calculator Matrix */}
        <div className="holo-glass rounded-3xl p-6 sm:p-8 border border-[#E5A93C]/30">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div>
              <div className="text-[10px] font-mono text-[#9BC7A2] tracking-wider uppercase">
                DYNAMIC ARBITRAGE CALCULATOR MATRIX
              </div>
              <h3 className="font-display text-xl font-bold text-white mt-1">Mandi Spread vs Freight Route Net Margin</h3>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-white/60">Selected Route:</span>
              <span className="px-3 py-1 rounded bg-[#1B4D3E] text-[#FCE196] border border-[#E5A93C]/40">
                Nashik (Source) → Azadpur (Delhi Destination)
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
            <div className="p-4 rounded-xl bg-black/40 border border-white/5">
              <div className="text-[10px] font-mono text-[#9BC7A2]">ORIGIN MANDI SPOT</div>
              <div className="font-display text-2xl font-bold text-white mt-1">
                ₹ 38.50 <span className="text-xs font-normal">/ kg</span>
              </div>
              <div className="text-[10px] font-mono text-white/50 mt-1">Nashik APMC Local</div>
            </div>
            <div className="p-4 rounded-xl bg-black/40 border border-white/5">
              <div className="text-[10px] font-mono text-[#9BC7A2]">DESTINATION SPOT</div>
              <div className="font-display text-2xl font-bold text-[#FCE196] mt-1">
                ₹ 52.00 <span className="text-xs font-normal">/ kg</span>
              </div>
              <div className="text-[10px] font-mono text-emerald-400 mt-1">Azadpur APMC Delhi</div>
            </div>
            <div className="p-4 rounded-xl bg-black/40 border border-white/5">
              <div className="text-[10px] font-mono text-[#9BC7A2]">LOGISTICS &amp; TOLL DEDUCTION</div>
              <div className="font-display text-2xl font-bold text-amber-300 mt-1">
                ₹ 4.80 <span className="text-xs font-normal">/ kg</span>
              </div>
              <div className="text-[10px] font-mono text-white/50 mt-1">1,380 km Cold Reefer</div>
            </div>
            <div className="p-4 rounded-xl bg-[#1B4D3E]/30 border border-[#E5A93C]/40">
              <div className="text-[10px] font-mono text-[#9BC7A2]">NET ARBITRAGE REALIZED</div>
              <div className="font-display text-2xl font-bold text-emerald-300 mt-1">
                + ₹ 8.70 <span className="text-xs font-normal">/ kg</span>
              </div>
              <div className="text-[10px] font-mono text-[#FCE196] mt-1">₹87,000 / 10 MT Truckload</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
