'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@/types';
import { api } from './api';
import { supabase, logSupabaseDiagnostic } from './supabase';

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const syncProfile = async (accessToken?: string): Promise<UserProfile | null> => {
    if (accessToken && typeof window !== 'undefined') {
      localStorage.setItem('agrimark_token', accessToken);
    }
    try {
      const profile = await api.getMe();
      setUser(profile);
      if (typeof window !== 'undefined') {
        localStorage.setItem('agrimark_user', JSON.stringify(profile));
      }
      return profile;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr) {
          logSupabaseDiagnostic('getSession', 'https://xrcqzpnstdbbtafhcwbb.supabase.co/auth/v1/session', 401, sessionErr.message);
          const msg = (sessionErr.message || '').toLowerCase();
          if (msg.includes('invalid api key') || msg.includes('invalid') || msg.includes('jwt')) {
            console.warn('Supabase session reset because the stored session was invalid.');
            await supabase.auth.signOut().catch(() => {});
            if (typeof window !== 'undefined') {
              localStorage.removeItem('agrimark_token');
              localStorage.removeItem('agrimark_user');
            }
            setUser(null);
            return;
          }
        }
        if (data?.session?.access_token) {
          const profile = await syncProfile(data.session.access_token);
          if (!profile) {
            console.warn('Supabase session reset because the stored session was invalid.');
            await supabase.auth.signOut().catch(() => {});
            if (typeof window !== 'undefined') {
              localStorage.removeItem('agrimark_token');
              localStorage.removeItem('agrimark_user');
            }
            setUser(null);
          }
        }
      } catch {
        console.warn('Supabase session reset because the stored session was invalid.');
        await supabase.auth.signOut().catch(() => {});
        if (typeof window !== 'undefined') {
          localStorage.removeItem('agrimark_token');
          localStorage.removeItem('agrimark_user');
        }
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.access_token) {
        await syncProfile(session.access_token);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('agrimark_token');
          localStorage.removeItem('agrimark_user');
        }
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (credentials: any): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const emailOrPhone = credentials.email || credentials.phone_or_email || credentials.phone;
      if (!emailOrPhone || !credentials.password) {
        throw new Error('Please enter a valid email or phone number and password.');
      }

      let sessionToken: string | null = null;
      if (emailOrPhone.includes('@')) {
        const { data: sbData, error: sbError } = await supabase.auth.signInWithPassword({
          email: emailOrPhone,
          password: credentials.password,
        });
        if (!sbError && sbData?.session?.access_token) {
          sessionToken = sbData.session.access_token;
        } else if (sbError) {
          logSupabaseDiagnostic('signInWithPassword', 'https://xrcqzpnstdbbtafhcwbb.supabase.co/auth/v1/token', 400, sbError.message);
        }
      }

      if (!sessionToken) {
        const res = await api.login(credentials);
        if (!res?.access_token) {
          throw new Error('Invalid email/phone or password. Please try again.');
        }
        sessionToken = res.access_token;
      }

      const profile = await syncProfile(sessionToken);
      if (!profile) {
        throw new Error('Sign-in succeeded, but profile verification failed. Please try again.');
      }
      return profile;
    } finally {
      setIsLoading(false);
    }
  };

  const sendPhoneOtp = async (phone: string): Promise<void> => {
    const normalized = normalizePhone(phone);
    const { error } = await supabase.auth.signInWithOtp({ phone: normalized });
    if (error) {
      logSupabaseDiagnostic('signInWithOtp', 'https://xrcqzpnstdbbtafhcwbb.supabase.co/auth/v1/otp', 400, error.message);
      throw new Error(formatAuthError(error.message));
    }
  };

  const loginWithPhoneOtp = sendPhoneOtp;

  const verifyPhoneOtp = async (phone: string, token: string): Promise<UserProfile> => {
    const normalized = normalizePhone(phone);
    const code = token.replace(/\D/g, '');
    if (!/^\d{6}$/.test(code)) {
      throw new Error('Incorrect OTP. Please check the 6-digit code and try again.');
    }

    const { data, error } = await supabase.auth.verifyOtp({
      phone: normalized,
      token: code,
      type: 'sms',
    });
    if (error) {
      logSupabaseDiagnostic('verifyOtp', 'https://xrcqzpnstdbbtafhcwbb.supabase.co/auth/v1/verify', 400, error.message);
      throw new Error(formatAuthError(error.message));
    }
    if (!data.session?.access_token) {
      throw new Error('Verification succeeded, but no session was returned. Please try again.');
    }

    const profile = await syncProfile(data.session.access_token);
    if (!profile) {
      const sbUser = data.session.user;
      return {
        id: sbUser.id,
        email: sbUser.email,
        full_name: sbUser.user_metadata?.full_name || 'AgriMark User',
        phone: sbUser.phone || normalized,
        role: 'farmer' as UserRole,
        needs_onboarding: true,
      } as UserProfile & { needs_onboarding?: boolean };
    }
    return profile;
  };

  const loginWithGoogle = async (): Promise<void> => {
    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback`
      : 'https://agrimark-six.vercel.app/auth/callback';
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUrl },
    });
    if (error) {
      logSupabaseDiagnostic('signInWithOAuth', 'https://xrcqzpnstdbbtafhcwbb.supabase.co/auth/v1/authorize', 400, error.message);
      throw new Error(error.message || 'Unable to initiate Google Sign-In.');
    }
  };

  const register = async (data: any): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      if (data.role === 'admin') {
        throw new Error('Self-registration as admin is prohibited.');
      }

      const email = data.email?.trim();
      const password = data.password;
      if (!email || !password) {
        throw new Error('Email and password are required to create an account.');
      }

      const { data: sbData, error: sbError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: data.full_name,
            phone: data.phone || data.phone_number,
            location: data.location,
            requested_role: data.role,
          },
        },
      });

      if (sbError) {
        logSupabaseDiagnostic('signUp', 'https://xrcqzpnstdbbtafhcwbb.supabase.co/auth/v1/signup', 400, sbError.message);
        const normalized = sbError.message.toLowerCase();
        if (normalized.includes('already registered') || normalized.includes('user already registered')) {
          throw new Error('An account with this email already exists. Please log in instead.');
        }
        throw new Error(sbError.message || 'Unable to create your account.');
      }

      if (sbData.session?.access_token) {
        const profile = await syncProfile(sbData.session.access_token);
        if (profile) return profile;
        throw new Error('Your account was created, but profile setup is still completing. Please log in.');
      }

      throw new Error('Account created. Please check your email and confirm your address before logging in.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
    } catch {}
    try {
      await api.logout();
    } catch {}
    if (typeof window !== 'undefined') {
      localStorage.removeItem('agrimark_token');
      localStorage.removeItem('agrimark_user');
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      sendPhoneOtp,
      loginWithPhoneOtp,
      verifyPhoneOtp,
      loginWithGoogle,
      register,
      logout,
      isAuthenticated: !!user,
      role: user?.role || null,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export function normalizePhone(phone: string): string {
  if (!phone) throw new Error('Enter a valid mobile number.');
  const raw = phone.trim();
  if (raw.startsWith('+')) {
    const digits = raw.replace(/\D/g, '');
    if (digits.length < 8 || digits.length > 15) {
      throw new Error('Enter a valid mobile number.');
    }
    return `+${digits}`;
  }
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return `+91${digits.slice(1)}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  if (digits.length >= 8 && digits.length <= 15) {
    return `+${digits}`;
  }
  throw new Error('Enter a valid mobile number.');
}

