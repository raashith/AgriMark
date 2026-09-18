'use client';

import React, { useState } from 'react';
import {
  Sprout,
  PackageCheck,
  ShieldCheck,
  Store,
  Truck,
  CheckCircle,
  ArrowRight,
  MapPin,
  Clock,
  ShieldAlert,
} from 'lucide-react';

export const TraceabilityTimeline: React.FC = () => {
  const [activeStep, setActiveStep] = useState(2);

  const steps = [
    {
      id: 0,
      title: '1. Farm Plot',
      subtitle: 'Cadastral 7/12',
      icon: Sprout,
      detail: 'Plot #402, Shree Ganesh Krishi Farm, Niphad Nashik. Soil pH 7.2 verified.',
      timestamp: '02 Sep • 07:30 AM',
      location: 'Niphad, Nashik',
    },
    {
      id: 1,
      title: '2. Harvest',
      subtitle: 'Batch #LOT-N-884',
      icon: PackageCheck,
      detail: '18,500 kg hand-sorted Bhima Super Red Onion. Crate batch #884 created.',
      timestamp: '14 Sep • 11:15 AM',
      location: 'Field Collection Yard',
    },
    {
      id: 2,
      title: '3. Quality Assay',
      subtitle: 'NABL Certified',
      icon: ShieldCheck,
      detail: 'NABL Lab Assay #NABL-MH-991: Moisture 12.2%, Zero rot, Grade A certified.',
      timestamp: '15 Sep • 02:45 PM',
      location: 'Nashik NABL Testing Hub',
    },
    {
      id: 3,
      title: '4. Marketplace',
      subtitle: 'Escrow Locked',
      icon: Store,
      detail: 'Buyer bid accepted @ ₹2,600/Qtl. Purchase Order #ORD-99812 created, funds locked in Escrow.',
      timestamp: '16 Sep • 09:10 AM',
      location: 'AgriMark Trade Engine',
    },
    {
      id: 4,
      title: '5. Logistics',
      subtitle: 'GPS Reefer',
      icon: Truck,
      detail: 'Cold-chain Reefer #MH-15-EG-4421 in transit. Temperature stable @ +4.2°C.',
      timestamp: '17 Sep • 04:20 PM',
      location: 'Bhiwandi Cold Terminal',
    },
    {
      id: 5,
      title: '6. Buyer Delivery',
      subtitle: 'Instant Disbursal',
      icon: CheckCircle,
      detail: 'Goods received and gate-weighed. Escrow funds automatically released to farmer bank account.',
      timestamp: '18 Sep • 10:00 AM',
      location: 'Reliance Fresh Hub, Mumbai',
    },
  ];

  return (
    <section id="traceability" className="py-24 bg-[#F7F5EE] text-[#19201D] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#1B4D3E]/10 border border-[#1B4D3E]/20 rounded-full text-xs font-mono font-bold text-[#1B4D3E] uppercase">
            <ShieldCheck className="w-4 h-4 text-[#E5A93C]" /> END-TO-END CUSTODY
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#19201D]">
            Every lot. Every movement. Every handoff.
          </h2>
          <p className="text-base text-gray-600 leading-relaxed font-normal">
            Immutably transparent harvest provenance. Click any stage along the supply chain to inspect live quality assays, GPS telemetry, and bank escrow status.
          </p>
        </div>

        {/* Horizontal Interactive Timeline */}
        <div className="mt-16 bg-white border border-[#E7E5DC] rounded-3xl p-6 md:p-8 shadow-xl space-y-8">
          {/* Timeline Nodes Bar */}
          <div className="relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-[#E7E5DC] -translate-y-1/2 z-0" />
            <div
              className="hidden md:block absolute top-1/2 left-0 h-1 bg-[#1B4D3E] -translate-y-1/2 transition-all duration-500 z-0"
              style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
            />

            {/* Nodes Grid */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 relative z-10">
              {steps.map((step) => {
                const StepIcon = step.icon;
                const isCurrent = activeStep === step.id;
                const isPassed = step.id <= activeStep;
                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    className={`flex flex-col items-center text-center p-3 rounded-2xl transition duration-300 ${
                      isCurrent
                        ? 'bg-[#1B4D3E] text-white shadow-xl scale-105'
                        : isPassed
                        ? 'bg-[#F6F4ED] text-[#1B4D3E] border border-[#1B4D3E]/30'
                        : 'bg-white text-gray-400 border border-[#E7E5DC]'
                    }`}
                  >
                    <div
                      className={`p-3 rounded-xl mb-2 ${
                        isCurrent
                          ? 'bg-[#E5A93C] text-[#19201D]'
                          : isPassed
                          ? 'bg-[#1B4D3E]/10 text-[#1B4D3E]'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <StepIcon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold leading-tight">{step.title}</span>
                    <span className={`text-[10px] font-mono mt-1 ${isCurrent ? 'text-amber-200' : 'text-gray-500'}`}>
                      {step.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Step Details Panel */}
          <div className="bg-[#19201D] text-white p-6 md:p-8 rounded-2xl border border-emerald-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-[#E5A93C] text-[#19201D] font-mono font-bold text-xs rounded-full">
                  STAGE {activeStep + 1} VERIFIED
                </span>
                <span className="text-xs font-mono text-emerald-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {steps[activeStep].timestamp}
                </span>
              </div>
              <h4 className="text-xl font-bold text-white pt-1">{steps[activeStep].detail}</h4>
              <p className="text-xs text-emerald-200/80 flex items-center gap-1.5 pt-1">
                <MapPin className="w-4 h-4 text-[#E5A93C]" /> Verified Location: {steps[activeStep].location}
              </p>
            </div>

            <div className="bg-emerald-950/90 p-4 rounded-xl border border-emerald-800 space-y-1 shrink-0 w-full md:w-auto text-xs">
              <span className="text-[10px] font-mono text-[#E5A93C] uppercase">AUTHENTICITY CERTIFICATE</span>
              <p className="font-mono font-bold text-white">PROVENANCE PASSCODE</p>
              <p className="font-mono text-emerald-300">#AGRI-MH-LOT-884-V1</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
