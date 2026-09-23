'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sprout, Menu, X, ArrowRight, User, Globe } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useI18n, SUPPORTED_LANGUAGES } from '@/lib/i18n';

export const LandingNav: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { language, setLanguage } = useI18n();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Platform', href: '#platform' },
    { label: 'Farmers', href: '#farmers' },
    { label: 'Marketplace', href: '#marketplace' },
    { label: 'Intelligence', href: '#intelligence' },
    { label: 'Traceability', href: '#traceability' },
    { label: 'AI Advisory', href: '#ai' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#19201D]/90 backdrop-blur-md border-b border-emerald-900/40 py-3 shadow-2xl'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2.5 bg-emerald-700/80 group-hover:bg-[#E5A93C] rounded-2xl transition duration-300 shadow-lg shadow-emerald-900/30">
            <Sprout className="w-6 h-6 text-amber-300 group-hover:text-[#19201D] transition" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-white font-sans">
                Agri<span className="text-[#E5A93C]">Mark</span>
              </span>
              <span className="px-2 py-0.5 bg-emerald-800/80 border border-emerald-600/50 rounded-full text-[10px] font-mono font-bold text-emerald-200">
                v1.4
              </span>
            </div>
            <p className="text-[10px] font-mono font-medium text-emerald-200/70 hidden sm:block">
              BHARAT AGRICULTURAL OS
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-8 bg-[#19201D]/60 border border-emerald-900/40 px-6 py-2 rounded-full backdrop-blur-sm">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs font-semibold text-emerald-100/80 hover:text-[#E5A93C] transition duration-200"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop Action Controls */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-[#19201D]/80 border border-emerald-900/60 px-3 py-1.5 rounded-xl text-xs">
            <Globe className="w-3.5 h-3.5 text-[#E5A93C]" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-transparent text-emerald-100 font-semibold outline-none cursor-pointer"
              aria-label="Select Language"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-[#19201D] text-white">
                  {lang.flag} {lang.nativeName}
                </option>
              ))}
            </select>
          </div>

          {isAuthenticated && user ? (
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-emerald-800/90 hover:bg-emerald-700 border border-emerald-600/60 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center gap-2"
            >
              <User className="w-4 h-4 text-[#E5A93C]" />
              <span>Command Deck</span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-emerald-100 hover:text-white font-semibold text-xs rounded-xl hover:bg-white/5 transition"
              >
                Login
              </Link>
              <Link
                href="/onboarding/role-select"
                className="px-5 py-2.5 bg-[#E5A93C] hover:bg-[#d4982b] text-[#19201D] font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition transform hover:scale-[1.02]"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 md:hidden text-emerald-100 hover:text-white bg-emerald-950/80 border border-emerald-800/60 rounded-xl"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6 text-[#E5A93C]" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#19201D]/95 backdrop-blur-xl border-b border-emerald-900/60 px-6 py-6 space-y-4 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-emerald-100 hover:text-[#E5A93C] py-2 border-b border-emerald-900/30"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-4 flex flex-col gap-3">
            {/* Language Selection Mobile */}
            <div className="flex items-center justify-between bg-emerald-950/80 border border-emerald-800/60 p-3 rounded-xl text-xs text-white">
              <span className="flex items-center gap-2 text-emerald-300 font-semibold">
                <Globe className="w-4 h-4 text-[#E5A93C]" /> Language:
              </span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-[#19201D] text-white font-bold outline-none border border-emerald-700 px-2 py-1 rounded-lg"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>

            {isAuthenticated ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 bg-[#1B4D3E] text-white font-bold text-xs rounded-xl text-center shadow"
              >
                Go to Command Deck
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 bg-white/10 text-white font-bold text-xs rounded-xl text-center border border-white/10"
                >
                  Login
                </Link>
                <Link
                  href="/onboarding/role-select"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 bg-[#E5A93C] text-[#19201D] font-extrabold text-xs rounded-xl text-center shadow-lg"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
