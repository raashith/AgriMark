'use client';

import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { Sprout, ShoppingCart, TrendingUp, ShieldCheck, ArrowRight, PackageCheck, Truck, Users } from 'lucide-react';

export default function HomePage() {
  const { t } = useI18n();
  const { isAuthenticated, role, user } = useAuth();

  return (
    <div className="space-y-12 py-6">
      {/* Hero Banner */}
      <div className="relative bg-[#121a16] border border-[#1e2d26] p-8 md:p-12 rounded-3xl overflow-hidden shadow-2xl text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-2xl space-y-4 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded-full text-xs font-mono font-bold text-emerald-400">
            <Sprout className="w-4 h-4" /> Production Agricultural Operating System
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Direct Farm-to-Marketplace Intelligence & Trade OS
          </h1>
          <p className="text-base text-gray-300">
            Empowering farmers with transparent market price signals, harvest lot verification, direct buyer orders, and AI agricultural advisory.
          </p>

          <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
            {isAuthenticated ? (
              <Link
                href={role === 'farmer' ? '/farmer/dashboard' : '/buyer/marketplace'}
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 transition"
              >
                <span>Go to {user?.role.toUpperCase()} Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/register"
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 transition"
                >
                  <span>{t('register')}</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/auth/login"
                  className="px-6 py-3.5 bg-[#0a0f0d] border border-[#1e2d26] hover:bg-[#121a16] text-gray-200 font-bold rounded-xl transition"
                >
                  {t('login')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Role Selection Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-100 text-center">Select Your Platform Role</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { role: 'Farmer', icon: Sprout, href: '/farmer/dashboard', desc: 'Add farms, record crop harvests, sell produce lots, check mandi prices.' },
            { role: 'Buyer', icon: ShoppingCart, href: '/buyer/marketplace', desc: 'Browse verified produce listings, inspect mandi price signals, place orders.' },
            { role: 'FPO / Co-op', icon: Users, href: '/fpo/dashboard', desc: 'Aggregate member harvests, procure seeds & bio-inputs, manage bulk sales.' },
            { role: 'Logistics', icon: Truck, href: '/logistics/deliveries', desc: 'Accept pickup jobs, submit real-time GPS location, track transit status.' },
          ].map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="p-6 bg-[#121a16] border border-[#1e2d26] hover:border-emerald-800 rounded-2xl transition space-y-3 shadow-md group"
            >
              <div className="p-3 bg-emerald-950/60 border border-emerald-800/40 rounded-xl w-fit text-emerald-400 group-hover:scale-110 transition">
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-emerald-300">{item.role}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* 3-Tier Market Intelligence Feature Section */}
      <div className="bg-[#121a16] border border-[#1e2d26] p-8 rounded-3xl space-y-6 shadow-md">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-gray-100 flex items-center justify-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-400" /> Transparent Market Price Intelligence
          </h2>
          <p className="text-xs text-gray-400">
            No guess-work. Every price signal clearly presents Mandi Reference data, Farmer Listing Prices, and AI Forecasts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl space-y-2">
            <span className="text-xs font-mono uppercase font-bold text-amber-400">1. Mandi Market Reference</span>
            <h3 className="font-bold text-white text-base">Observed Mandi Prices</h3>
            <p className="text-xs text-gray-400">Real observation dates, minimum/modal/maximum prices, and verified market sources.</p>
          </div>

          <div className="p-5 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl space-y-2">
            <span className="text-xs font-mono uppercase font-bold text-emerald-400">2. Farmer Listing Price</span>
            <h3 className="font-bold text-white text-base">Authentic Produce Lots</h3>
            <p className="text-xs text-gray-400">Asking price, minimum order quantities, and harvest lot quality grades.</p>
          </div>

          <div className="p-5 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl space-y-2">
            <span className="text-xs font-mono uppercase font-bold text-purple-400">3. AI Decision Support</span>
            <h3 className="font-bold text-white text-base">Forecasts & Signals</h3>
            <p className="text-xs text-gray-400">Explicitly labeled decision support with confidence scores and freshness timestamps.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
