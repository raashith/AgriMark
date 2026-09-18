'use client';

import React from 'react';
import { Sprout, Brain, TrendingUp, ShoppingCart, Truck, ShieldCheck, ArrowRight } from 'lucide-react';

export const WhyAgrimark: React.FC = () => {
  const capabilities = [
    {
      title: 'Farm Management',
      badge: 'FARM KHAATA',
      desc: 'Digital farm boundaries, crop season phenology tracking, input application ledgers, and harvest labor accounting.',
      icon: Sprout,
      color: 'from-emerald-950/80 to-emerald-900/40 border-emerald-800/60 text-emerald-400',
      accent: 'emerald',
      colSpan: 'md:col-span-8',
    },
    {
      title: 'AI Crop Intelligence',
      badge: 'SPECTRAL VISION',
      desc: 'Instant pest & disease diagnosis from leaf photos, satellite soil moisture index, and customized spray schedules.',
      icon: Brain,
      color: 'from-purple-950/80 to-purple-900/40 border-purple-800/60 text-purple-400',
      accent: 'purple',
      colSpan: 'md:col-span-4',
    },
    {
      title: 'Market Discovery',
      badge: 'MANDI SIGNALS',
      desc: 'Real-time price tickers across 500+ government mandis paired with AI price forecasts and arrival volume trends.',
      icon: TrendingUp,
      color: 'from-amber-950/80 to-amber-900/40 border-amber-800/60 text-amber-400',
      accent: 'amber',
      colSpan: 'md:col-span-4',
    },
    {
      title: 'Direct Marketplace',
      badge: 'BUYER ESCROW',
      desc: 'Sell verified produce lots directly to institutional buyers with automated quality grading and zero payment defaults.',
      icon: ShoppingCart,
      color: 'from-teal-950/80 to-teal-900/40 border-teal-800/60 text-teal-400',
      accent: 'teal',
      colSpan: 'md:col-span-8',
    },
    {
      title: 'Cold Chain Logistics',
      badge: 'REEFER GPS',
      desc: 'On-demand reefer trucks with continuous temperature telemetry, digital gate passes, and automated dock scheduling.',
      icon: Truck,
      color: 'from-blue-950/80 to-blue-900/40 border-blue-800/60 text-blue-400',
      accent: 'blue',
      colSpan: 'md:col-span-6',
    },
    {
      title: 'Lot Traceability',
      badge: 'QR PASSPORT',
      desc: 'End-to-end QR lot passports verifying farm origin, chemical spray history, assay results, and transport chain.',
      icon: ShieldCheck,
      color: 'from-emerald-950/80 to-emerald-900/40 border-emerald-800/60 text-emerald-400',
      accent: 'emerald',
      colSpan: 'md:col-span-6',
    },
  ];

  return (
    <section id="why-agrimark" className="py-24 bg-[#0a0f0d] relative overflow-hidden border-t border-[#1e2d26]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="px-3.5 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded-full text-xs font-mono font-bold text-emerald-400 tracking-wider uppercase">
            WHY AGRIMARK
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            One platform for the entire <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              agricultural journey.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
            Eliminate fragmented tools, unverified middlemen, and opaque pricing with a unified operating system built for modern Indian agriculture.
          </p>
        </div>

        {/* Asymmetrical Capability Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {capabilities.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                className={`${item.colSpan} bg-gradient-to-b ${item.color} p-8 rounded-3xl border transition-all duration-300 hover:border-emerald-500/60 hover:scale-[1.01] shadow-xl relative overflow-hidden group flex flex-col justify-between space-y-6`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold tracking-widest px-2.5 py-1 bg-[#0a0f0d]/80 rounded-lg border border-[#1e2d26] uppercase">
                      {item.badge}
                    </span>
                    <div className="p-2.5 bg-[#0a0f0d]/80 border border-[#1e2d26] rounded-xl group-hover:scale-110 transition-transform">
                      <IconComp className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-2 text-xs font-bold text-emerald-400 opacity-80 group-hover:opacity-100 transition-opacity">
                  <span>Learn more</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
