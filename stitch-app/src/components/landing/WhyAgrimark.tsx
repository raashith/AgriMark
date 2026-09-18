'use client';

import React from 'react';
import {
  Sprout,
  Store,
  TrendingUp,
  Truck,
  FileSpreadsheet,
  Bot,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

export const WhyAgrimark: React.FC = () => {
  const features = [
    {
      icon: Sprout,
      title: 'Farm Intelligence',
      badge: 'Cadastral 7/12',
      description:
        'Digitize plot boundaries, crop health, satellite NDVI scouting, and verified soil moisture passports.',
      link: '/farm',
      accent: 'emerald',
    },
    {
      icon: Store,
      title: 'Direct Marketplace',
      badge: 'B2B Trade',
      description:
        'Connect directly with verified wholesale buyers, FPOs, and exporters without predatory middleman markups.',
      link: '/marketplace',
      accent: 'gold',
    },
    {
      icon: TrendingUp,
      title: 'Market Intelligence',
      badge: '3-Tier Pricing',
      description:
        'Real-time APMC Mandi price tickers, transparent farmer ask prices, and 7-day AI demand forecasts.',
      link: '/marketplace',
      accent: 'emerald',
    },
    {
      icon: Truck,
      title: 'Reefer Logistics',
      badge: 'GPS Telemetry',
      description:
        'Automated cold-chain reefer booking, real-time temperature tracking, and gate-bay arrival notifications.',
      link: '/logistics/deliveries',
      accent: 'gold',
    },
    {
      icon: FileSpreadsheet,
      title: 'Digital Farm Khaata',
      badge: 'NABARD Ready',
      description:
        'Automated season expense logging, revenue ledger, profit breakdown, and bankable credit scores.',
      link: '/finance',
      accent: 'emerald',
    },
    {
      icon: Bot,
      title: 'Multilingual AgriAI',
      badge: '8+ Languages',
      description:
        '24/7 agronomic advisory, disease diagnostics, weather context, and market timing guidance in native tongues.',
      link: '/ai-assistant',
      accent: 'gold',
    },
  ];

  return (
    <section id="platform" className="py-24 bg-[#F7F5EE] text-[#19201D] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#1B4D3E]/10 border border-[#1B4D3E]/20 rounded-full text-xs font-mono font-bold text-[#1B4D3E] uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#E5A93C]" /> BHARAT AGRICULTURAL PLATFORM
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#19201D]">
            One ecosystem for the entire harvest journey.
          </h2>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-normal">
            Eliminating 5+ layers of intermediaries with real-time field telemetry, NABL quality assays, instant escrow settlement, and AI market foresight.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-16">
          {features.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className="group relative bg-white border border-[#E7E5DC] rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:border-[#1B4D3E] transition-all duration-300 flex flex-col justify-between"
              >
                {/* Top Badge & Icon */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="p-3.5 bg-[#F6F4ED] group-hover:bg-[#1B4D3E] rounded-2xl transition duration-300">
                      <IconComponent className="w-6 h-6 text-[#1B4D3E] group-hover:text-[#E5A93C] transition" />
                    </div>
                    <span className="px-3 py-1 bg-[#1B4D3E]/5 border border-[#1B4D3E]/15 rounded-full text-[11px] font-mono font-bold text-[#1B4D3E]">
                      {item.badge}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-[#19201D] group-hover:text-[#1B4D3E] transition">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Link Action */}
                <div className="pt-6 mt-6 border-t border-[#F6F4ED]">
                  <Link
                    href={item.link}
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#1B4D3E] group-hover:text-[#E5A93C] transition"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
