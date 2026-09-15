import React from 'react';
import Link from 'next/link';

export default function ScenarioManagerPage() {
  return (
    <div className="min-h-screen bg-[#F7F5EE] text-[#19201D] font-[#Plus_Jakarta_Sans]">
      <header className="bg-[#1B4D3E] text-white py-6 px-8 border-b border-[#3E7B54] flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Scenario Manager & Intervention Simulator</h1>
          <p className="text-sm text-[#F7F5EE]/80 mt-1">Configure Scenarios & Compare Mitigation Interventions</p>
        </div>
        <Link href="/digital-twin" className="text-sm text-[#E5A93C] underline hover:text-white transition">
          &larr; Back to Digital Twin Overview
        </Link>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white p-6 rounded-lg border border-[#3E7B54]/20 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-[#1B4D3E] mb-4">Configured Scenarios</h2>
          <div className="space-y-4">
            <div className="border border-[#3E7B54]/20 rounded p-4 flex justify-between items-center bg-[#F7F5EE]/50">
              <div>
                <span className="font-bold text-[#1B4D3E]">Severe Summer Drought (SCN-DROUGHT-01)</span>
                <p className="text-xs text-[#19201D]/70 mt-1">Assumptions: Rainfall -45%, Temp +3.2C, Duration: 90 Days</p>
              </div>
              <span className="text-xs bg-[#E5A93C] text-[#19201D] px-2.5 py-1 rounded font-mono font-bold">SEVERE</span>
            </div>
            <div className="border border-[#3E7B54]/20 rounded p-4 flex justify-between items-center bg-[#F7F5EE]/50">
              <div>
                <span className="font-bold text-[#1B4D3E]">BPH Pest Outbreak (SCN-PEST-01)</span>
                <p className="text-xs text-[#19201D]/70 mt-1">Assumptions: Affected Crop: Paddy, Canopy Stress +60%, Duration: 30 Days</p>
              </div>
              <span className="text-xs bg-red-100 text-red-800 px-2.5 py-1 rounded font-mono font-bold">HIGH RISK</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
