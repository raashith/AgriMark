'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@/types';
import { api } from './api';
import { supabase } from './supabase';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (credentials: any) => Promise<UserProfile>;
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
        const { data } = await supabase.auth.getSession();
        if (data?.session?.access_token) {
          await syncProfile(data.session.access_token);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.access_token) {
        await syncProfile(session.access_token);
      } else if (_event === 'SIGNED_OUT') {
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

  const loginWithPhoneOtp = async (phone: string): Promise<void> => {
    const normalized = normalizePhone(phone);
    validatePhone(normalized);
    const { error } = await supabase.auth.signInWithOtp({ phone: normalized });
    if (error) throw new Error(formatAuthError(error.message));
  };

  const verifyPhoneOtp = async (phone: string, token: string): Promise<UserProfile> => {
    const normalized = normalizePhone(phone);
    validatePhone(normalized);
    const code = token.replace(/\D/g, '');
    if (!/^\d{6}$/.test(code)) throw new Error('Enter the 6-digit verification code.');

    const { data, error } = await supabase.auth.verifyOtp({
      phone: normalized,
      token: code,
      type: 'sms',
    });
    if (error) throw new Error(formatAuthError(error.message));
    if (!data.session?.access_token) throw new Error('Verification succeeded but no session was returned. Please try again.');

    const profile = await syncProfile(data.session.access_token);
    if (!profile) throw new Error('Phone verified, but profile setup could not be loaded. Please try again.');
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

function normalizePhone(phone: string): string {
  const raw = phone.trim();
  const digits = raw.replace(/\D/g, '');
  if (raw.startsWith('+')) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits}`;
}

function validatePhone(phone: string): void {
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
    throw new Error('Enter a valid mobile number with country code, for example +919876543210.');
  }
}

function formatAuthError(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes('rate limit') || normalized.includes('too many')) {
    return 'Too many OTP requests. Please wait before requesting another code.';
  }
  if (normalized.includes('phone') && normalized.includes('disabled')) {
    return 'Phone login is not enabled yet. Please contact support.';
  }
  return message || 'Unable to send or verify the OTP. Please try again.';
}
