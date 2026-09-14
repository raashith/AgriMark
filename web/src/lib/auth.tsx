'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@/types';
import { api } from './api';
import { supabase } from './supabase';


interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (credentials: any) => Promise<UserProfile>;
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
        } else {
          const storedToken = localStorage.getItem('agrimark_token');
          if (storedToken) {
            await syncProfile(storedToken);
          }
        }
      } catch {
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

      // 1. Try Supabase Auth JS SDK
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

      // 2. Fallback to API login if client auth did not return sessionToken
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

      const email = data.email;
      const password = data.password;

      let clientSignupSucceeded = false;
      if (email && password) {
        const { data: sbData, error: sbError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: data.full_name,
              phone: data.phone || data.phone_number,
            },
          },
        });
        if (sbError && !sbError.message.toLowerCase().includes('already registered')) {
          throw new Error(sbError.message);
        }
        clientSignupSucceeded = !sbError;
        if (sbData?.session?.access_token) {
          const profile = await syncProfile(sbData.session.access_token);
          if (profile) return profile;
        }
      }

      if (!clientSignupSucceeded) {
        await api.register(data);
      }


      const identifier = data.email || data.phone || data.phone_number;
      if (!identifier) {
        throw new Error('Registration submitted. Please log in with your account.');
      }

      return await login({
        email: data.email,
        phone_or_email: identifier,
        password: data.password,
      });
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

export const useAuth = () => useContext(AuthContext);

