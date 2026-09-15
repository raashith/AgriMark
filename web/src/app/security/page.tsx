'use client';

import React from 'react';
import { ShieldCheck, Lock, Key } from 'lucide-react';

export default function SecurityPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6">
      <div className="bg-[#121a16] border border-[#1e2d26] p-8 rounded-3xl space-y-2">
        <h1 className="text-3xl font-extrabold text-white">Security Infrastructure</h1>
        <p className="text-xs text-gray-300">Bank-grade security: Row Level Security (RLS), encrypted API tokens, server-side authorization gates, and private document vaults.</p>
      </div>
    </div>
  );
}
