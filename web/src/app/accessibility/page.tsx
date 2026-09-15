'use client';

import React from 'react';
import { Eye, Volume2, Globe } from 'lucide-react';

export default function AccessibilityPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6">
      <div className="bg-[#121a16] border border-[#1e2d26] p-8 rounded-3xl space-y-2">
        <h1 className="text-3xl font-extrabold text-white">Accessibility Standards</h1>
        <p className="text-xs text-gray-300">AgriMark is designed for Indian farmers with high-contrast UI, large touch targets, regional language support, and literacy mode.</p>
      </div>
    </div>
  );
}
