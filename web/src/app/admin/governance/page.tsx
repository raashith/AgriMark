import React from 'react';
import Link from 'next/link';

export default function AdminGovernancePage() {
  return (
    <div className="min-h-screen bg-[#F7F5EE] text-[#19201D] font-[#Plus_Jakarta_Sans]">
      <header className="bg-[#1B4D3E] text-white py-6 px-8 border-b border-[#3E7B54] flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin &amp; Data Governance</h1>
          <p className="text-sm text-[#F7F5EE]/80 mt-1">Row-Level Security, Retention Policies, Consent &amp; Audit Logs</p>
        </div>
        <Link href="/control-plane" className="text-sm text-[#E5A93C] underline hover:text-white transition">
          &larr; Back to Control Plane
        </Link>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white p-6 rounded-lg border border-[#3E7B54]/20 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-[#1B4D3E] mb-2">Platform Data Policies</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs font-mono">
            <div className="p-4 border border-[#3E7B54]/20 rounded bg-[#F7F5EE]/50">
              <span className="font-bold text-[#1B4D3E]">RLS Policies</span>
              <p className="mt-1 text-[#19201D]/70">Enabled across 100% of canonical PostgreSQL tables.</p>
            </div>
            <div className="p-4 border border-[#3E7B54]/20 rounded bg-[#F7F5EE]/50">
              <span className="font-bold text-[#1B4D3E]">Audit Retention</span>
              <p className="mt-1 text-[#19201D]/70">365-day immutable audit log retention enabled.</p>
            </div>
            <div className="p-4 border border-[#3E7B54]/20 rounded bg-[#F7F5EE]/50">
              <span className="font-bold text-[#1B4D3E]">Tenant Privacy</span>
              <p className="mt-1 text-[#19201D]/70">Farmer boundary &amp; GPS coordinates encrypted.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
