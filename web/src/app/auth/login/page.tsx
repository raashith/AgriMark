'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, formatAuthError } from '@/lib/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import Link from 'next/link';
import { Sprout, ArrowRight, AlertCircle, ShieldCheck, Mail, Lock, CheckCircle2 } from 'lucide-react';

type SelectableRole = 'farmer' | 'buyer' | 'fpo' | 'logistics';

const ROLE_LABELS: Record<SelectableRole, string> = {
  farmer: 'Farmer',
  buyer: 'Buyer',
  fpo: 'FPO / Co-op',
  logistics: 'Logistics Partner',
};

const ROLE_OPTIONS: Array<{ id: SelectableRole; label: string }> = [
  { id: 'farmer', label: ROLE_LABELS.farmer },
  { id: 'buyer', label: ROLE_LABELS.buyer },
  { id: 'fpo', label: ROLE_LABELS.fpo },
  { id: 'logistics', label: ROLE_LABELS.logistics },
];

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
  const { user, isAuthenticated, isLoading: authLoading, login, loginWithGoogle, activateRole } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<SelectableRole>('farmer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);



  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlError = params.get('error');
    if (urlError) setError(formatAuthError(urlError));
  }, []);

  const continueToSelectedRole = async () => {
    if (loading || authLoading) return;
    setError('');
    setLoading(true);
    try {
      // Persist the selected workspace on the authenticated profile before navigating.
      const profile = await activateRole(role);
      const targetRole = role || profile.role || 'farmer';
      router.replace(getRoleRoute(targetRole));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to open the selected workspace.');
    } finally {
      setLoading(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading || authLoading) return;

    setError('');
    setLoading(true);

    try {
      // Use the explicit selection, then activate it after authentication so
      // stale/default profile roles cannot override the workspace the user chose.
      await login({ email, password, role });
      // Explicitly activate the selected workspace after Firebase authentication.
      // This prevents a concurrent auth-state refresh from leaving the old role active.
      await activateRole(role);
      router.replace(getRoleRoute(role));
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
    if (loading || authLoading) return;
    setError('');
    setLoading(true);

    try {
      await loginWithGoogle(role);
      // Persist the selected workspace before navigating after Google sign-in too.
      await activateRole(role);
      router.replace(getRoleRoute(role));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex flex-col justify-center items-center overflow-hidden px-4 py-10 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.13),transparent_55%),linear-gradient(145deg,#070c0a,#0b1410_55%,#07100c)]">
      <div className="w-full max-w-md relative rounded-3xl border border-white/10 bg-white/[0.055] p-6 sm:p-8 shadow-[0_24px_90px_rgba(0,0,0,0.42)] backdrop-blur-2xl ring-1 ring-white/[0.035] space-y-6">
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


        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold uppercase text-gray-400">Choose your workspace</label>
            <p className="text-xs font-semibold text-emerald-300" aria-live="polite">Selected workspace: {ROLE_LABELS[role]}</p>
            <p className="text-xs text-gray-500">One AgriMark account can have more than one role.</p>
            <div className="grid grid-cols-2 gap-2">
              {ROLE_OPTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={role === item.id}
                  onClick={() => { setError(''); setRole(item.id); }}
                  className={role === item.id
                    ? 'p-3 rounded-xl border border-emerald-400/70 bg-emerald-400/10 text-emerald-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl font-semibold flex items-center justify-between transition-colors'
                    : 'p-3 rounded-xl border border-white/10 bg-black/15 text-gray-300 font-semibold flex items-center justify-between backdrop-blur-xl hover:border-emerald-400/40 hover:bg-white/[0.04] transition-colors'}
                >
                  <span>{item.label}</span>
                  {role === item.id && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </button>
              ))}
            </div>
          </div>
          {isAuthenticated && user ? (
            <div className="space-y-3 rounded-2xl border border-emerald-800/60 bg-emerald-950/30 p-4">
              <div className="text-sm font-semibold text-emerald-200">Signed in as {user.full_name || user.email || 'AgriMark user'}</div>
              <p className="text-xs text-gray-400">Continue with this account to open the selected workspace. Your Farmer and Buyer access share one account.</p>
              <button
                type="button"
                onClick={continueToSelectedRole}
                disabled={loading || authLoading}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-950/80 text-white font-extrabold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm"
              >
                <span>{loading ? 'Opening workspace…' : 'Continue as ' + ROLE_LABELS[role]}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
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
                    className="w-full pl-10 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-2xl text-white placeholder:text-slate-400/90 backdrop-blur-xl focus:border-emerald-400/70 focus:bg-white/[0.045] focus:outline-none focus:ring-2 focus:ring-emerald-400/15 transition"
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
                className="w-full py-4 bg-emerald-500/90 hover:bg-emerald-400 disabled:bg-emerald-950/80 disabled:text-gray-500 text-white font-extrabold rounded-2xl border border-emerald-300/30 shadow-[0_12px_28px_rgba(16,185,129,0.17)] backdrop-blur-xl transition flex items-center justify-center gap-2 text-sm"
              >
                <span>{loading ? 'Signing in…' : 'Sign in'}</span>
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
                className="w-full py-4 bg-white/[0.94] hover:bg-white disabled:bg-white/50 text-gray-900 font-extrabold rounded-2xl border border-white/60 shadow-[0_10px_30px_rgba(0,0,0,0.16)] backdrop-blur-xl transition flex items-center justify-center gap-3 text-sm"
              >
                <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5 shrink-0">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" transform="translate(0 4) scale(1)"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.73 7.18l7.66 5.95c4.47-4.13 7.11-10.2 7.11-17.6Z"/>
                  <path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.2a23.98 23.98 0 0 0 0 21.58l7.98-6.2Z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.85l-7.66-5.95c-2.13 1.43-4.85 2.28-8.25 2.28-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.2C6.51 42.02 14.62 48 24 48Z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </form>
          )}
        </div>
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