export function formatAuthError(message: string): string {
  const normalized = (message || '').toLowerCase();
  if (
    normalized.includes('invalid api key') ||
    normalized.includes('api key is invalid') ||
    normalized.includes('invalid_api_key')
  ) {
    return 'AgriMark authentication is temporarily unavailable. Please try again.';
  }
  if (
    normalized.includes('rate limit') ||
    normalized.includes('too many') ||
    normalized.includes('over_email_send_rate_limit') ||
    normalized.includes('over_sms_send_rate_limit')
  ) {
    return 'Too many OTP requests. Please wait a minute and try again.';
  }
  if (
    normalized.includes('provider') ||
    normalized.includes('sms') ||
    normalized.includes('unavailable') ||
    normalized.includes('service_unavailable')
  ) {
    return "We couldn't send the OTP right now. Please try again shortly.";
  }
  if (
    normalized.includes('invalid otp') ||
    normalized.includes('invalid token') ||
    normalized.includes('token is invalid') ||
    normalized.includes('otp_expired') ||
    normalized.includes('expired')
  ) {
    if (normalized.includes('expired')) {
      return 'This OTP has expired. Request a new OTP.';
    }
    return 'Incorrect OTP. Please check the 6-digit code and try again.';
  }
  if (
    normalized.includes('invalid phone') ||
    normalized.includes('phone number') ||
    normalized.includes('invalid number')
  ) {
    return 'Enter a valid mobile number.';
  }
  if (normalized.includes('phone') && normalized.includes('disabled')) {
    return 'Phone authentication is not enabled yet. Please try another login method.';
  }
  return message || 'Unable to send or verify the OTP. Please try again.';
}

export const useAuth = () => useContext(AuthContext);
