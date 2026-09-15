'use client';

import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6">
      <div className="bg-[#121a16] border border-[#1e2d26] p-8 rounded-3xl space-y-2 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded-full text-xs font-mono font-bold text-emerald-400">
          <ShieldCheck className="w-4 h-4" /> Privacy & Data Sovereignty Policy
        </div>
        <h1 className="text-3xl font-extrabold text-white">AgriMark Privacy Policy</h1>
        <p className="text-xs text-gray-300">Last updated: March 15, 2026</p>
      </div>

      <div className="bg-[#121a16] border border-[#1e2d26] p-8 rounded-3xl space-y-4 text-xs text-gray-300 leading-relaxed">
        <h3 className="text-base font-bold text-white">1. Farmer Data Ownership</h3>
        <p>AgriMark guarantees that farmer land records, yield estimates, and financial transactions remain confidential. Private documents are accessible only to verified account holders and authorized verification officers.</p>

        <h3 className="text-base font-bold text-white">2. Information We Collect</h3>
        <p>We collect registration details (full name, phone number, village, district), farm acreage coordinates, crop cultivation records, and produce lot quality metrics necessary for marketplace fulfillment.</p>

        <h3 className="text-base font-bold text-white">3. How We Use Data</h3>
        <p>Your data is used to generate digital produce passports, display verified mandi price signals, facilitate direct buyer orders, and provide AI agricultural decision support.</p>
      </div>
    </div>
  );
}
