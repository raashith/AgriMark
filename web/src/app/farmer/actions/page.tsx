import React from 'react';
import Link from 'next/link';

export default function FarmerActionCenterPage() {
  const actions = [
    { title: 'Buy Input', status: 'READY', desc: 'Order certified seeds, biofertilizers, & organic inputs' },
    { title: 'Sell Produce', status: 'READY', desc: 'Create crop listing & match verified buyers' },
    { title: 'Find Buyer', status: 'ACTIVE', desc: 'Explore direct mandi & FPO purchase offers' },
    { title: 'Find FPO', status: 'READY', desc: 'Connect with local Farmers Producer Organization' },
    { title: 'Request Logistics', status: 'READY', desc: 'Book temperature-controlled transport vehicle' },
    { title: 'Apply Scheme Docs', status: 'READY', desc: 'Check eligibility & prepare application documents' },
    { title: 'Check Compliance', status: 'OK', desc: 'Review organic & pesticide residue standards' },
    { title: 'Review AI Advice', status: 'PENDING', desc: 'Evaluate AI agronomic recommendations' },
    { title: 'Schedule Irrigation', status: 'ACTIVE', desc: 'Configure pulse drip irrigation timers' },
    { title: 'Request Service', status: 'READY', desc: 'Book drone spraying or soil testing squad' },
    { title: 'Track Payment', status: 'SETTLED', desc: 'Monitor escrow & bank transfer payouts' },
    { title: 'Track Shipment', status: 'IN_TRANSIT', desc: 'Live GPS vehicle telemetry & delivery status' },
  ];

  return (
    <div className="min-h-screen bg-[#F7F5EE] text-[#19201D] font-[#Plus_Jakarta_Sans]">
      <header className="bg-[#1B4D3E] text-white py-6 px-8 border-b border-[#3E7B54] flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Farmer Action Center</h1>
          <p className="text-sm text-[#F7F5EE]/80 mt-1">Unified Actions for Inputs, Sales, Logistics, Schemes &amp; Payments</p>
        </div>
        <Link href="/farmer/operating-center" className="text-sm text-[#E5A93C] underline hover:text-white transition">
          &larr; Back to Operating Center
        </Link>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {actions.map((act, i) => (
            <div key={i} className="bg-white p-6 rounded-lg border border-[#3E7B54]/20 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-[#1B4D3E] text-base">{act.title}</h3>
                  <span className="text-xs bg-[#3E7B54] text-white px-2 py-0.5 rounded font-mono">{act.status}</span>
                </div>
                <p className="text-xs text-[#19201D]/70">{act.desc}</p>
              </div>
              <button className="mt-4 w-full bg-[#1B4D3E] text-white py-2 rounded text-xs font-semibold hover:bg-[#3E7B54] transition">
                Execute Action
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
