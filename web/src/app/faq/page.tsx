'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function FAQPage() {
  const faqs = [
    { q: 'How does a farmer list a produce lot on AgriMark?', a: 'Log in to your Farmer Dashboard, go to Harvest & Produce Lots, record your harvest batch, and click Create Listing. Your lot will immediately appear on the direct marketplace.' },
    { q: 'How are mandi market prices updated?', a: 'Mandi observations are fetched daily from AGMARKNET and verified government spice boards.' },
    { q: 'What is the AgriMark Produce Passport?', a: 'It is a QR provenance certificate containing full farm coordinates, soil specifications, harvest date, and quality assaying results.' },
    { q: 'How are buyer payments secured?', a: 'Payments are held in verified escrow until the buyer receives and confirms produce lot delivery.' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6">
      <div className="bg-[#121a16] border border-[#1e2d26] p-8 rounded-3xl space-y-2 shadow-xl">
        <h1 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h1>
        <p className="text-xs text-gray-300">Everything you need to know about AgriMark platform features.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((f, idx) => (
          <div key={idx} className="p-6 bg-[#121a16] border border-[#1e2d26] rounded-3xl space-y-2">
            <h3 className="font-bold text-base text-emerald-300 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-400 shrink-0" /> {f.q}
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed pl-7">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
