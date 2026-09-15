'use client';

import React from 'react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6">
      <div className="bg-[#121a16] border border-[#1e2d26] p-8 rounded-3xl space-y-2 shadow-xl">
        <h1 className="text-3xl font-extrabold text-white">Terms of Service</h1>
        <p className="text-xs text-gray-300">Effective Date: March 15, 2026</p>
      </div>

      <div className="bg-[#121a16] border border-[#1e2d26] p-8 rounded-3xl space-y-4 text-xs text-gray-300 leading-relaxed">
        <h3 className="text-base font-bold text-white">1. Platform Agreement</h3>
        <p>By registering on AgriMark, farmers, buyers, FPOs, and logistics partners agree to adhere to direct trade standards, accurate produce lot disclosures, and respectful commerce.</p>

        <h3 className="text-base font-bold text-white">2. Trade & Escrow Payments</h3>
        <p>Marketplace transactions utilize verified escrow mechanisms. Payments are released upon verified delivery and buyer assaying confirmation.</p>
      </div>
    </div>
  );
}
