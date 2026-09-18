'use client';

import React from 'react';
import { Sprout, PackageCheck, ShoppingCart, Users, Truck, CheckCircle2, ChevronRight } from 'lucide-react';

export const MarketplaceFlow: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'FARM',
      desc: 'Crop cultivation mapped with digital survey boundary & Soil Khata.',
      icon: Sprout,
      color: 'text-emerald-400 border-emerald-800/60 bg-emerald-950/60',
    },
    {
      step: '02',
      title: 'HARVEST',
      desc: 'Produce harvested, sorted, and recorded in digital lot ledger.',
      icon: PackageCheck,
      color: 'text-teal-400 border-teal-800/60 bg-teal-950/60',
    },
    {
      step: '03',
      title: 'LIST',
      desc: 'Lot listed on AgriMark with quality assay score & asking price.',
      icon: ShoppingCart,
      color: 'text-amber-400 border-amber-800/60 bg-amber-950/60',
    },
    {
      step: '04',
      title: 'BUYER',
      desc: 'Verified institutional buyer inspects lot & locks escrow payment.',
      icon: Users,
      color: 'text-purple-400 border-purple-800/60 bg-purple-950/60',
    },
    {
      step: '05',
      title: 'LOGISTICS',
      desc: 'Reefer cold chain truck dispatched with real-time GPS tracking.',
      icon: Truck,
      color: 'text-blue-400 border-blue-800/60 bg-blue-950/60',
    },
    {
      step: '06',
      title: 'DELIVERY',
      desc: 'Dock gate pass verified, quality re-assayed, and escrow released.',
      icon: CheckCircle2,
      color: 'text-emerald-400 border-emerald-800/60 bg-emerald-950/60',
    },
  ];

  return (
    <section id="marketplace-flow" className="py-24 bg-[#0a0f0d] relative overflow-hidden border-t border-[#1e2d26]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="px-3.5 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded-full text-xs font-mono font-bold text-emerald-400 tracking-wider uppercase">
            THE AGRIMARK WORKFLOW
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            From seed to settlement in <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              6 transparent steps.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
            Every transaction on AgriMark is backed by cryptographic lot passports, real-time logistics tracking, and automated escrow.
          </p>
        </div>

        {/* 6-Step Horizontal / Stacked Journey */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {steps.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                className="bg-[#121a16] border border-[#1e2d26] hover:border-emerald-700/60 rounded-3xl p-6 transition-all duration-300 hover:scale-[1.03] shadow-xl relative flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-extrabold text-gray-400 bg-[#0a0f0d] px-2.5 py-1 rounded-lg border border-[#1e2d26]">
                      {item.step}
                    </span>
                    <div className={`p-2 rounded-xl border ${item.color} group-hover:scale-110 transition-transform`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="font-extrabold text-base text-white tracking-wide group-hover:text-emerald-300 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-gray-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 p-1 bg-[#121a16] border border-[#1e2d26] rounded-full text-emerald-400">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
