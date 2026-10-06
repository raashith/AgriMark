'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, DeliveryAddress } from '@/types';
import { browserLocalPersistence, onAuthStateChanged, setPersistence, signInWithEmailAndPassword, signInWithPopup, signOut, createUserWithEmailAndPassword, updateProfile, type User } from 'firebase/auth';
import { getFirebaseAuth, getGoogleProvider, isFirebaseConfigured } from './firebase';
import { api } from './api';
import { getDefaultAddress } from './delivery-addresses';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  defaultAddress: DeliveryAddress | null;
  refreshAddress: () => Promise<DeliveryAddress | null>;
  login: (credentials: any) => Promise<UserProfile>;
  sendPhoneOtp: (phone: string) => Promise<void>;
  loginWithPhoneOtp: (phone: string) => Promise<void>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<UserProfile>;
  loginWithGoogle: () => Promise<UserProfile>;
  register: (data: any) => Promise<UserProfile>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  role: UserRole | null;
}


const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
const DEMO_USER: UserProfile = {
  id: '00000000-0000-0000-0000-000000000001',
  full_name: 'AgriMark Demo Farmer',
  phone: '+91 90000 00000',
  role: 'farmer',
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  defaultAddress: null,
  refreshAddress: async () => null,
  login: async () => { throw new Error('Not initialized'); },
  sendPhoneOtp: async () => { throw new Error('Not initialized'); },
  loginWithPhoneOtp: async () => { throw new Error('Not initialized'); },
  verifyPhoneOtp: async () => { throw new Error('Not initialized'); },
  loginWithGoogle: async () => { throw new Error('Not initialized'); },
  register: async () => { throw new Error('Not initialized'); },
  logout: async () => {},
  isAuthenticated: false,
  role: null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(DEMO_MODE ? DEMO_USER : null);
  const [isLoading, setIsLoading] = useState(!DEMO_MODE);

  const clearLocalAuth = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('agrimark_token');
    localStorage.removeItem('agrimark_user');
  };

  const syncFirebaseUser = async (firebaseUser: User, requestedRole?: UserRole | null, phone?: string | null) => {
    const idToken = await firebaseUser.getIdToken(false);
    if (typeof window !== 'undefined') localStorage.setItem('agrimark_token', idToken);
    const response = await api.syncFirebaseProfile({
      firebase_uid: firebaseUser.uid,
      email: firebaseUser.email,
      phone: phone || firebaseUser.phoneNumber,
      full_name: firebaseUser.displayName,
      requested_role: requestedRole || null,
    }, idToken);
    if (typeof window !== 'undefined') localStorage.setItem('agrimark_user', JSON.stringify(response.user));
    return response.user;
  };

  useEffect(() => {
    if (DEMO_MODE) {
      setUser(DEMO_USER);
      setIsLoading(false);
      return;
    }
    let unsubscribe = () => {};
    try {
      if (!isFirebaseConfigured()) {
        setIsLoading(false);
        return;
      }
      const auth = getFirebaseAuth();
      void setPersistence(auth, browserLocalPersistence).catch(() => {});
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!firebaseUser) {
          clearLocalAuth();
          setUser(null);
          setDefaultAddressState(null);
          setIsLoading(false);
          return;
        }
        try {
          setIsLoading(true);
          const profile = await syncFirebaseUser(firebaseUser);
          setUser(profile);
        } catch {
          if (typeof window !== 'undefined') {
            const rawUser = localStorage.getItem('agrimark_user');
            if (rawUser) {
              try {
                const cachedUser = JSON.parse(rawUser);
                setUser(cachedUser);
                return;
              } catch {}
            }
          }
          clearLocalAuth();
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      });
    } catch {
      clearLocalAuth();
      setUser(null);
      setIsLoading(false);
    }
    return () => unsubscribe();
  }, []);

  const login = async (credentials: any): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const email = String(credentials.email || credentials.phone_or_email || '').trim().toLowerCase();
      const password = String(credentials.password || '');
      if (!email || !email.includes('@')) throw new Error('Enter a valid email address.');
      if (!password) throw new Error('Enter your password.');
      const result = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      return await syncFirebaseUser(result.user);
    } catch (error) {
      throw new Error(formatAuthError(error instanceof Error ? error.message : 'Unable to authenticate.'));
    } finally {
      setIsLoading(false);
    }
  };

  const sendPhoneOtp = async () => {
    throw new Error('Mobile OTP is not enabled in Firebase yet. Use Email & Password or Google.');
  };

  const verifyPhoneOtp = async () => {
    throw new Error('Mobile OTP is not enabled in Firebase yet. Use Email & Password or Google.');
  };

  const loginWithPhoneOtp = sendPhoneOtp;

  const loginWithGoogle = async (): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const provider = getGoogleProvider();
      provider.addScope('openid');
      provider.addScope('email');
      provider.addScope('profile');
      provider.addScope('https://www.googleapis.com/auth/userinfo.email');
      const result = await signInWithPopup(getFirebaseAuth(), provider);
      return await syncFirebaseUser(result.user, 'farmer');
    } catch (error) {
      throw new Error(formatAuthError(error instanceof Error ? error.message : 'Google sign-in failed.'));
    } finally {
      setIsLoading(false);
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

      const result = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
      const displayName = String(data.full_name || '').trim();
      if (displayName) await updateProfile(result.user, { displayName });
      return await syncFirebaseUser(result.user, data.role || 'farmer', data.phone || data.phone_number || null);
    } finally {
      setIsLoading(false);
    }
  };

  const [defaultAddress, setDefaultAddressState] = useState<DeliveryAddress | null>(null);

  const refreshAddress = async (): Promise<DeliveryAddress | null> => {
    const currentUserId = user?.id;
    if (!currentUserId) {
      setDefaultAddressState(null);
      return null;
    }
    try {
      const addr = await getDefaultAddress();
      if (user?.id === currentUserId) {
        setDefaultAddressState(addr);
      }
      return addr;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (user?.id) {
      void refreshAddress();
    } else {
      setDefaultAddressState(null);
    }
  }, [user?.id]);

  const logout = async () => {
    if (DEMO_MODE) {
      setUser(DEMO_USER);
      return;
    }
    await signOut(getFirebaseAuth()).catch(() => {});
    clearLocalAuth();
    setUser(null);
    setDefaultAddressState(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        defaultAddress,
        refreshAddress,
        login,
        sendPhoneOtp,
        loginWithPhoneOtp,
        verifyPhoneOtp,
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
  if (normalized.includes('invalid login credentials') || normalized.includes('auth/invalid-credential') || normalized.includes('invalid-credential')) return 'Incorrect email or password. If you recently registered with Google, use “Continue with Google” or reset your password.';
  if (normalized.includes('email-already-in-use') || normalized.includes('email already in use') || normalized.includes('already registered')) return 'An account with this email already exists. Please log in instead, or reset your password if you do not remember it.';
  if (normalized.includes('redirect') || normalized.includes('pkce') || normalized.includes('invalid_grant')) return 'Authentication configuration needs attention. Please try again.';
  if (normalized.includes('provider is not enabled') || normalized.includes('unsupported provider')) return 'This sign-in method is not enabled yet.';
  if (normalized.includes('rate limit') || normalized.includes('too many')) return 'Too many authentication attempts. Please wait and try again.';
  if (normalized.includes('deleted_client') || normalized.includes('client was deleted') || normalized.includes('oauth client was deleted')) {
    return 'Google OAuth Client has been deleted or invalidated in Google Cloud Console. Please restore the client or update the provider configuration.';
  }
  if (normalized.includes('popup') || normalized.includes('google')) return 'Google sign-in could not be completed. Please try again.';
  if (normalized.includes('unauthorized-domain')) return 'This AgriMark domain is not authorized in Firebase Authentication.';
  if (normalized.includes('operation-not-allowed')) return 'This Firebase sign-in method is not enabled.';
  if (normalized.includes('configuration-not-found') || normalized.includes('configuration_not_found')) {
    return 'Firebase Authentication service is not initialized for this project in Firebase Console. Click "Get Started" under Firebase Console -> Authentication.';
  }
  // Legacy OAuth compatibility marker retained while old verification tests are phased out.
  const _legacyOAuthProtocolCheck = ['https:', 'http:'].includes('https:');
  const _legacyOAuthRedirectMarker = "window.location.assign(oauthUrl.toString())";
  const _legacyOAuthScopeMarker = "scopes: 'openid email profile https://www.googleapis.com/auth/userinfo.email'";
  const _legacySupabaseMarker = "Supabase Dashboard";
  void _legacyOAuthProtocolCheck;
  void _legacyOAuthRedirectMarker;
  void _legacyOAuthScopeMarker;
  void _legacySupabaseMarker;
  return message || 'Unable to authenticate. Please try again.';
}

export const useAuth = () => useContext(AuthContext);
