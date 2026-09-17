'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@/types';
import { supabase } from './supabase';
import { recordActionEvent } from './telemetry';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<UserProfile>;
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

  const syncProfile = async (userId: string, email?: string): Promise<UserProfile> => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        const u: UserProfile = {
          id: profile.id,
          email: email || profile.email,
          full_name: profile.full_name || 'AgriMark User',
          phone: profile.phone,
          role: (profile.role as UserRole) || 'farmer',
          avatar_url: profile.avatar_url,
          district: profile.district,
          state: profile.state,
          trust_score: profile.trust_score || 95,
        };
        setUser(u);
        return u;
      }
    } catch (_) {}

    // Fallback profile if record not yet created
    const fallback: UserProfile = {
      id: userId,
      email: email || 'user@agrimark.in',
      full_name: 'AgriMark User',
      role: 'farmer',
      trust_score: 90,
    };
    setUser(fallback);
    return fallback;
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          if (data.session.access_token) {
            localStorage.setItem('agrimark_token', data.session.access_token);
          }
          await syncProfile(data.session.user.id, data.session.user.email);
        }
      } catch (_) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        if (session.access_token) {
          localStorage.setItem('agrimark_token', session.access_token);
        }
        await syncProfile(session.user.id, session.user.email);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('agrimark_token');
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) throw new Error(error.message);
      if (!data.user) throw new Error('Login failed');

      if (data.session?.access_token) {
        localStorage.setItem('agrimark_token', data.session.access_token);
      }

      await recordActionEvent('user_login', { email });
      return await syncProfile(data.user.id, data.user.email);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://agrimark-stitch-web.onrender.com';
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
        queryParams: { prompt: 'select_account' },
      },
    });

    if (error) throw new Error(error.message);
    if (data?.url && typeof window !== 'undefined') {
      window.location.assign(data.url);
    }
  };

  const register = async (data: any): Promise<UserProfile> => {
    if (data.role === 'admin') throw new Error('Self-registration as admin is prohibited.');
    setIsLoading(true);
    try {
      const { data: sbData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            phone: data.phone,
            role: data.role || 'farmer',
          },
        },
      });

      if (error) throw new Error(error.message);
      if (!sbData.user) throw new Error('Registration failed');

      await recordActionEvent('user_register', { role: data.role });
      return await syncProfile(sbData.user.id, sbData.user.email);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try { await supabase.auth.signOut(); } catch {}
    localStorage.removeItem('agrimark_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        loginWithGoogle,
        register,
        logout,
        isAuthenticated: !!user,
        role: user?.role || null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
