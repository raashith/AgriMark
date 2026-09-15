import React from 'react';
import Link from 'next/link';

export default function HumanApprovalCenterPage() {
  return (
    <div className="min-h-screen bg-[#F7F5EE] text-[#19201D] font-[#Plus_Jakarta_Sans]">
      <header className="bg-[#1B4D3E] text-white py-6 px-8 border-b border-[#3E7B54] flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Human Approval Center</h1>
          <p className="text-sm text-[#F7F5EE]/80 mt-1">Supervised Governance Gateways for High-Risk AI &amp; Financial Actions</p>
        </div>
        <Link href="/control-plane" className="text-sm text-[#E5A93C] underline hover:text-white transition">
          &larr; Back to Control Plane
        </Link>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white p-6 rounded-lg border border-[#3E7B54]/20 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-[#1B4D3E] mb-2">Pending Approval Requests</h2>
          <div className="space-y-4 mt-4">
            <div className="border border-[#3E7B54]/20 rounded p-4 bg-[#F7F5EE]/50 flex justify-between items-center">
              <div>
                <span className="font-bold text-[#1B4D3E]">High-Value Escrow Payout Approval (₹1,40,000)</span>
                <p className="text-xs text-[#19201D]/70 mt-1">Request Type: financial_action | Requester: FPO Settlement Service</p>
              </div>
              <div className="flex gap-2">
                <button className="bg-[#3E7B54] text-white px-3 py-1 rounded text-xs font-semibold">Approve</button>
                <button className="bg-red-100 text-red-800 px-3 py-1 rounded text-xs font-semibold">Reject</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
