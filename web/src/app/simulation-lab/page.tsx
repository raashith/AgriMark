import React from 'react';
import Link from 'next/link';

export default function SimulationLabPage() {
  return (
    <div className="min-h-screen bg-[#F7F5EE] text-[#19201D] font-[#Plus_Jakarta_Sans]">
      <header className="bg-[#1B4D3E] text-white py-6 px-8 border-b border-[#3E7B54] flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Simulation Lab</h1>
          <p className="text-sm text-[#F7F5EE]/80 mt-1">What-If Analysis, Monte Carlo Uncertainty & Multi-Scale Scenario Workbench</p>
        </div>
        <Link href="/digital-twin" className="text-sm text-[#E5A93C] underline hover:text-white transition">
          &larr; View Digital Twin
        </Link>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white p-6 rounded-lg border border-[#3E7B54]/20 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-[#1B4D3E] mb-2">Simulation Workbench</h2>
          <p className="text-xs text-[#19201D]/70 mb-4">
            Simulate climate shocks, pest outbreaks, logistics disruptions, and input shortages across field, farm, district, and national scales.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-[#3E7B54]/20 rounded p-4 bg-[#F7F5EE]/50">
              <span className="font-bold text-[#1B4D3E]">Drought & Water Stress</span>
              <div className="mt-2 text-xs text-[#19201D]/70">Simulate -40% rainfall deficit on paddy yield.</div>
            </div>
            <div className="border border-[#3E7B54]/20 rounded p-4 bg-[#F7F5EE]/50">
              <span className="font-bold text-[#1B4D3E]">Fertilizer Price Shock</span>
              <div className="mt-2 text-xs text-[#19201D]/70">Simulate +50% NPK price hike on farmer income.</div>
            </div>
            <div className="border border-[#3E7B54]/20 rounded p-4 bg-[#F7F5EE]/50">
              <span className="font-bold text-[#1B4D3E]">Logistics Strike</span>
              <div className="mt-2 text-xs text-[#19201D]/70">Simulate 7-day transport disruption on mandi prices.</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
