'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@/types';
import { api } from './api';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (credentials: any) => Promise<UserProfile>;
  register: (data: any) => Promise<UserProfile>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  role: UserRole | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => { throw new Error('Not initialized'); },
  register: async () => { throw new Error('Not initialized'); },
  logout: async () => {},
  isAuthenticated: false,
  role: null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('agrimark_token');
      if (token) {
        try {
          const profile = await api.getMe();
          setUser(profile);
          localStorage.setItem('agrimark_user', JSON.stringify(profile));
        } catch {
          localStorage.removeItem('agrimark_token');
          localStorage.removeItem('agrimark_user');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: any): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const res = await api.login(credentials);
      localStorage.setItem('agrimark_token', res.access_token);
      localStorage.setItem('agrimark_user', JSON.stringify(res.user));
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      if (data.role === 'admin') {
        throw new Error('Self-registration as admin is prohibited.');
      }
      await api.register(data);

      // The backend login endpoint accepts either email or phone as the identifier.
      // Reuse the exact identifier supplied during registration so phone-only signup works.
      const identifier = data.email || data.phone;
      if (!identifier) {
        throw new Error('Registration requires an email or phone identifier for automatic login.');
      }
      const loginRes = await api.login({
        email: data.email,
        phone: data.phone,
        phone_or_email: identifier,
        password: data.password,
      });
      localStorage.setItem('agrimark_token', loginRes.access_token);
      localStorage.setItem('agrimark_user', JSON.stringify(loginRes.user));
      setUser(loginRes.user);
      return loginRes.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await api.logout();
    } catch {}
    localStorage.removeItem('agrimark_token');
    localStorage.removeItem('agrimark_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
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
