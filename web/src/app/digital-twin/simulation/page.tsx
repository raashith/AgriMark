import React from 'react';
import Link from 'next/link';

export default function SimulationWorkspacePage() {
  return (
    <div className="min-h-screen bg-[#F7F5EE] text-[#19201D] font-[#Plus_Jakarta_Sans]">
      <header className="bg-[#1B4D3E] text-white py-6 px-8 border-b border-[#3E7B54] flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Simulation Workspace</h1>
          <p className="text-sm text-[#F7F5EE]/80 mt-1">What-If Analysis, Monte Carlo Uncertainty & Intervention Comparison</p>
        </div>
        <Link href="/digital-twin" className="text-sm text-[#E5A93C] underline hover:text-white transition">
          &larr; Back to Digital Twin Overview
        </Link>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Workspace Sections Nav */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-[#3E7B54]/20 text-sm font-semibold">
          <span className="px-3 py-1.5 bg-[#1B4D3E] text-white rounded">BASELINE</span>
          <span className="px-3 py-1.5 bg-white border border-[#3E7B54]/30 rounded">SCENARIO</span>
          <span className="px-3 py-1.5 bg-white border border-[#3E7B54]/30 rounded">PARAMETERS</span>
          <span className="px-3 py-1.5 bg-white border border-[#3E7B54]/30 rounded">ASSUMPTIONS</span>
          <span className="px-3 py-1.5 bg-[#E5A93C] text-[#19201D] rounded font-bold">RUN SIMULATION</span>
          <span className="px-3 py-1.5 bg-white border border-[#3E7B54]/30 rounded">RESULTS</span>
          <span className="px-3 py-1.5 bg-white border border-[#3E7B54]/30 rounded">UNCERTAINTY (MONTE CARLO)</span>
          <span className="px-3 py-1.5 bg-white border border-[#3E7B54]/30 rounded">PROVENANCE</span>
        </div>

        {/* Workspace Card */}
        <div className="bg-white p-6 rounded-lg border border-[#3E7B54]/20 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-[#1B4D3E] mb-2">Simulation Run Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-4">
            <div>
              <label className="block text-xs font-mono text-[#19201D]/60 mb-1">Scenario Selection</label>
              <select className="w-full border border-[#3E7B54]/30 rounded p-2 bg-[#F7F5EE]">
                <option>SCN-DROUGHT-01 (Severe Summer Drought)</option>
                <option>SCN-FLOOD-01 (Monsoon Flash Flood)</option>
                <option>SCN-PEST-01 (BPH Pest Outbreak)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono text-[#19201D]/60 mb-1">Simulation Mode</label>
              <select className="w-full border border-[#3E7B54]/30 rounded p-2 bg-[#F7F5EE]">
                <option>WHAT_IF Analysis</option>
                <option>MONTE_CARLO Uncertainty (100 runs)</option>
                <option>INTERVENTION Comparison</option>
                <option>COUNTERFACTUAL Simulation</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono text-[#19201D]/60 mb-1">Random Seed (Monte Carlo)</label>
              <input type="number" defaultValue={42} className="w-full border border-[#3E7B54]/30 rounded p-2 bg-[#F7F5EE]" />
            </div>
          </div>
          <button className="mt-6 bg-[#1B4D3E] text-white px-6 py-2.5 rounded font-semibold hover:bg-[#3E7B54] transition shadow">
            Execute Simulation Job
          </button>
        </div>
      </main>
    </div>
  );
}
