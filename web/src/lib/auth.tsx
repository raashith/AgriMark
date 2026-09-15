'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@/types';
import { supabase, logSupabaseDiagnostic } from './supabase';
import { api } from './api';
import { PRODUCTION_AUTH_CALLBACK, getAuthCallbackUrl } from './auth-config';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (credentials: any) => Promise<UserProfile>;
  sendPhoneOtp: (phone: string) => Promise<void>;
  loginWithPhoneOtp: (phone: string) => Promise<void>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<UserProfile>;
  loginWithGoogle: () => Promise<void>;
  register: (data: any) => Promise<UserProfile>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  role: UserRole | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => { throw new Error('Not initialized'); },
  sendPhoneOtp: async () => { throw new Error('Not initialized'); },
  loginWithPhoneOtp: async () => { throw new Error('Not initialized'); },
  verifyPhoneOtp: async () => { throw new Error('Not initialized'); },
  loginWithGoogle: async () => {},
  register: async () => { throw new Error('Not initialized'); },
  logout: async () => {},
  isAuthenticated: false,
  role: null,
});

let isOAuthInProgress = false;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearLocalAuth = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('agrimark_token');
    localStorage.removeItem('agrimark_user');
  };

  const syncProfile = async (accessToken?: string): Promise<UserProfile | null> => {
    if (accessToken && typeof window !== 'undefined') localStorage.setItem('agrimark_token', accessToken);
    try {
      const profile = await api.getMe();
      setUser(profile);
      if (typeof window !== 'undefined') localStorage.setItem('agrimark_user', JSON.stringify(profile));
      return profile;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          clearLocalAuth();
          await supabase.auth.signOut().catch(() => {});
        } else if (data.session?.access_token) {
          const profile = await syncProfile(data.session.access_token);
          if (!profile) {
            clearLocalAuth();
            await supabase.auth.signOut().catch(() => {});
            setUser(null);
          }
        }
      } catch {
        clearLocalAuth();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void init();
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.access_token) {
        await syncProfile(session.access_token);
      } else if (event === 'SIGNED_OUT') {
        clearLocalAuth();
        setUser(null);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const login = async (credentials: any): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const identifier = String(credentials.email || credentials.phone_or_email || credentials.phone || '').trim();
      const password = String(credentials.password || '');
      if (!identifier || !password) throw new Error('Enter your email and password.');
      if (!identifier.includes('@')) throw new Error('Password login uses email address. Use Mobile OTP for phone login.');

      const { data, error } = await supabase.auth.signInWithPassword({ email: identifier.toLowerCase(), password });
      if (error || !data.session?.access_token) {
        if (error) logSupabaseDiagnostic('signInWithPassword', 'https://xrcqzpnstdbbtafhcwbb.supabase.co/auth/v1/token', 400, error.message);
        throw new Error(formatAuthError(error?.message || 'Invalid email or password.'));
      }

      const profile = await syncProfile(data.session.access_token);
      if (!profile) throw new Error('Login succeeded, but your AgriMark profile could not be loaded.');
      return profile;
    } finally {
      setIsLoading(false);
    }
  };

  const sendPhoneOtp = async (phone: string) => {
    const normalized = normalizePhone(phone);
    const { error } = await supabase.auth.signInWithOtp({ phone: normalized });
    if (error) {
      logSupabaseDiagnostic('signInWithOtp', 'https://xrcqzpnstdbbtafhcwbb.supabase.co/auth/v1/otp', 400, error.message);
      throw new Error(formatAuthError(error.message));
    }
  };

  const verifyPhoneOtp = async (phone: string, token: string): Promise<UserProfile> => {
    const normalized = normalizePhone(phone);
    const code = token.replace(/\D/g, '');
    if (!/^\d{6}$/.test(code)) throw new Error('Enter the 6-digit OTP.');
    const { data, error } = await supabase.auth.verifyOtp({ phone: normalized, token: code, type: 'sms' });
    if (error || !data.session?.access_token) {
      if (error) logSupabaseDiagnostic('verifyOtp', 'https://xrcqzpnstdbbtafhcwbb.supabase.co/auth/v1/verify', 400, error.message);
      throw new Error(formatAuthError(error?.message || 'OTP verification failed.'));
    }
    const profile = await syncProfile(data.session.access_token);
    if (!profile) throw new Error('Phone verification succeeded, but your AgriMark profile could not be loaded.');
    return profile;
  };

  const loginWithPhoneOtp = sendPhoneOtp;

  const loginWithGoogle = async () => {
    if (isOAuthInProgress) {
      console.warn('[AgriMark Auth] OAuth sign-in attempt ignored: sign-in already in progress.');
      return;
    }
    isOAuthInProgress = true;
    try {
      const redirectTo = getAuthCallbackUrl();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          scopes: 'openid email profile',
          queryParams: { prompt: 'select_account' },
        },
      });
      if (error || !data?.url) {
        if (error) logSupabaseDiagnostic('signInWithOAuth', 'https://xrcqzpnstdbbtafhcwbb.supabase.co/auth/v1/authorize', 400, error.message);
        throw new Error(formatAuthError(error?.message || 'Google Sign-In could not start.'));
      }
      const oauthUrl = new URL(data.url);
      if (oauthUrl.hostname !== 'accounts.google.com') {
        throw new Error('Invalid OAuth redirect host returned.');
      }
      if (typeof window !== 'undefined') {
        window.location.assign(data.url);
      }
    } catch (err) {
      isOAuthInProgress = false;
      throw err;
    }
  };

  const register = async (data: any): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      if (data.role === 'admin') throw new Error('Self-registration as admin is prohibited.');
      const email = String(data.email || '').trim().toLowerCase();
      const password = String(data.password || '');
      if (!email || !email.includes('@')) throw new Error('Enter a valid email address.');
      if (password.length < 6) throw new Error('Password must contain at least 6 characters.');

      const { data: signup, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: PRODUCTION_AUTH_CALLBACK,
          data: {
            full_name: data.full_name,
            phone: data.phone || data.phone_number,
            location: data.location,
            requested_role: data.role || 'farmer',
          },
        },
      });

      if (error) {
        logSupabaseDiagnostic('signUp', 'https://xrcqzpnstdbbtafhcwbb.supabase.co/auth/v1/signup', 400, error.message);
        const normalized = error.message.toLowerCase();
        if (normalized.includes('already registered')) throw new Error('An account with this email already exists. Please log in instead.');
        throw new Error(formatAuthError(error.message));
      }

      if (signup.session?.access_token) {
        const profile = await syncProfile(signup.session.access_token);
        if (!profile) throw new Error('Account created, but your AgriMark profile is still being prepared. Please log in.');
        return profile;
      }

      throw new Error('Account created. Check your email and confirm your address before logging in.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut().catch(() => {});
    await api.logout().catch(() => {});
    clearLocalAuth();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, isLoading, login, sendPhoneOtp, loginWithPhoneOtp, verifyPhoneOtp, loginWithGoogle, register, logout, isAuthenticated: !!user, role: user?.role || null }}>{children}</AuthContext.Provider>;
};

