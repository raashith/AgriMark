import React from 'react';
import Link from 'next/link';

export default function ControlPlanePage() {
  return (
    <div className="min-h-screen bg-[#F7F5EE] text-[#19201D] font-[#Plus_Jakarta_Sans]">
      <header className="bg-[#1B4D3E] text-white py-6 px-8 border-b border-[#3E7B54] flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">National Agricultural Control Plane</h1>
          <p className="text-sm text-[#F7F5EE]/80 mt-1">System-Wide Operational View: Food Supply, Climate, Logistics & System Health</p>
        </div>
        <div className="flex gap-4">
          <Link href="/approval-center" className="bg-[#E5A93C] text-[#19201D] px-4 py-2 rounded-md font-semibold hover:bg-[#E5A93C]/90 transition">
            Approval Center
          </Link>
          <Link href="/incident-center" className="bg-[#3E7B54] text-white px-4 py-2 rounded-md font-semibold hover:bg-[#3E7B54]/90 transition">
            Incident Center
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-[#3E7B54]/20 shadow-sm">
            <span className="text-xs font-mono text-[#19201D]/60 uppercase">Food Supply Security Index</span>
            <div className="text-3xl font-bold text-[#1B4D3E] mt-2">82.5 / 100</div>
            <div className="text-xs text-[#3E7B54] mt-1">OPTIMAL</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-[#3E7B54]/20 shadow-sm">
            <span className="text-xs font-mono text-[#19201D]/60 uppercase">National Resilience</span>
            <div className="text-3xl font-bold text-[#1B4D3E] mt-2">80.0 / 100</div>
            <div className="text-xs text-[#3E7B54] mt-1">5 Factors Vector</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-[#3E7B54]/20 shadow-sm">
            <span className="text-xs font-mono text-[#19201D]/60 uppercase">System API Latency (p95)</span>
            <div className="text-3xl font-bold text-[#1B4D3E] mt-2">142 ms</div>
            <div className="text-xs text-[#3E7B54] mt-1">Uptime 99.98%</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-[#3E7B54]/20 shadow-sm">
            <span className="text-xs font-mono text-[#19201D]/60 uppercase">Active Approvals</span>
            <div className="text-3xl font-bold text-[#E5A93C] mt-2">1 Pending</div>
            <div className="text-xs text-[#19201D]/60 mt-1">High-risk AI Gate</div>
          </div>
        </div>
      </main>
    </div>
  );
}
