'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, formatAuthError } from '@/lib/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import Link from 'next/link';
import { Sprout, ArrowRight, AlertCircle, ShieldCheck, Mail, Lock } from 'lucide-react';

function getRoleRoute(role?: string | null): string {
  switch (role) {
    case 'buyer': return '/buyer/dashboard';
    case 'fpo': return '/fpo/dashboard';
    case 'logistics': return '/logistics/deliveries';
    case 'admin': return '/admin/dashboard';
    case 'farmer':
    default: return '/farmer/dashboard';
  }
}

export default function LoginPage() {
  const { user, isAuthenticated, isLoading: authLoading, login, loginWithGoogle } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (!authLoading && user && isAuthenticated) {
      router.replace(getRoleRoute(user.role));
    }
  }, [authLoading, user, isAuthenticated, router]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlError = params.get('error');
    if (urlError) setError(formatAuthError(urlError));
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;

    setError('');
    setLoading(true);

    try {
      const profile = await login({ email, password });
      router.replace(getRoleRoute(profile.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      setError('Enter your email address first, then choose Forgot password.');
      return;
    }

    setError('');
    setResetSent(false);
    setLoading(true);
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), normalizedEmail);
      setResetSent(true);
    } catch (err) {
      setError(formatAuthError(err instanceof Error ? err.message : 'Unable to send the password reset email.'));
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    if (loading) return;
    setError('');
    setLoading(true);

    try {
      const profile = await loginWithGoogle();
      if (profile?.role) router.replace(getRoleRoute(profile.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-8 bg-[#0a0f0d]">
      <div className="w-full max-w-md bg-[#121a16] border border-[#1e2d26] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3.5 bg-emerald-950/80 border border-emerald-800/60 rounded-2xl shadow-inner text-emerald-400">
            <Sprout className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">AgriMark</h1>
          <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
            Agricultural Intelligence Platform
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-950/70 border border-red-800/70 rounded-2xl text-red-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {resetSent && (
          <div className="p-3.5 bg-emerald-950/60 border border-emerald-800/60 rounded-2xl text-emerald-200 text-xs">
            Password reset email sent. Check your inbox and spam folder, then return here with your new password.
          </div>
        )}


        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold uppercase text-gray-400">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-4" />
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3.5 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold uppercase text-gray-400">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-4" />
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full pl-10 pr-4 py-3.5 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end -mt-2">
            <button type="button" onClick={resetPassword} disabled={loading || authLoading} className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline disabled:text-gray-600">
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || authLoading}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-950/80 disabled:text-gray-500 text-white font-extrabold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm"
          >
            <span>{loading ? 'Signing in…' : 'Sign in with Email'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 text-[11px] text-gray-500">
            <div className="h-px bg-[#1e2d26] flex-1" />
            <span>OR</span>
            <div className="h-px bg-[#1e2d26] flex-1" />
          </div>

          <button
            type="button"
            onClick={google}
            disabled={loading || authLoading}
            className="w-full py-4 bg-white hover:bg-gray-100 disabled:bg-gray-300 text-gray-900 font-extrabold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm"
          >
            Continue with Google
          </button>
        </form>

        <div className="pt-4 border-t border-[#1e2d26]/60 text-center text-[11px] text-gray-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>Secured by Firebase Authentication</span>
        </div>

        <div className="text-center text-xs text-gray-500">
          New to AgriMark?{' '}
          <Link href="/auth/register" className="text-emerald-400 hover:underline font-semibold">
            Create your account
          </Link>
        </div>
      </div>
    </div>
  );
}
