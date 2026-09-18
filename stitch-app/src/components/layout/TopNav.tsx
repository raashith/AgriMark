'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useI18n, SUPPORTED_LANGUAGES } from '@/lib/i18n';
import { Sprout, Bell, Globe, LogOut, User } from 'lucide-react';

export const TopNav: React.FC = () => {
  const { user, isAuthenticated, logout, role } = useAuth();
  const { language, setLanguage, t } = useI18n();

  return (
    <header className="sticky top-0 z-40 bg-[#1B4D3E] text-white border-b border-[#143B30] shadow-md px-4 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="p-2 bg-emerald-700/80 rounded-xl group-hover:scale-105 transition shadow">
            <Sprout className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
              AgriMark <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">v1.4</span>
            </h1>
            <p className="text-[10px] text-emerald-200 hidden sm:block">Bharat Agricultural OS & Intelligence</p>
          </div>
        </Link>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-emerald-900/60 border border-emerald-700/60 px-2.5 py-1.5 rounded-xl text-xs">
            <Globe className="w-3.5 h-3.5 text-amber-300" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-transparent text-white font-semibold outline-none cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-[#19201D] text-white">
                  {lang.flag} {lang.nativeName}
                </option>
              ))}
            </select>
          </div>

          {/* Notifications */}
          <Link
            href="/notifications"
            className="p-2 bg-emerald-900/60 border border-emerald-700/60 hover:bg-emerald-800 rounded-xl text-emerald-200 transition relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full animate-ping"></span>
          </Link>

          {/* Auth/Profile Badge */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-emerald-700/60">
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-white leading-tight">{user.full_name}</p>
                <p className="text-[10px] text-amber-300 uppercase font-mono font-semibold">{user.role}</p>
              </div>
              <button
                onClick={() => logout()}
                className="p-2 bg-emerald-900/60 hover:bg-red-900/80 border border-emerald-700/60 text-emerald-200 hover:text-white rounded-xl transition"
                title={t('logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>{t('login')}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
