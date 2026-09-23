'use client';

import React from 'react';
import Link from 'next/link';
import { Sprout, Globe, ShieldCheck, Heart } from 'lucide-react';
import { SUPPORTED_LANGUAGES, useI18n } from '@/lib/i18n';

export const LandingFooter: React.FC = () => {
  const { language, setLanguage } = useI18n();

  return (
    <footer className="bg-[#19201D] text-white border-t border-emerald-950 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="p-2.5 bg-emerald-800 rounded-2xl">
                <Sprout className="w-6 h-6 text-[#E5A93C]" />
              </div>
              <div>
                <span className="text-2xl font-black text-white">
                  Agri<span className="text-[#E5A93C]">Mark</span>
                </span>
                <p className="text-[10px] font-mono text-emerald-300">BHARAT AGRICULTURAL OS</p>
              </div>
            </Link>
            <p className="text-xs text-emerald-100/70 max-w-sm leading-relaxed">
              Bharat’s direct farm-to-mandi trade platform, combining cadastral plot passports, NABL quality grading, GPS cold logistics, and AI market foresight.
            </p>
            <div className="flex items-center gap-2 bg-emerald-950 border border-emerald-800/80 px-3 py-1.5 rounded-xl text-xs w-fit text-emerald-200">
              <Globe className="w-3.5 h-3.5 text-[#E5A93C]" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-transparent font-semibold outline-none cursor-pointer"
                aria-label="Select Language"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-[#19201D] text-white">
                    {lang.flag} {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Column 1: Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-[#E5A93C] uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-xs text-emerald-200/80">
              <li><a href="#platform" className="hover:text-white transition">Farm Intelligence</a></li>
              <li><a href="#marketplace" className="hover:text-white transition">B2B Marketplace</a></li>
              <li><a href="#intelligence" className="hover:text-white transition">Market Ticker</a></li>
              <li><a href="#traceability" className="hover:text-white transition">Traceability</a></li>
              <li><a href="#ai" className="hover:text-white transition">AgriAI Engine</a></li>
            </ul>
          </div>

          {/* Column 2: Ecosystem */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-[#E5A93C] uppercase tracking-wider">Ecosystem</h4>
            <ul className="space-y-2 text-xs text-emerald-200/80">
              <li><Link href="/farm" className="hover:text-white transition">Farmers</Link></li>
              <li><Link href="/buyer/dashboard" className="hover:text-white transition">Wholesale Buyers</Link></li>
              <li><Link href="/fpo" className="hover:text-white transition">FPO Collectives</Link></li>
              <li><Link href="/logistics/deliveries" className="hover:text-white transition">Reefer Logistics</Link></li>
              <li><Link href="/finance" className="hover:text-white transition">Farm Khaata</Link></li>
            </ul>
          </div>

          {/* Column 3: Trust & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-[#E5A93C] uppercase tracking-wider">Trust & Security</h4>
            <ul className="space-y-2 text-xs text-emerald-200/80">
              <li><span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> NABL Assayed</span></li>
              <li><span>Bank Escrow Safe</span></li>
              <li><span>Privacy Policy</span></li>
              <li><span>Terms of Service</span></li>
              <li><span>Support & Contact</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 border-t border-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-emerald-300/60 font-mono">
          <p>© {new Date().getFullYear()} AgriMark Inc. Built for Bharat's Agricultural Future.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" /> for Farmers & Traders across India
          </p>
        </div>
      </div>
    </footer>
  );
};
