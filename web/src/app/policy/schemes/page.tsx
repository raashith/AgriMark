import React from 'react';
import Link from 'next/link';

export default function SchemeFinderPage() {
  return (
    <div className="min-h-screen bg-[#F7F5EE] text-[#19201D] font-[#Plus_Jakarta_Sans]">
      <header className="bg-[#1B4D3E] text-white py-6 px-8 border-b border-[#3E7B54] flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Scheme Finder & Eligibility Tracker</h1>
          <p className="text-sm text-[#F7F5EE]/80 mt-1">Rule-Driven Eligibility Evaluation & Farmer Document Readiness</p>
        </div>
        <Link href="/policy" className="text-sm text-[#E5A93C] underline hover:text-white transition">
          &larr; Back to Policy Center
        </Link>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white p-6 rounded-lg border border-[#3E7B54]/20 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-[#1B4D3E] mb-2">Available Government Schemes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="border border-[#3E7B54]/20 rounded p-4 bg-[#F7F5EE]/50">
              <span className="font-bold text-[#1B4D3E]">PM Kisan Samman Nidhi (PM-KISAN)</span>
              <p className="text-xs text-[#19201D]/70 mt-1">Benefit: INR 6,000 / Year Income Support for Landholding Farmers</p>
              <div className="mt-3 flex gap-2">
                <span className="text-xs bg-[#3E7B54] text-white px-2 py-0.5 rounded">ELIGIBLE</span>
                <span className="text-xs bg-[#E5A93C] text-[#19201D] px-2 py-0.5 rounded font-mono font-bold">ACTIVE</span>
              </div>
            </div>
            <div className="border border-[#3E7B54]/20 rounded p-4 bg-[#F7F5EE]/50">
              <span className="font-bold text-[#1B4D3E]">Pradhan Mantri Fasal Bima Yojana (PMFBY)</span>
              <p className="text-xs text-[#19201D]/70 mt-1">Benefit: Comprehensive Crop Insurance & Yield Loss Compensation</p>
              <div className="mt-3 flex gap-2">
                <span className="text-xs bg-[#3E7B54] text-white px-2 py-0.5 rounded">ELIGIBLE</span>
                <span className="text-xs bg-[#E5A93C] text-[#19201D] px-2 py-0.5 rounded font-mono font-bold">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
