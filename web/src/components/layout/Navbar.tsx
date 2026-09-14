'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { Sprout, LogOut, Globe, User, ShoppingBag, Home, Truck, Shield } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, role } = useAuth();
  const { language, setLanguage, t } = useI18n();

  return (
    <nav className="bg-[#121a16] border-b border-[#1e2d26] sticky top-0 z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-emerald-400">
          <Sprout className="w-7 h-7 text-emerald-500" />
          <span>{t('appName')}</span>
        </Link>

        {/* Navigation Links based on role */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
          {isAuthenticated && role === 'farmer' && (
            <>
              <Link href="/farmer/dashboard" className="hover:text-emerald-400 flex items-center gap-1">
                <Home className="w-4 h-4" /> {t('dashboard')}
              </Link>
              <Link href="/farmer/farms" className="hover:text-emerald-400">{t('farms')}</Link>
              <Link href="/farmer/harvest" className="hover:text-emerald-400">{t('harvest')}</Link>
              <Link href="/farmer/sell" className="hover:text-emerald-400">{t('sellProduce')}</Link>
            </>
          )}

          {isAuthenticated && role === 'buyer' && (
            <>
              <Link href="/buyer/marketplace" className="hover:text-emerald-400 flex items-center gap-1">
                <ShoppingBag className="w-4 h-4" /> {t('browseMarket')}
              </Link>
              <Link href="/buyer/orders" className="hover:text-emerald-400">{t('orders')}</Link>
            </>
          )}

          {isAuthenticated && role === 'logistics' && (
            <Link href="/logistics/deliveries" className="hover:text-emerald-400 flex items-center gap-1">
              <Truck className="w-4 h-4" /> Deliveries
            </Link>
          )}

          {isAuthenticated && role === 'admin' && (
            <Link href="/admin/dashboard" className="hover:text-emerald-400 flex items-center gap-1">
              <Shield className="w-4 h-4" /> Admin Console
            </Link>
          )}
        </div>

        {/* Language & User Session Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
            className="flex items-center gap-1 text-xs font-semibold bg-[#1e2d26] text-emerald-300 px-3 py-2 rounded-lg border border-emerald-800/40 hover:bg-emerald-900/40 transition"
            title="Switch Language"
          >
            <Globe className="w-4 h-4" />
            <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-semibold text-gray-200">{user?.full_name}</span>
                <span className="text-xs text-emerald-400 uppercase tracking-wider font-mono">{user?.role}</span>
              </div>
              <button
                onClick={logout}
                className="p-2 bg-red-950/40 text-red-400 border border-red-800/40 hover:bg-red-900/60 rounded-lg transition"
                title={t('logout')}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login" className="text-sm font-semibold text-gray-300 hover:text-emerald-400 px-3 py-2">
                {t('login')}
              </Link>
              <Link href="/auth/register" className="text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg transition shadow-md">
                {t('register')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
