'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sprout, CheckCircle2, ArrowRight, Shield, Zap, TrendingUp, Sparkles } from 'lucide-react';

export const FarmerSection: React.FC = () => {
  const farmerFeatures = [
    { title: 'Digital Farm Setup', desc: 'Map land survey boundaries, soil classification, and water source access in minutes.' },
    { title: 'Crop Phenology Planning', desc: 'AI-guided sowing calendars, fertilizer application intervals, and harvest window estimation.' },
    { title: 'Real-Time Mandi Prices', desc: 'Compare live rates across nearby APMCs before cutting or harvesting your produce.' },
    { title: 'Direct Buyer Contracts', desc: 'Post harvest lots directly to institutional buyers and lock in guaranteed escrow payouts.' },
    { title: 'Vernacular AI Assistant', desc: 'Ask agronomy questions in your regional language via voice or text.' },
    { title: 'Logistics Pickup', desc: 'Book verified reefer trucks right from your farm gate with live GPS tracking.' },
  ];

  return (
    <section id="for-farmers" className="py-24 bg-gradient-to-b from-[#0a0f0d] via-[#0d1612] to-[#0a0f0d] relative overflow-hidden border-t border-[#1e2d26]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Detail */}
          <div className="lg:col-span-6 space-y-6">
            <span className="px-3.5 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded-full text-xs font-mono font-bold text-emerald-400 tracking-wider uppercase inline-flex items-center gap-2">
              <Sprout className="w-3.5 h-3.5" /> FOR FARMERS & FPOs
            </span>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Empowering farmers with <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                sovereign data & fair markets.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              Take complete control of your agricultural enterprise. From soil diagnostics to guaranteed market settlement, AgriMark equips you to farm smarter and earn more.
            </p>

            {/* Feature Bullet List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {farmerFeatures.map((item, idx) => (
                <div key={idx} className="p-4 bg-[#121a16] border border-[#1e2d26] rounded-2xl space-y-1.5 hover:border-emerald-800 transition-colors">
                  <div className="flex items-center gap-2 font-bold text-white text-xs sm:text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{item.title}</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-gray-400 leading-normal pl-6">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="pt-4">
              <Link
                href="/auth/register"
                className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold rounded-full text-sm shadow-xl shadow-emerald-950/80 inline-flex items-center gap-3 transition-all duration-200 hover:scale-105"
              >
                <span>START FARMING SMARTER</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Image Feature Card */}
          <div className="lg:col-span-6 relative">
            <div className="relative h-[420px] sm:h-[480px] w-full rounded-3xl overflow-hidden border border-[#1e2d26] shadow-2xl group">
              <Image
                src="/images/landing/farmer_hero.png"
                alt="Indian Farmer using AgriMark app"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f0d] via-transparent to-transparent opacity-90" />

              {/* Inset Overlay Badges */}
              <div className="absolute top-4 left-4 p-3 bg-[#121a16]/90 border border-emerald-500/40 rounded-2xl backdrop-blur-md flex items-center gap-3 shadow-lg">
                <div className="p-2 bg-emerald-950 rounded-xl text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-gray-400 block uppercase">AI Crop Health</span>
                  <span className="text-xs font-extrabold text-white block">Grade A Yield Potential</span>
                </div>
              </div>

              <div className="absolute bottom-6 left-6 right-6 p-5 bg-[#121a16]/95 border border-[#1e2d26] rounded-2xl backdrop-blur-xl space-y-2 shadow-2xl">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-emerald-400 font-bold">Mandi Price Target</span>
                  <span className="font-mono text-gray-400">Live APMC Signal</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xl font-extrabold text-white font-mono">₹2,450 / Qtl</span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">+12.4% vs Avg</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
