import React from 'react';
import Link from 'next/link';

export default function DigitalTwinDashboardPage() {
  return (
    <div className="min-h-screen bg-[#F7F5EE] text-[#19201D] font-[#Plus_Jakarta_Sans]">
      {/* Header */}
      <header className="bg-[#1B4D3E] text-white py-6 px-8 border-b border-[#3E7B54] flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">National Agricultural Digital Twin OS</h1>
          <p className="text-sm text-[#F7F5EE]/80 mt-1">Interconnected Computational Representation of Farms, Crops, Soil, Water & Supply</p>
        </div>
        <div className="flex gap-4">
          <Link href="/digital-twin/simulation" className="bg-[#E5A93C] text-[#19201D] px-4 py-2 rounded-md font-semibold hover:bg-[#E5A93C]/90 transition">
            Simulation Workspace
          </Link>
          <Link href="/digital-twin/scenarios" className="bg-[#3E7B54] text-white px-4 py-2 rounded-md font-semibold hover:bg-[#3E7B54]/90 transition">
            Scenario Manager
          </Link>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Disclaimers & Operational Isolation Alert */}
        <div className="bg-[#1B4D3E]/5 border border-[#3E7B54]/30 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#1B4D3E]">Strict Operational Isolation: LIVE_OPERATIONAL vs SIMULATION</span>
            <span className="text-xs bg-[#E5A93C] text-[#19201D] px-2.5 py-1 rounded font-mono font-bold">DECISION SUPPORT ONLY</span>
          </div>
          <p className="text-xs text-[#19201D]/70 mt-1">
            Simulations provide bounded computational representations for scenario planning and risk evaluation. They do not constitute guaranteed physical predictions and never modify live operational databases.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-[#3E7B54]/20 shadow-sm">
            <div className="text-xs text-[#19201D]/60 uppercase font-mono">National Active Farms</div>
            <div className="text-3xl font-bold text-[#1B4D3E] mt-2">1,240,500</div>
            <div className="text-xs text-[#3E7B54] mt-1">Across 18 Agro-Climatic Zones</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-[#3E7B54]/20 shadow-sm">
            <div className="text-xs text-[#19201D]/60 uppercase font-mono">National Water Balance</div>
            <div className="text-3xl font-bold text-[#1B4D3E] mt-2">14,250 MCM</div>
            <div className="text-xs text-[#E5A93C] mt-1">Deficit Risk: LOW (Seasonal)</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-[#3E7B54]/20 shadow-sm">
            <div className="text-xs text-[#19201D]/60 uppercase font-mono">Storage Coverage</div>
            <div className="text-3xl font-bold text-[#1B4D3E] mt-2">84.5 Days</div>
            <div className="text-xs text-[#3E7B54] mt-1">10,000+ Warehouses Tracked</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-[#3E7B54]/20 shadow-sm">
            <div className="text-xs text-[#19201D]/60 uppercase font-mono">Active Simulations</div>
            <div className="text-3xl font-bold text-[#E5A93C] mt-2">12 Runs</div>
            <div className="text-xs text-[#19201D]/60 mt-1">Async Queue: QUEUED (0)</div>
          </div>
        </div>

        {/* Digital Twin Multi-Scale Map Placeholder */}
        <div className="bg-white p-6 rounded-lg border border-[#3E7B54]/20 shadow-sm mb-8">
          <h2 className="text-lg font-bold text-[#1B4D3E] mb-4">Multi-Scale Digital Twin Hierarchy</h2>
          <div className="h-64 bg-[#19201D]/5 rounded-md flex items-center justify-center border border-dashed border-[#3E7B54]/40">
            <div className="text-center">
              <span className="font-mono text-sm text-[#1B4D3E]">Hierarchy Navigation: Country &gt; State &gt; District &gt; Block &gt; Village &gt; Farm</span>
              <p className="text-xs text-[#19201D]/60 mt-1">Interactive National Digital Twin Spatial Map & Timeline Replay Layer</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
