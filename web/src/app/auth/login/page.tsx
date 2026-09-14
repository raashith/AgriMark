'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import Link from 'next/link';
import { LogIn, AlertCircle, Smartphone, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const { login, loginWithPhoneOtp, verifyPhoneOtp, loginWithGoogle } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  const [mode, setMode] = useState<'password' | 'phone-otp'>('phone-otp');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const goToRole = (role: string) => {
    if (role === 'farmer') router.push('/farmer/dashboard');
    else if (role === 'buyer') router.push('/buyer/marketplace');
    else if (role === 'logistics') router.push('/logistics/deliveries');
    else if (role === 'admin') router.push('/admin/dashboard');
    else router.push('/');
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || googleLoading) return;
    setError('');
    setLoading(true);
    try {
      const user = await login({
        email: emailOrPhone.includes('@') ? emailOrPhone : undefined,
        phone_or_email: emailOrPhone,
        password,
      });
      goToRole(user.role);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || googleLoading) return;
    setError('');
    setLoading(true);
    try {
      await loginWithPhoneOtp(emailOrPhone);
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message || 'Unable to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || googleLoading) return;
    setError('');
    setLoading(true);
    try {
      const user = await verifyPhoneOtp(emailOrPhone, otp);
      goToRole(user.role);
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (loading || googleLoading) return;
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed. Please try again.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 bg-[#121a16] border border-[#1e2d26] rounded-2xl shadow-xl">
      <div className="text-center mb-6">
        <div className="inline-flex p-3 bg-emerald-950/60 border border-emerald-800/40 rounded-full mb-3 text-emerald-400">
          <LogIn className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-gray-100">{t('login')}</h1>
        <p className="text-sm text-gray-400 mt-1">Fast farmer login with mobile OTP</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-950/50 border border-red-800/50 rounded-xl text-red-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading || googleLoading}
        className="w-full py-3 px-4 mb-4 bg-white hover:bg-gray-100 disabled:opacity-50 text-gray-900 font-bold rounded-xl shadow transition flex items-center justify-center gap-3 border border-gray-300"
      >
        <span className="text-lg font-black">G</span>
        <span>{googleLoading ? t('loading') : 'Continue with Google'}</span>
      </button>

      <div className="relative flex py-2 items-center mb-4">
        <div className="flex-grow border-t border-[#1e2d26]"></div>
        <span className="flex-shrink mx-4 text-xs font-semibold text-gray-500 uppercase">Fast mobile login</span>
        <div className="flex-grow border-t border-[#1e2d26]"></div>
      </div>

      {mode === 'phone-otp' && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-3">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-sm font-semibold text-white">Login with mobile OTP</p>
              <p className="text-xs text-gray-400">Enter your number and verify the 6-digit code</p>
            </div>
          </div>
          {otpSent && (
            <button
              type="button"
              onClick={() => { setOtpSent(false); setOtp(''); setError(''); }}
              className="text-xs text-emerald-400 hover:underline"
            >
              Change
            </button>
          )}
        </div>
      )}

      {mode === 'phone-otp' ? (
        <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Mobile number</label>
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              disabled={otpSent || loading}
              className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white focus:border-emerald-500 focus:outline-none disabled:opacity-60"
              placeholder="+919876543210"
            />
          </div>

          {otpSent && (
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">6-digit OTP</label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                pattern="[0-9]{6}"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white text-center tracking-[0.45em] text-xl font-bold focus:border-emerald-500 focus:outline-none"
                placeholder="123456"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || googleLoading || (otpSent && otp.length !== 6)}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            {loading ? t('loading') : otpSent ? 'Verify OTP & Login' : 'Send 6-digit OTP'}
          </button>
        </form>
      ) : null}

      <div className="mt-4 flex items-center justify-center gap-4 text-sm">
        <button
          type="button"
          onClick={() => { setMode(mode === 'phone-otp' ? 'password' : 'phone-otp'); setOtpSent(false); setOtp(''); setError(''); }}
          className="text-gray-400 hover:text-white"
        >
          {mode === 'phone-otp' ? 'Use password instead' : 'Use mobile OTP'}
        </button>
      </div>

      {mode === 'password' && (
        <form onSubmit={handlePasswordLogin} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Email or phone</label>
            <input
              type="text"
              required
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white focus:border-emerald-500 focus:outline-none"
              placeholder="farmer@agrimark.org or +919876543210"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">{t('password')}</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white focus:border-emerald-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 text-white font-bold rounded-xl transition"
          >
            {loading ? t('loading') : t('login')}
          </button>
        </form>
      )}

      <div className="mt-6 text-center text-sm text-gray-400">
        <span>Don&apos;t have an account? </span>
        <Link href="/auth/register" className="text-emerald-400 hover:underline font-semibold">
          {t('register')}
        </Link>
      </div>
      <div className="mt-2 text-center text-xs text-gray-500 flex justify-center gap-2 items-center">
        <ArrowLeft className="w-3 h-3 rotate-45" />
        <span>OTP login uses your mobile number and a 6-digit verification code.</span>
      </div>
    </div>
  );
}
