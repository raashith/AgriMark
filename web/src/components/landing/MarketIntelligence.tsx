'use client';

import React from 'react';
import { TrendingUp, AlertCircle, ArrowUpRight, BarChart3, LineChart, ShieldCheck } from 'lucide-react';

export const MarketIntelligence: React.FC = () => {
  const mandiSamples = [
    { commodity: 'Wheat (Sharbati)', mandi: 'Indore Mandi', price: '₹2,680', trend: '+4.2%', status: 'HIGH DEMAND' },
    { commodity: 'Red Onion (Nashik)', mandi: 'Lasalgaon Mandi', price: '₹1,950', trend: '+8.1%', status: 'RISING' },
    { commodity: 'Basmati Paddy (1121)', mandi: 'Karnal Mandi', price: '₹3,820', trend: '-1.5%', status: 'STABLE' },
    { commodity: 'Cotton (Long Staple)', mandi: 'Rajkot Mandi', price: '₹7,150', trend: '+5.6%', status: 'HIGH DEMAND' },
  ];

  return (
    <section id="market-intelligence" className="py-24 bg-[#0d1612] relative overflow-hidden border-t border-[#1e2d26]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-950/80 border border-amber-800/60 rounded-full text-xs font-mono font-bold text-amber-400 uppercase">
            <TrendingUp className="w-3.5 h-3.5" /> MARKET PRICE INTELLIGENCE
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Transparent price signals across <br />
            <span className="bg-gradient-to-r from-amber-400 via-emerald-300 to-teal-300 bg-clip-text text-transparent">
              500+ Indian agricultural mandis.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
            Eliminate asymmetric information. Compare official mandi arrival prices, active farmer listings, and AI demand predictions on one screen.
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#121a16] border border-[#1e2d26] rounded-xl text-[11px] font-mono text-gray-400">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Sample market rates displayed below are DEMO / ILLUSTRATIVE price signals.</span>
          </div>
        </div>

        {/* 3-Tier Price Signal Architecture */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-[#121a16] border border-[#1e2d26] rounded-3xl space-y-3 shadow-xl hover:border-amber-700/60 transition-colors">
            <span className="text-[10px] font-mono uppercase font-bold text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-800/60">
              1. MANDI REFERENCE
            </span>
            <h3 className="font-bold text-white text-lg">Observed Mandi Rates</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Real observation dates, min/modal/max prices, and verified Agmarknet APMC mandi sources.
            </p>
          </div>

          <div className="p-6 bg-[#121a16] border border-[#1e2d26] rounded-3xl space-y-3 shadow-xl hover:border-emerald-700/60 transition-colors">
            <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800/60">
              2. FARMER LISTING PRICE
            </span>
            <h3 className="font-bold text-white text-lg">Verified Produce Lots</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Farmer asking price, minimum order quantities, lot assay grades, and farm-gate pickup terms.
            </p>
          </div>

          <div className="p-6 bg-[#121a16] border border-[#1e2d26] rounded-3xl space-y-3 shadow-xl hover:border-purple-700/60 transition-colors">
            <span className="text-[10px] font-mono uppercase font-bold text-purple-400 bg-purple-950/80 px-2.5 py-1 rounded-lg border border-purple-800/60">
              3. AI DECISION SUPPORT
            </span>
            <h3 className="font-bold text-white text-lg">Forecasts & Signals</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Confidence-scored price trend forecasts, demand heatmaps, and optimal selling window suggestions.
            </p>
          </div>
        </div>

        {/* Live Mandi Ticker Sample Board */}
        <div className="bg-[#121a16] border border-[#1e2d26] rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#1e2d26] pb-4">
            <div>
              <h3 className="font-bold text-white text-base">Illustrative Mandi Ticker Feed</h3>
              <p className="text-xs text-gray-400">Sample commodities updated with arrival volumes and 24h deltas</p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 border border-emerald-800 px-3 py-1 rounded-full font-bold">
              ● DEMO DATA STREAM
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mandiSamples.map((item, idx) => (
              <div key={idx} className="p-4 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl space-y-2 hover:border-emerald-700 transition-colors">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">{item.commodity}</span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                    {item.status}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">{item.mandi}</p>
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-lg font-extrabold text-white font-mono">{item.price} <span className="text-[10px] text-gray-400 font-normal">/ Qtl</span></span>
                  <span className={`text-xs font-mono font-bold ${item.trend.startsWith('+') ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {item.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
