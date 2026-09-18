'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sprout, Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface LandingNavProps {
  activeSection?: string;
}

export const LandingNav: React.FC<LandingNavProps> = ({ activeSection = 'home' }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, role } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'Home', href: '#hero', id: 'home' },
    { label: 'How It Works', href: '#why-agrimark', id: 'why-agrimark' },
    { label: 'For Farmers', href: '#for-farmers', id: 'for-farmers' },
    { label: 'Marketplace', href: '#marketplace-flow', id: 'marketplace-flow' },
    { label: 'Market Intelligence', href: '#market-intelligence', id: 'market-intelligence' },
    { label: 'AI Advisory', href: '#ai-agriculture', id: 'ai-agriculture' },
  ];

  const getStartedHref = isAuthenticated
    ? role === 'farmer'
      ? '/farmer/dashboard'
      : '/buyer/marketplace'
    : '/auth/register';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0a0f0d]/90 backdrop-blur-xl border-b border-[#1e2d26] shadow-2xl py-3'
          : 'bg-gradient-to-b from-[#0a0f0d]/80 via-[#0a0f0d]/40 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-2 bg-emerald-950/90 border border-emerald-500/40 rounded-xl text-emerald-400 group-hover:scale-105 transition-transform duration-200 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Sprout className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                Agri<span className="text-emerald-400">Mark</span>
              </span>
              <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-emerald-500/80 -mt-1">
                Agricultural OS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#121a16]/80 border border-[#1e2d26] px-4 py-1.5 rounded-full backdrop-blur-md shadow-inner">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'text-gray-300 hover:text-white hover:bg-[#1e2d26]/50'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                href={getStartedHref}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full text-xs shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-xs font-bold text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold rounded-full text-xs shadow-lg shadow-emerald-950/60 flex items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95 border border-emerald-400/30"
                >
                  <span>GET STARTED</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle Navigation Menu"
            className="md:hidden p-2 rounded-xl bg-[#121a16] border border-[#1e2d26] text-gray-200 hover:text-white hover:border-emerald-700/60 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-emerald-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-x-0 top-[65px] bg-[#0a0f0d]/95 border-b border-[#1e2d26] backdrop-blur-2xl p-6 space-y-4 shadow-2xl animate-in slide-in-from-top-4 duration-200 z-40"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileMenuOpen(false);
          }}
        >
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-2xl bg-[#121a16] border border-[#1e2d26] text-sm font-semibold text-gray-200 hover:text-emerald-300 hover:border-emerald-800 transition-colors flex items-center justify-between"
              >
                <span>{link.label}</span>
                <ArrowRight className="w-4 h-4 text-emerald-500/60" />
              </a>
            ))}
          </div>

          <div className="pt-2 border-t border-[#1e2d26] flex flex-col gap-3">
            {isAuthenticated ? (
              <Link
                href={getStartedHref}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3.5 bg-emerald-600 text-white font-extrabold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3.5 bg-emerald-600 text-white font-extrabold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>GET STARTED WITH AGRIMARK</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 bg-[#121a16] border border-[#1e2d26] text-gray-200 font-bold rounded-2xl text-xs text-center"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
