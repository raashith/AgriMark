import React from 'react';
import Link from 'next/link';

export default function PolicyCenterPage() {
  return (
    <div className="min-h-screen bg-[#F7F5EE] text-[#19201D] font-[#Plus_Jakarta_Sans]">
      <header className="bg-[#1B4D3E] text-white py-6 px-8 border-b border-[#3E7B54] flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Policy Center</h1>
          <p className="text-sm text-[#F7F5EE]/80 mt-1">Agricultural Policy Documents, Governance & Compliance Intelligence</p>
        </div>
        <Link href="/policy/schemes" className="bg-[#E5A93C] text-[#19201D] px-4 py-2 rounded-md font-semibold hover:bg-[#E5A93C]/90 transition">
          Scheme Finder &rarr;
        </Link>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white p-6 rounded-lg border border-[#3E7B54]/20 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-[#1B4D3E] mb-2">Policy Documents & Governance Rules</h2>
          <p className="text-xs text-[#19201D]/70 mb-4">
            Search official agricultural policy documents, central/state regulations, and compliance requirements across jurisdictions.
          </p>

          <div className="space-y-4">
            <div className="border border-[#3E7B54]/20 rounded p-4 bg-[#F7F5EE]/50 flex justify-between items-center">
              <div>
                <span className="font-bold text-[#1B4D3E]">National Organic Farming Regulations (2026 Revision)</span>
                <p className="text-xs text-[#19201D]/70 mt-1">Jurisdiction: National | Document ID: POL-2026-ORG-01</p>
              </div>
              <span className="text-xs bg-[#3E7B54] text-white px-2.5 py-1 rounded font-mono font-bold">OFFICIAL_PRIMARY</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
