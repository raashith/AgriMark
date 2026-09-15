'use client';

import React from 'react';
import Link from 'next/link';
import { HelpCircle, Phone, FileText, ArrowRight } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6">
      <div className="bg-[#121a16] border border-[#1e2d26] p-8 rounded-3xl space-y-2 shadow-xl">
        <h1 className="text-3xl font-extrabold text-white">Help & User Guide</h1>
        <p className="text-xs text-gray-300">Step-by-step guides for listing crops, placing buyer orders, scanning produce passports, and configuring weather alerts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/faq" className="p-6 bg-[#121a16] border border-[#1e2d26] hover:border-emerald-800 rounded-3xl space-y-2 transition">
          <HelpCircle className="w-6 h-6 text-emerald-400" />
          <h3 className="font-bold text-base text-white">Frequently Asked Questions</h3>
          <p className="text-xs text-gray-400">Quick answers to common questions about payments, mandi prices, and digital passports.</p>
        </Link>
        <Link href="/contact" className="p-6 bg-[#121a16] border border-[#1e2d26] hover:border-emerald-800 rounded-3xl space-y-2 transition">
          <Phone className="w-6 h-6 text-emerald-400" />
          <h3 className="font-bold text-base text-white">Helpline & Direct Support</h3>
          <p className="text-xs text-gray-400">Speak to an AgriMark agronomy specialist or platform support manager.</p>
        </Link>
      </div>
    </div>
  );
}
