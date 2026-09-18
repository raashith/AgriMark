'use client';

import React from 'react';
import Link from 'next/link';
import { Sprout, ShieldCheck, Heart } from 'lucide-react';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-[#070b09] border-t border-[#1e2d26] pt-16 pb-12 text-gray-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-950 border border-emerald-800/60 rounded-xl text-emerald-400">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                Agri<span className="text-emerald-400">Mark</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
              AgriMark is India&apos;s premier intelligent agricultural operating system — connecting farmers, mandis, buyers, and logistics in one transparent, escrow-settled platform.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Bank-grade Escrow & Cryptographic Lot Passports</span>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <span className="font-mono font-bold uppercase text-[10px] text-gray-200 tracking-wider block">Platform</span>
            <ul className="space-y-2">
              <li><Link href="#why-agrimark" className="hover:text-emerald-400 transition-colors">How It Works</Link></li>
              <li><Link href="#market-intelligence" className="hover:text-emerald-400 transition-colors">Mandi Tickers</Link></li>
              <li><Link href="#marketplace-flow" className="hover:text-emerald-400 transition-colors">Marketplace Workflow</Link></li>
              <li><Link href="#traceability" className="hover:text-emerald-400 transition-colors">QR Lot Passports</Link></li>
              <li><Link href="#ai-agriculture" className="hover:text-emerald-400 transition-colors">AI Diagnostics</Link></li>
            </ul>
          </div>

          {/* User Roles Links */}
          <div className="space-y-3">
            <span className="font-mono font-bold uppercase text-[10px] text-gray-200 tracking-wider block">User Portals</span>
            <ul className="space-y-2">
              <li><Link href="/farmer/dashboard" className="hover:text-emerald-400 transition-colors">For Farmers</Link></li>
              <li><Link href="/buyer/marketplace" className="hover:text-emerald-400 transition-colors">For Buyers</Link></li>
              <li><Link href="/fpo/dashboard" className="hover:text-emerald-400 transition-colors">For FPOs & Co-ops</Link></li>
              <li><Link href="/logistics/deliveries" className="hover:text-emerald-400 transition-colors">For Logistics</Link></li>
              <li><Link href="/auth/login" className="hover:text-emerald-400 transition-colors">Sign In</Link></li>
            </ul>
          </div>

          {/* Legal & Support Links */}
          <div className="space-y-3">
            <span className="font-mono font-bold uppercase text-[10px] text-gray-200 tracking-wider block">Legal & Governance</span>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookies" className="hover:text-emerald-400 transition-colors">Cookie Policy</Link></li>
              <li><Link href="/security" className="hover:text-emerald-400 transition-colors">Security Architecture</Link></li>
              <li><Link href="/contact" className="hover:text-emerald-400 transition-colors">Contact Support</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="border-t border-[#1e2d26] pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-gray-500 font-mono">
          <span>© 2026 AgriMark Technologies Inc. All rights reserved.</span>
          <span className="flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for Indian Farmers & Trade
          </span>
        </div>
      </div>
    </footer>
  );
};
