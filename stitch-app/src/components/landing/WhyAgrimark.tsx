'use client';

import React from 'react';
import { Sprout, Store, TrendingUp, Truck, FileSpreadsheet, Bot, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export const WhyAgrimark: React.FC = () => {
  const features = [
    { icon: Sprout, title: 'Farm Intelligence', badge: 'Cadastral 7/12', description: 'Digitize plot boundaries, crop health, satellite NDVI scouting, and verified soil moisture passports.', link: '/farm' },
    { icon: Store, title: 'Direct Marketplace', badge: 'B2B Trade', description: 'Connect directly with verified wholesale buyers, FPOs, and exporters without predatory middleman markups.', link: '/marketplace' },
    { icon: TrendingUp, title: 'Market Intelligence', badge: '3-Tier Pricing', description: 'Real-time APMC Mandi price tickers, transparent farmer ask prices, and 7-day AI demand forecasts.', link: '/marketplace' },
    { icon: Truck, title: 'Reefer Logistics', badge: 'GPS Telemetry', description: 'Automated cold-chain reefer booking, real-time temperature tracking, and gate-bay arrival notifications.', link: '/logistics/deliveries' },
    { icon: FileSpreadsheet, title: 'Digital Farm Khaata', badge: 'NABARD Ready', description: 'Automated season expense logging, revenue ledger, profit breakdown, and bankable credit scores.', link: '/finance' },
    { icon: Bot, title: 'Multilingual AgriAI', badge: '8+ Languages', description: '24/7 agronomic advisory, disease diagnostics, weather context, and market timing guidance in native tongues.', link: '/ai-assistant' },
  ];

  return (
    <section id="platform" className="py-24 bg-[#F7F5EE] text-[#19201D] relative overflow-hidden [perspective:1400px]">
      <div className="absolute -top-40 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-emerald-700/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-[-10rem] h-[28rem] w-[28rem] rounded-full bg-amber-300/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#1B4D3E]/10 border border-[#1B4D3E]/20 rounded-full text-xs font-mono font-bold text-[#1B4D3E] uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#E5A93C]" /> BHARAT AGRICULTURAL PLATFORM
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#19201D]">One ecosystem for the entire harvest journey.</h2>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-normal">
            Eliminating 5+ layers of intermediaries with real-time field telemetry, NABL quality assays, instant escrow settlement, and AI market foresight.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-16 [transform-style:preserve-3d]">
          {features.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className="group relative rounded-3xl border border-[#E7E5DC] bg-white p-8 shadow-sm transition-all duration-500 will-change-transform [transform-style:preserve-3d] hover:-translate-y-3 hover:[transform:perspective(900px)_rotateX(8deg)_rotateY(-7deg)_translateZ(24px)_scale(1.02)] hover:shadow-2xl hover:border-[#1B4D3E]"
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/5 via-transparent to-amber-400/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
                <div className="relative space-y-6 [transform:translateZ(35px)]">
                  <div className="flex items-center justify-between">
                    <div className="p-3.5 bg-[#F6F4ED] group-hover:bg-[#1B4D3E] rounded-2xl transition duration-300">
                      <IconComponent className="w-6 h-6 text-[#1B4D3E] group-hover:text-[#E5A93C] transition" />
                    </div>
                    <span className="px-3 py-1 bg-[#1B4D3E]/5 border border-[#1B4D3E]/15 rounded-full text-[11px] font-mono font-bold text-[#1B4D3E]">{item.badge}</span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-[#19201D] group-hover:text-[#1B4D3E] transition">{item.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed font-normal">{item.description}</p>
                  </div>
                  <div className="pt-6 mt-6 border-t border-[#F6F4ED]">
                    <Link href={item.link} className="inline-flex items-center gap-2 text-xs font-bold text-[#1B4D3E] group-hover:text-[#E5A93C] transition">
                      <span>Learn More</span>
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
