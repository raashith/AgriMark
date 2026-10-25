'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useI18n, SUPPORTED_LANGUAGES } from '@/lib/i18n';
import { api } from '@/lib/api';
import { MarketplaceNotification } from '@/types';
import { CommandPalette } from './CommandPalette';
import { LocationSelectorModal } from './LocationSelectorModal';
import {
  Sprout,
  Search,
  Bell,
  Globe,
  User,
  LogOut,
  Building2,
  ChevronDown,
  MapPin,
  TrendingUp,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, role, defaultAddress, refreshAddress } = useAuth() as any;
  const { language, setLanguage, t } = useI18n();
  const router = useRouter();

  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [notifications, setNotifications] = useState<MarketplaceNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const isFarmerWorkspace = ['farmer', 'fpo', 'admin'].includes(String(role || user?.role || '').toLowerCase());
  const unreadNotifications = notifications.filter((notification) => !notification.is_read).length;

  const loadNotifications = async () => {
    if (!isAuthenticated || !isFarmerWorkspace) {
      setNotifications([]);
      return;
    }
    setNotificationsLoading(true);
    try {
      const rows = await api.getNotifications();
      setNotifications(Array.isArray(rows) ? rows : []);
    } catch (error) {
      console.error('[AgriMark] Unable to load notifications', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      if (!isAuthenticated || !isFarmerWorkspace) {
        if (active) setNotifications([]);
        return;
      }
      try {
        const rows = await api.getNotifications();
        if (active) setNotifications(Array.isArray(rows) ? rows : []);
      } catch (error) {
        if (active) console.error('[AgriMark] Unable to load notifications', error);
      } finally {
        if (active) setNotificationsLoading(false);
      }
    };
    void refresh();
    if (!isAuthenticated || !isFarmerWorkspace) return () => { active = false; };
    const interval = window.setInterval(() => { void refresh(); }, 30000);
    return () => { active = false; window.clearInterval(interval); };
  }, [isAuthenticated, user?.id, isFarmerWorkspace]);

  return (
    <>
      <nav className="bg-[#121a16] border-b border-[#1e2d26] sticky top-0 z-40 px-2.5 sm:px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 min-w-0">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 font-black text-lg sm:text-xl text-emerald-400 shrink-0 tracking-tight">
            <div className="p-1.5 bg-emerald-950 border border-emerald-800/60 rounded-xl">
              <Sprout className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="hidden xs:inline sm:inline">AgriMark</span>
          </Link>

          {/* Mandi prices and forecasting — first-class AgriMark navigation */}
          <Link
            href="/market-prices"
            aria-label="Open mandi prices and forecasting"
            className="hidden md:inline-flex shrink-0 items-center gap-2 rounded-xl border border-emerald-700/60 bg-emerald-950/60 px-3 py-2 text-xs font-bold text-emerald-300 transition hover:border-emerald-400 hover:bg-emerald-900/60 hover:text-emerald-200"
          >
            <TrendingUp className="h-4 w-4" />
            <span className="hidden lg:inline">Market Forecast</span>
            <span className="lg:hidden">Markets</span>
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

          {/* Controls: Location, Language, Notifications, Auth/Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Delivery Location Selector Pill */}
            <button
              onClick={() => {
                setIsLocationOpen(true);
                setIsLangOpen(false);
                setIsNotifOpen(false);
                setIsProfileOpen(false);
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#0a0f0d] border border-[#1e2d26] hover:border-emerald-800 rounded-xl text-xs font-semibold text-gray-200 transition shrink-0 max-w-[220px]"
              title="Change Delivery Location"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div className="flex flex-col text-left leading-tight truncate">
                <span className="text-[9px] text-gray-400 font-mono font-bold uppercase">Deliver to:</span>
                <span className="text-emerald-300 font-bold text-[11px] truncate">
                  {defaultAddress
                    ? `${defaultAddress.area || defaultAddress.city}, ${defaultAddress.city}`
                    : 'Select Location'}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-emerald-400 ml-0.5 shrink-0" />
            </button>

            {/* Command search launcher icon for mobile */}
            <button
              onClick={() => setIsCmdOpen(true)}
              className="md:hidden p-2 text-gray-300 hover:text-emerald-400 hover:bg-[#18241f] rounded-xl transition"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsLangOpen(!isLangOpen);
                  setIsNotifOpen(false);
                  setIsProfileOpen(false);
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#0a0f0d] border border-[#1e2d26] hover:border-emerald-800 rounded-xl text-xs font-mono font-bold text-emerald-300 transition"
                title="Select Platform Language"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>{SUPPORTED_LANGUAGES.find((l) => l.code === language)?.nativeName || 'English'}</span>
                <ChevronDown className="w-3 h-3 text-emerald-400" />
              </button>

              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#121a16] border border-[#1e2d26] rounded-2xl shadow-2xl p-1.5 z-50 max-h-64 overflow-y-auto animate-fade-in">
                  <div className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase text-gray-400 border-b border-[#1e2d26] mb-1">
                    Select Language
                  </div>
                  {SUPPORTED_LANGUAGES.map((langItem) => (
                    <button
                      key={langItem.code}
                      onClick={() => {
                        setLanguage(langItem.code);
                        setIsLangOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium transition flex items-center justify-between ${
                        language === langItem.code
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40 font-bold'
                          : 'text-gray-300 hover:text-white hover:bg-[#18241f]'
                      }`}
                    >
                      <span>{langItem.label}</span>
                      <span className="font-mono text-emerald-300 text-[11px]">{langItem.nativeName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <>
                {/* Notification Center */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsNotifOpen(!isNotifOpen);
                      setIsProfileOpen(false);
                      setIsLangOpen(false);
                      void loadNotifications();
                    }}
                    className="relative p-2 text-gray-300 hover:text-white hover:bg-[#18241f] rounded-xl transition"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadNotifications > 0 && (
                      <>
                        <span className="absolute top-1 right-1 h-2.5 w-2.5 animate-ping rounded-full bg-red-500" />
                        <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500" />
                      </>
                    )}
                  </button>

                  {/* Live, account-scoped notification dropdown */}
                  {isNotifOpen && (
                    <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-[#1e2d26] bg-[#121a16] p-4 shadow-2xl z-50 space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between border-b border-[#1e2d26] pb-2">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-white">
                          <Bell className="h-4 w-4 text-emerald-400" /> Notifications
                        </h4>
                        <span className="rounded-full border border-emerald-800/40 bg-emerald-950 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400">
                          {unreadNotifications} unread
                        </span>
                      </div>
                      <div className="max-h-72 space-y-2 overflow-y-auto">
                        {notificationsLoading && notifications.length === 0 ? (
                          <p className="rounded-xl border border-white/5 bg-black/20 p-3 text-xs text-gray-400">Loading notifications…</p>
                        ) : notifications.length === 0 ? (
                          <div className="rounded-xl border border-white/5 bg-black/20 p-3">
                            <p className="text-xs font-semibold text-gray-200">No new notifications</p>
                            <p className="mt-1 text-xs text-gray-500">New buyer orders will appear here.</p>
                          </div>
                        ) : notifications.map((notification) => (
                          <button
                            key={notification.id}
                            type="button"
                            onClick={async () => {
                              if (!notification.is_read) {
                                setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, is_read: true } : item));
                                try { await api.markNotificationRead(notification.id); }
                                catch (error) { console.error('[AgriMark] Unable to mark notification read', error); }
                              }
                              setIsNotifOpen(false);
                              if (notification.type === 'marketplace_order' || notification.order_id) {
                                router.push(notification.order_id
                                  ? `/farmer/orders?order_id=${encodeURIComponent(notification.order_id)}`
                                  : '/farmer/orders');
                              }
                            }}
                            className={`w-full rounded-xl border p-2.5 text-left transition ${notification.is_read ? 'border-[#1e2d26] bg-[#0a0f0d] hover:border-emerald-900' : 'border-emerald-800/50 bg-emerald-950/30 hover:border-emerald-500'}`}
                          >
                            <div className="flex items-center justify-between gap-2 text-xs font-bold text-emerald-300">
                              <span className="truncate">{notification.title}</span>
                              {!notification.is_read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />}
                            </div>
                            <p className="mt-1 text-xs leading-5 text-gray-300">{notification.message}</p>
                            <span className="mt-1 block text-[10px] text-gray-500">
                              {notification.created_at ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(notification.created_at)) : ''}
                            </span>
                          </button>
                        ))}
                      </div>
                      {isFarmerWorkspace && (
                        <Link
                          href="/farmer/orders"
                          onClick={() => setIsNotifOpen(false)}
                          className="block rounded-xl border border-emerald-800/50 bg-emerald-950/30 px-3 py-2.5 text-center text-xs font-bold text-emerald-300 transition hover:bg-emerald-900/50"
                        >
                          View received orders
                        </Link>
                      )}
                    </div>
                  )}
                </div>

                {/* Profile Menu Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsProfileOpen(!isProfileOpen);
                      setIsNotifOpen(false);
                      setIsLangOpen(false);
                    }}
                    className="flex items-center gap-2 p-1.5 bg-[#0a0f0d] border border-[#1e2d26] hover:border-emerald-800 rounded-xl text-gray-200 transition"
                  >
                    {user?.avatar_url ? (
                      // Render the Google account photo supplied by Firebase; fall back to initials when absent.
                      <img
                        src={user.avatar_url}
                        alt={user.full_name ? `${user.full_name}'s profile photo` : 'Profile photo'}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-lg object-cover border border-emerald-700/60"
                      />
                    ) : (
                      <div className="w-7 h-7 bg-emerald-950 border border-emerald-700/60 rounded-lg flex items-center justify-center text-xs font-bold text-emerald-400">
                        {user?.full_name?.trim()?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className="hidden sm:inline text-xs font-bold truncate max-w-[100px]">{user?.full_name?.trim()?.split(/\s+/)[0] || user?.email?.split('@')[0] || 'Account'}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#121a16] border border-[#1e2d26] rounded-2xl shadow-2xl p-2 z-50 space-y-1 animate-fade-in">
                      <div className="p-3 bg-[#0a0f0d] rounded-xl border border-[#1e2d26]">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {user?.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.full_name ? `${user.full_name}'s profile photo` : 'Profile photo'}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-full object-cover border border-emerald-700/60 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-sm font-bold text-emerald-400 shrink-0">
                              {user?.full_name?.trim()?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{user?.full_name?.trim() || 'AgriMark account'}</p>
                            <p className="text-[11px] text-gray-400 truncate">{user?.email || user?.phone}</p>
                          </div>
                        </div>
                        <span className="mt-1 inline-block text-[10px] font-mono font-bold uppercase text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800/40">
                          {role}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          router.push(role === 'buyer' ? '/buyer/dashboard' : role === 'admin' ? '/admin/dashboard' : '/farmer/dashboard');
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

      {/* Delivery Location Selector Modal */}
      <LocationSelectorModal
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
        currentAddress={defaultAddress}
        onAddressSelect={() => {
          if (refreshAddress) void refreshAddress();
        }}
      />
    </>
  );
};
