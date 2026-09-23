'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sprout,
  FileText,
  CloudSun,
  TrendingUp,
  Bot,
  Calendar,
  CheckCircle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export const FarmerSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'passport' | 'advisory' | 'harvest' | 'pricing'>('passport');

  const tabs = [
    { id: 'passport', label: '7/12 Land Passport', icon: FileText },
    { id: 'advisory', label: 'Crop Scouting & AI', icon: Bot },
    { id: 'harvest', label: 'Harvest Planning', icon: Calendar },
    { id: 'pricing', label: 'Mandi Price Signal', icon: TrendingUp },
  ];

  return (
    <section id="farmers" className="py-24 bg-[#19201D] text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#1B4D3E]/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading & Value Proposition */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-900/60 border border-emerald-700/60 rounded-full text-xs font-mono font-bold text-[#E5A93C] uppercase">
              <Sprout className="w-4 h-4 text-emerald-400" /> FOR PROGRESSIVE FARMERS
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-white">
              From field decisions to better market opportunities.
            </h2>

            <p className="text-base text-emerald-100/90 leading-relaxed font-normal">
              AgriMark turns every farm plot into a verified digital asset. Track cultivation milestones, receive instant localized disease warnings, and sell directly to verified institutional buyers.
            </p>

            {/* Checklist */}
            <div className="space-y-3 pt-2 text-sm text-emerald-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#E5A93C] shrink-0" />
                <span>Automated 7/12 land record validation & GIS plot mapping</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#E5A93C] shrink-0" />
                <span>Localized micro-weather forecasts & drip irrigation schedules</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#E5A93C] shrink-0" />
                <span>Direct digital sales contracts with instant bank disbursal</span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/farm/new"
                className="px-6 py-3.5 bg-[#E5A93C] hover:bg-[#d4982b] text-[#19201D] font-extrabold text-sm rounded-xl shadow-lg flex items-center gap-2 transition inline-flex"
              >
                <span>Build Your Farm Profile</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive Farmer Dashboard Preview */}
          <div className="lg:col-span-7 bg-[#143B30]/90 border border-emerald-700/60 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl space-y-6">
            {/* Tab Controls */}
            <div className="flex flex-wrap gap-2 pb-4 border-b border-emerald-800/80">
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-[#E5A93C] text-[#19201D] shadow-md'
                        : 'bg-emerald-950/80 text-emerald-200 hover:bg-emerald-900 hover:text-white'
                    }`}
                  >
                    <TabIcon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Tab Content Preview */}
            <div className="space-y-4">
              {activeTab === 'passport' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="bg-[#19201D] p-5 rounded-2xl border border-emerald-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-mono text-[#E5A93C] uppercase font-bold">
                        Plot #402 • Shree Ganesh Krishi Farm
                      </span>
                      <h4 className="text-lg font-bold text-white mt-0.5">4.5 Acres Cadastral Verified</h4>
                      <p className="text-xs text-emerald-200/70 mt-1">
                        Survey No: 148/2A • Niphad, Nashik • Kharif Onion 2026
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-800/80 text-emerald-200 border border-emerald-600/50 rounded-full text-xs font-mono font-bold text-center self-start sm:self-center">
                      7/12 VALIDATED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="bg-[#19201D] p-4 rounded-xl border border-emerald-900">
                      <span className="text-gray-400 font-mono text-[10px]">SOIL HEALTH</span>
                      <p className="text-sm font-bold text-emerald-300 mt-1">pH 7.2 • Organic Carbon 0.65%</p>
                    </div>
                    <div className="bg-[#19201D] p-4 rounded-xl border border-emerald-900">
                      <span className="text-gray-400 font-mono text-[10px]">CROP PASSCODE</span>
                      <p className="text-sm font-bold text-[#E5A93C] mt-1">#PASS-NSH-2026-X9</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'advisory' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="p-4 bg-emerald-950/90 border border-emerald-800 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#E5A93C] flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" /> AI Field Advisory Notice
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">High Priority</span>
                    </div>
                    <p className="text-xs text-emerald-100 font-medium leading-relaxed">
                      "Red Onion (Bhima Super) @ Day 62: High humidity expected. Apply 19:19:19 NPK foliar spray + Neem Oil (10,000 ppm) within 24 hours to prevent purple blotch."
                    </p>
                  </div>

                  <div className="p-4 bg-[#19201D] rounded-2xl border border-emerald-900 text-xs space-y-1">
                    <p className="text-gray-400 font-mono text-[10px]">SCUBA SATELLITE NDVI</p>
                    <p className="font-bold text-emerald-300">Canopy Vigour Index: 0.82 (Optimal Growth)</p>
                  </div>
                </div>
              )}

              {activeTab === 'harvest' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="p-4 bg-[#19201D] border border-emerald-900 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">Target Harvest Date</span>
                      <span className="font-mono text-[#E5A93C] font-bold">14 Oct 2026</span>
                    </div>
                    <div className="w-full bg-emerald-950 rounded-full h-2.5 overflow-hidden border border-emerald-800">
                      <div className="bg-[#E5A93C] h-full w-[70%]" />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-emerald-300/80">
                      <span>Expected Yield: 18,500 kg</span>
                      <span>Target Grade: NABL A</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'pricing' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="p-4 bg-[#19201D] border border-emerald-900 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-emerald-400 uppercase">Nashik APMC Today</span>
                      <h4 className="text-xl font-mono font-extrabold text-[#E5A93C]">₹2,450 / Qtl</h4>
                      <p className="text-[11px] text-gray-400">Modal rate • Updated 2h ago</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-purple-400 uppercase">7-Day AI Forecast</span>
                      <h4 className="text-xl font-mono font-extrabold text-purple-300">₹2,720 / Qtl</h4>
                      <p className="text-[11px] font-bold text-emerald-400">+4.8% Demand Surge</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
