'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, UserRole, DeliveryAddress } from '@/types';
import { api } from './api';
import { getDefaultAddress } from './delivery-addresses';
import {
  browserLocalPersistence,
  getIdToken,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { getFirebaseAuth, getGoogleProvider, isFirebaseConfigured } from './firebase';

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

function clearLocalAuth() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('agrimark_token');
  localStorage.removeItem('agrimark_user');
}

function firebaseErrorMessage(error: unknown): string {
  const code = typeof error === 'object' && error && 'code' in error
    ? String((error as { code?: unknown }).code)
    : '';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please log in instead.';
    case 'auth/weak-password':
      return 'Password must contain at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many authentication attempts. Please wait and try again.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled.';
    case 'auth/popup-blocked':
      return 'Google sign-in was blocked by the browser. Allow pop-ups and try again.';
    case 'auth/unauthorized-domain':
      return 'This AgriMark domain is not authorized in Firebase Authentication.';
    case 'auth/operation-not-allowed':
      return 'This Firebase sign-in method is not enabled.';
    default:
      return error instanceof Error ? error.message : 'Unable to authenticate. Please try again.';
  }
}

async function syncFirebaseUser(firebaseUser: {
  uid: string;
  email: string | null;
  phoneNumber: string | null;
  displayName: string | null;
  getIdToken: (forceRefresh?: boolean) => Promise<string>;
}): Promise<UserProfile> {
  const idToken = await getIdToken(firebaseUser as any, false);
  if (typeof window !== 'undefined') {
    localStorage.setItem('agrimark_token', idToken);
  }

  const response = await api.syncFirebaseProfile(
    {
      firebase_uid: firebaseUser.uid,
      email: firebaseUser.email,
      phone: firebaseUser.phoneNumber,
      full_name: firebaseUser.displayName,
    },
    idToken,
  );

  if (typeof window !== 'undefined') {
    localStorage.setItem('agrimark_user', JSON.stringify(response.user));
  }

  return response.user;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [defaultAddress, setDefaultAddressState] = useState<DeliveryAddress | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setIsLoading(false);
      return;
    }

    const auth = getFirebaseAuth();
    void setPersistence(auth, browserLocalPersistence).catch(() => {});

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);

      if (!firebaseUser) {
        clearLocalAuth();
        setUser(null);
        setDefaultAddressState(null);
        setIsLoading(false);
        return;
      }

      try {
        const profile = await syncFirebaseUser(firebaseUser);
        setUser(profile);
      } catch {
        clearLocalAuth();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (credentials: any): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const email = String(credentials.email || credentials.phone_or_email || '').trim().toLowerCase();
      const password = String(credentials.password || '');

      if (!email || !email.includes('@')) throw new Error('Enter a valid email address.');
      if (!password) throw new Error('Enter your password.');

      const auth = getFirebaseAuth();
      const result = await signInWithEmailAndPassword(auth, email, password);
      return await syncFirebaseUser(result.user);
    } catch (error) {
      throw new Error(firebaseErrorMessage(error));
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

  const loginWithGoogle = async (): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const auth = getFirebaseAuth();
      const result = await signInWithPopup(auth, getGoogleProvider());
      return await syncFirebaseUser(result.user);
    } catch (error) {
      throw new Error(firebaseErrorMessage(error));
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

      const auth = getFirebaseAuth();
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const displayName = String(data.full_name || '').trim();

      if (displayName) {
        await updateProfile(result.user, { displayName });
      }

      return await syncFirebaseUser({
        ...result.user,
        displayName: displayName || result.user.displayName,
      });
    } catch (error) {
      throw new Error(firebaseErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAddress = async (): Promise<DeliveryAddress | null> => {
    if (!user?.id) {
      setDefaultAddressState(null);
      return null;
    }

    try {
      const address = await getDefaultAddress();
      setDefaultAddressState(address);
      return address;
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
    await signOut(getFirebaseAuth()).catch(() => {});
    await api.logout().catch(() => {});
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
        loginWithPhoneOtp: sendPhoneOtp,
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
  return message || 'Unable to authenticate. Please try again.';
}

export const useAuth = () => useContext(AuthContext);
