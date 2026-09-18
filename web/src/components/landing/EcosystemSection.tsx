'use client';

import React from 'react';
import { Sprout, Users, ShoppingCart, Truck, TrendingUp, Brain, ArrowRight } from 'lucide-react';

export const EcosystemSection: React.FC = () => {
  const actors = [
    { title: 'Farmers & Cultivators', role: 'Produce Growers', icon: Sprout, color: 'text-emerald-400 border-emerald-800 bg-emerald-950/60' },
    { title: 'FPOs & Co-operatives', role: 'Batch Aggregators', icon: Users, color: 'text-teal-400 border-teal-800 bg-teal-950/60' },
    { title: 'Wholesale Buyers', role: 'Processors & Exporters', icon: ShoppingCart, color: 'text-amber-400 border-amber-800 bg-amber-950/60' },
    { title: 'Reefer Logistics', role: 'Cold Chain Transporters', icon: Truck, color: 'text-blue-400 border-blue-800 bg-blue-950/60' },
    { title: 'Government Mandis', role: 'APMC Price Boards', icon: TrendingUp, color: 'text-purple-400 border-purple-800 bg-purple-950/60' },
    { title: 'AgriMark AI Engine', role: 'Agronomy & Trade Intelligence', icon: Brain, color: 'text-emerald-400 border-emerald-800 bg-emerald-950/60' },
  ];

  return (
    <section id="ecosystem" className="py-24 bg-[#0a0f0d] relative overflow-hidden border-t border-[#1e2d26]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="px-3.5 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded-full text-xs font-mono font-bold text-emerald-400 tracking-wider uppercase">
            UNIFIED NETWORK
          </span>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Connecting the entire <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              agricultural value chain.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
            AgriMark brings together every participant in Indian agriculture onto a single interoperable operating system.
          </p>
        </div>

        {/* 6 Connected Nodes Network */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {actors.map((actor, idx) => {
            const IconComp = actor.icon;
            return (
              <div
                key={idx}
                className="p-6 bg-[#121a16] border border-[#1e2d26] hover:border-emerald-700/60 rounded-3xl space-y-4 shadow-xl transition-all duration-300 hover:scale-[1.03] group flex items-center gap-4"
              >
                <div className={`p-3.5 rounded-2xl border ${actor.color} shrink-0 group-hover:scale-110 transition-transform`}>
                  <IconComp className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-gray-400 uppercase font-bold block">{actor.role}</span>
                  <h3 className="font-extrabold text-white text-base group-hover:text-emerald-300 transition-colors">
                    {actor.title}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
