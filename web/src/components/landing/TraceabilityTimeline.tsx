'use client';

import React from 'react';
import { ShieldCheck, Check, QrCode, MapPin, Thermometer, FileCheck } from 'lucide-react';

export const TraceabilityTimeline: React.FC = () => {
  const timelineNodes = [
    {
      stage: 'Harvest Lot Entry',
      detail: 'Harvest batch recorded with GPS field boundary coordinates & farmer identity.',
      meta: 'Lot #AGRI-2026-894',
      icon: ShieldCheck,
      time: 'Day 1 • 06:30 AM',
    },
    {
      stage: 'Quality & Moisture Assay',
      detail: 'Assayer records moisture % (12.4%), foreign matter (<0.2%), and grain size grade.',
      meta: 'Grade A Certified',
      icon: FileCheck,
      time: 'Day 1 • 09:15 AM',
    },
    {
      stage: 'Digital Escrow Lock',
      detail: 'Buyer accepts asking price and deposits purchase value into bank-backed escrow.',
      meta: 'Escrow Locked',
      icon: Check,
      time: 'Day 1 • 11:45 AM',
    },
    {
      stage: 'Reefer Dispatch & Cold Chain',
      detail: 'Reefer truck dispatched with real-time GPS tracking and temperature sensor logging.',
      meta: 'Temp: 4.2°C Constant',
      icon: Thermometer,
      time: 'Day 1 • 02:00 PM',
    },
    {
      stage: 'Dock Unloading & QR Verification',
      detail: 'Buyer warehouse scans QR gate pass, confirms lot weight, and releases escrow funds.',
      meta: 'Payment Settled',
      icon: QrCode,
      time: 'Day 2 • 08:30 AM',
    },
  ];

  return (
    <section id="traceability" className="py-24 bg-[#0a0f0d] relative overflow-hidden border-t border-[#1e2d26]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="px-3.5 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded-full text-xs font-mono font-bold text-emerald-400 tracking-wider uppercase inline-flex items-center gap-2">
            <QrCode className="w-3.5 h-3.5" /> CRYPTOGRAPHIC PASSPORT
          </span>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            100% Traceable produce lots from <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              farm gate to buyer warehouse.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
            Eliminate claims, disputes, and unverified quality claims. Every AgriMark lot comes with a digital passport verifying every step of the journey.
          </p>
        </div>

        {/* Timeline Sequence */}
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical Line for Mobile/Desktop */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 via-teal-500 to-emerald-800 -translate-x-1/2" />

          <div className="space-y-8 relative">
            {timelineNodes.map((node, idx) => {
              const isEven = idx % 2 === 0;
              const IconComp = node.icon;
              return (
                <div key={idx} className="relative flex flex-col md:flex-row items-center">
                  {/* Left Side Content (Desktop) */}
                  <div className={`w-full md:w-1/2 ${isEven ? 'md:pr-12 md:text-right' : 'md:pl-12 md:order-2 md:text-left'} pl-14 md:pl-0 space-y-2`}>
                    <div className="p-6 bg-[#121a16] border border-[#1e2d26] rounded-3xl space-y-2 shadow-xl hover:border-emerald-700/60 transition-colors">
                      <div className={`flex items-center gap-2 text-[10px] font-mono font-bold text-emerald-400 ${isEven ? 'md:justify-end' : 'md:justify-start'}`}>
                        <span>{node.time}</span>
                        <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-800 rounded font-mono">{node.meta}</span>
                      </div>
                      <h3 className="font-extrabold text-white text-base">{node.stage}</h3>
                      <p className="text-xs text-gray-400 leading-relaxed">{node.detail}</p>
                    </div>
                  </div>

                  {/* Center Node Icon */}
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 p-2.5 bg-emerald-950 border-2 border-emerald-500 text-emerald-400 rounded-full z-10 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                    <IconComp className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
