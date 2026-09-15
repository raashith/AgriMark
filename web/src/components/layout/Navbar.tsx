'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { CommandPalette } from './CommandPalette';
import {
  Sprout,
  Search,
  Bell,
  Globe,
  User,
  LogOut,
  ShieldCheck,
  Building2,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, role } = useAuth();
  const { language, setLanguage, t } = useI18n();
  const router = useRouter();

  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notifications = [
    { id: 1, title: 'Market Price Alert', desc: 'Turmeric modal price rose +₹400/quintal in Erode Mandi.', time: '10m ago', type: 'price' },
    { id: 2, title: 'New Buyer Offer Received', desc: 'FreshGro submitted ₹145/kg offer for 2.5 Tons turmeric.', time: '1h ago', type: 'order' },
    { id: 3, title: 'Weather Advisory', desc: 'Light rainfall expected tomorrow in Thanjavur district.', time: '3h ago', type: 'weather' },
  ];

  return (
    <>
      <nav className="bg-[#121a16] border-b border-[#1e2d26] sticky top-0 z-40 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 font-black text-xl text-emerald-400 shrink-0 tracking-tight">
            <div className="p-1.5 bg-emerald-950 border border-emerald-800/60 rounded-xl">
              <Sprout className="w-6 h-6 text-emerald-400" />
            </div>
            <span>AgriMark</span>
          </Link>

          {/* Quick Search / Command Launcher */}
          <button
            onClick={() => setIsCmdOpen(true)}
            className="hidden md:flex items-center justify-between w-72 px-3.5 py-1.5 bg-[#0a0f0d] border border-[#1e2d26] hover:border-emerald-800 rounded-xl text-gray-400 text-xs font-medium transition group"
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-500 group-hover:text-emerald-400" />
              <span>Search crops, mandis, listings...</span>
            </span>
            <kbd className="px-2 py-0.5 bg-[#18241f] border border-[#2a3c33] text-[10px] text-gray-300 font-mono rounded-md">
              ⌘K
            </kbd>
          </button>

          {/* Controls: Language, Notifications, Auth/Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Command search launcher icon for mobile */}
            <button
              onClick={() => setIsCmdOpen(true)}
              className="md:hidden p-2 text-gray-300 hover:text-emerald-400 hover:bg-[#18241f] rounded-xl transition"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0a0f0d] border border-[#1e2d26] hover:border-emerald-800 rounded-xl text-xs font-mono font-bold text-emerald-300 transition"
              title="Switch Language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>

            {isAuthenticated ? (
              <>
                {/* Notification Center */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsNotifOpen(!isNotifOpen);
                      setIsProfileOpen(false);
                    }}
                    className="relative p-2 text-gray-300 hover:text-white hover:bg-[#18241f] rounded-xl transition"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                  </button>

                  {/* Notification Dropdown */}
                  {isNotifOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-[#121a16] border border-[#1e2d26] rounded-2xl shadow-2xl p-4 z-50 space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between border-b border-[#1e2d26] pb-2">
                        <h4 className="font-bold text-sm text-white flex items-center gap-2">
                          <Bell className="w-4 h-4 text-emerald-400" /> Notifications
                        </h4>
                        <span className="text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800/40">
                          3 New
                        </span>
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {notifications.map((n) => (
                          <div key={n.id} className="p-2.5 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl space-y-1">
                            <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                              <span>{n.title}</span>
                              <span className="text-[10px] text-gray-500 font-mono">{n.time}</span>
                            </div>
                            <p className="text-xs text-gray-300">{n.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Menu Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsProfileOpen(!isProfileOpen);
                      setIsNotifOpen(false);
                    }}
                    className="flex items-center gap-2 p-1.5 bg-[#0a0f0d] border border-[#1e2d26] hover:border-emerald-800 rounded-xl text-gray-200 transition"
                  >
                    <div className="w-7 h-7 bg-emerald-950 border border-emerald-700/60 rounded-lg flex items-center justify-center text-xs font-bold text-emerald-400">
                      {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
                    </div>
                    <span className="hidden sm:inline text-xs font-bold truncate max-w-[100px]">{user?.full_name?.split(' ')[0]}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#121a16] border border-[#1e2d26] rounded-2xl shadow-2xl p-2 z-50 space-y-1 animate-fade-in">
                      <div className="p-3 bg-[#0a0f0d] rounded-xl border border-[#1e2d26]">
                        <p className="text-xs font-bold text-white truncate">{user?.full_name}</p>
                        <p className="text-[11px] text-gray-400 truncate">{user?.email || user?.phone}</p>
                        <span className="mt-1 inline-block text-[10px] font-mono font-bold uppercase text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800/40">
                          {role}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          router.push(role === 'buyer' ? '/buyer/marketplace' : role === 'admin' ? '/admin/dashboard' : '/farmer/dashboard');
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-300 hover:text-white hover:bg-[#18241f] rounded-xl transition flex items-center gap-2"
                      >
                        <User className="w-4 h-4 text-emerald-400" /> Dashboard
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          router.push('/farmer/settings');
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-300 hover:text-white hover:bg-[#18241f] rounded-xl transition flex items-center gap-2"
                      >
                        <Building2 className="w-4 h-4 text-emerald-400" /> Account & Farm Settings
                      </button>

                      <div className="border-t border-[#1e2d26] my-1" />

                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 rounded-xl transition flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-3.5 py-1.5 text-xs font-bold text-gray-300 hover:text-white hover:bg-[#18241f] rounded-xl transition"
                >
                  {t('login')}
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md transition"
                >
                  {t('register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Global Command Palette Modal */}
      <CommandPalette isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} />
    </>
  );
};
