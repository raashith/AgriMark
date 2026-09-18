'use client';

import React from 'react';
import { Brain, Sparkles, MessageSquare, ShieldCheck, Zap, Bot, ArrowRight } from 'lucide-react';

export const AIAgricultureSection: React.FC = () => {
  const aiCapabilities = [
    {
      title: 'Spectral Pest Diagnosis',
      desc: 'Snap a leaf photo to identify crop disease vectors, pest pressure index, and recommended bio-inputs.',
      badge: 'VISION AI',
    },
    {
      title: 'Mandi Trend Forecasting',
      desc: 'AI price models analyze historical arrival patterns, weather impacts, and regional demand to project price windows.',
      badge: 'PRICE MODELS',
    },
    {
      title: 'Multilingual Voice Assistant',
      desc: 'Interact in your native language (Hindi, Tamil, Telugu, Marathi, Punjabi, etc.) via voice or text.',
      badge: 'VOICE AI',
    },
    {
      title: 'Optimal Selling Advisor',
      desc: 'Receive decision support on whether to hold, sell locally, or ship to a high-demand regional mandi.',
      badge: 'DECISION SUPPORT',
    },
  ];

  return (
    <section id="ai-agriculture" className="py-24 bg-[#0d1612] relative overflow-hidden border-t border-[#1e2d26]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="px-3.5 py-1 bg-purple-950/80 border border-purple-800/60 rounded-full text-xs font-mono font-bold text-purple-400 tracking-wider uppercase inline-flex items-center gap-2">
            <Brain className="w-3.5 h-3.5" /> AI DECISION SUPPORT
          </span>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Practical AI intelligence built for <br />
            <span className="bg-gradient-to-r from-purple-400 via-emerald-300 to-teal-300 bg-clip-text text-transparent">
              every stage of the harvest.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
            AgriMark AI acts as your agronomic advisor and market analyst — delivering grounded data insights to reduce risk and maximize crop value.
          </p>
        </div>

        {/* 4 AI Capability Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {aiCapabilities.map((item, idx) => (
            <div
              key={idx}
              className="p-8 bg-[#121a16] border border-[#1e2d26] hover:border-purple-800/60 rounded-3xl space-y-4 shadow-xl transition-all duration-300 hover:scale-[1.02] group"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono uppercase font-bold text-purple-400 bg-purple-950/80 px-2.5 py-1 rounded-lg border border-purple-800/60">
                  {item.badge}
                </span>
                <div className="p-2.5 bg-purple-950/60 border border-purple-800/40 rounded-xl text-purple-400 group-hover:scale-110 transition-transform">
                  <Bot className="w-5 h-5" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                {item.title}
              </h3>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
