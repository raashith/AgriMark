'use client';

import React, { useState } from 'react';
import { TrendingUp, BarChart3, Info, ShieldCheck, MapPin, Zap } from 'lucide-react';
import Link from 'next/link';

export const MarketIntelligenceSection: React.FC = () => {
  const [selectedCrop, setSelectedCrop] = useState<'onion' | 'potato' | 'pomegranate' | 'cotton'>('onion');

  const cropData = {
    onion: {
      name: 'Red Onion (Grade A)',
      mandi: 'Nashik APMC',
      currentPrice: '₹2,450',
      askPrice: '₹2,600',
      forecastPrice: '₹2,720',
      change: '+4.8%',
      demandHub: 'Mumbai, Bhiwandi & Surat',
      signal: 'HIGH DEMAND SURGE',
      trend: [2300, 2350, 2400, 2450, 2550, 2650, 2720],
    },
    potato: {
      name: 'Kufri Jyoti Potato',
      mandi: 'Agra Mandi',
      currentPrice: '₹1,680',
      askPrice: '₹1,800',
      forecastPrice: '₹1,890',
      change: '+3.2%',
      demandHub: 'Delhi NCR & Lucknow',
      signal: 'STABLE ACCUMULATION',
      trend: [1600, 1620, 1650, 1680, 1750, 1820, 1890],
    },
    pomegranate: {
      name: 'Bhagwa Pomegranate',
      mandi: 'Solapur APMC',
      currentPrice: '₹9,200',
      askPrice: '₹9,800',
      forecastPrice: '₹10,400',
      change: '+6.1%',
      demandHub: 'Bengaluru & Hyderabad',
      signal: 'EXPORT DEMAND RALLY',
      trend: [8800, 8950, 9100, 9200, 9600, 10000, 10400],
    },
    cotton: {
      name: 'Bt Cotton (Long Staple)',
      mandi: 'Rajkot APMC',
      currentPrice: '₹7,150',
      askPrice: '₹7,450',
      forecastPrice: '₹7,680',
      change: '+2.9%',
      demandHub: 'Ahmedabad & Coimbatore',
      signal: 'SPINNING MILL DISPATCH',
      trend: [6900, 7000, 7080, 7150, 7300, 7500, 7680],
    },
  };

  const activeData = cropData[selectedCrop];

  return (
    <section id="intelligence" className="py-24 bg-[#19201D] text-white relative overflow-hidden">
      {/* Background Lighting */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1B4D3E]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-950/80 border border-emerald-700/60 rounded-full text-xs font-mono font-bold text-[#E5A93C] uppercase">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> MANDI PRICE FORESIGHT
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            See the market before you sell.
          </h2>
          <p className="text-base text-emerald-100/80 leading-relaxed font-normal">
            Real-time APMC Mandi price discovery paired with 7-day AI predictive demand signals across India’s major wholesale logistics hubs.
          </p>
        </div>

        {/* Interactive Commodity Intelligence Chart Container */}
        <div className="mt-16 bg-[#143B30]/90 border border-emerald-700/60 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl space-y-8">
          {/* Commodity Selector Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-emerald-800/80">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'onion', label: 'Red Onion' },
                { id: 'potato', label: 'Potato' },
                { id: 'pomegranate', label: 'Pomegranate' },
                { id: 'cotton', label: 'Bt Cotton' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedCrop(item.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    selectedCrop === item.id
                      ? 'bg-[#E5A93C] text-[#19201D] shadow-md'
                      : 'bg-emerald-950/80 text-emerald-200 hover:bg-emerald-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Disclaimer pill */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-300/70 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-800/60">
              <Info className="w-3.5 h-3.5 text-[#E5A93C]" />
              <span>Illustrative Mandi & AI Demand Forecast Model</span>
            </div>
          </div>

          {/* Price Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#19201D] p-5 rounded-2xl border border-emerald-900 space-y-1">
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">1. APMC Mandi Rate</span>
              <p className="text-2xl font-mono font-extrabold text-white">{activeData.currentPrice} <span className="text-xs font-normal text-gray-400">/ Qtl</span></p>
              <p className="text-[11px] text-gray-400">{activeData.mandi}</p>
            </div>

            <div className="bg-[#19201D] p-5 rounded-2xl border border-emerald-900 space-y-1">
              <span className="text-[10px] font-mono text-[#E5A93C] uppercase font-bold">2. Direct Farmer Ask</span>
              <p className="text-2xl font-mono font-extrabold text-[#E5A93C]">{activeData.askPrice} <span className="text-xs font-normal text-amber-200/60">/ Qtl</span></p>
              <p className="text-[11px] text-emerald-300/80">Grade A Verified Lot</p>
            </div>

            <div className="bg-[#19201D] p-5 rounded-2xl border border-emerald-900 space-y-1">
              <span className="text-[10px] font-mono text-purple-400 uppercase font-bold">3. 7-Day AI Forecast</span>
              <p className="text-2xl font-mono font-extrabold text-purple-300">{activeData.forecastPrice} <span className="text-xs font-bold text-emerald-400">{activeData.change}</span></p>
              <p className="text-[11px] text-purple-200/70">{activeData.signal}</p>
            </div>

            <div className="bg-[#19201D] p-5 rounded-2xl border border-emerald-900 space-y-1">
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Demand Hubs</span>
              <p className="text-xs font-bold text-white leading-snug pt-1">{activeData.demandHub}</p>
              <p className="text-[11px] text-gray-400">Wholesale buyer interest</p>
            </div>
          </div>

          {/* Visual Trend Chart Simulation */}
          <div className="bg-[#19201D] p-6 rounded-2xl border border-emerald-900 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-300">
              <span>Historical Mandi Rate (Day 1 - 4)</span>
              <span className="text-[#E5A93C]">AI Demand Forecast Projection (Day 5 - 7)</span>
            </div>

            <div className="h-40 flex items-end justify-between gap-3 pt-6 border-b border-emerald-900/80 px-4">
              {activeData.trend.map((val, i) => {
                const heightPct = Math.min(100, Math.max(20, (val / 11000) * 100));
                const isForecast = i >= 4;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-mono text-emerald-300 opacity-0 group-hover:opacity-100 transition">
                      ₹{val}
                    </span>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        isForecast
                          ? 'bg-gradient-to-t from-purple-800 to-[#E5A93C] shadow-lg shadow-amber-500/20'
                          : 'bg-emerald-800 hover:bg-emerald-700'
                      }`}
                    />
                    <span className="text-[10px] font-mono text-gray-400">Day {i + 1}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