export function normalizePhone(phone: string): string {
  if (!phone) throw new Error('Enter a valid mobile number.');
  const raw = phone.trim();
  if (raw.startsWith('+')) {
    const digits = raw.replace(/\D/g, '');
    if (digits.length < 8 || digits.length > 15) throw new Error('Enter a valid mobile number.');
    return `+${digits}`;
  }
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `+91${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  throw new Error('Enter a valid mobile number.');
}

export function formatAuthError(message: string): string {
  const normalized = (message || '').toLowerCase();
  if (normalized.includes('invalid api key') || normalized.includes('api key')) return 'AgriMark authentication is temporarily unavailable. Please try again.';
  if (normalized.includes('email not confirmed')) return 'Please confirm your email address before logging in.';
  if (normalized.includes('invalid login credentials')) return 'Incorrect email or password.';
  if (normalized.includes('already registered')) return 'An account with this email already exists. Please log in instead.';
  if (normalized.includes('redirect') || normalized.includes('pkce') || normalized.includes('invalid_grant')) return 'Authentication configuration needs attention. Please try again.';
  if (normalized.includes('provider is not enabled') || normalized.includes('unsupported provider')) return 'This sign-in method is not enabled yet.';
  if (normalized.includes('rate limit') || normalized.includes('too many')) return 'Too many authentication attempts. Please wait and try again.';
  if (normalized.includes('sms') || normalized.includes('phone')) return 'Mobile authentication is temporarily unavailable. Please use Email & Password or Google.';
  return message || 'Unable to authenticate. Please try again.';
}

export const useAuth = () => useContext(AuthContext);
