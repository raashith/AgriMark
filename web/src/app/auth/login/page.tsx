'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, normalizePhone, formatAuthError } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import Link from 'next/link';
import { LogIn, AlertCircle, Smartphone, Lock, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const { user, isAuthenticated, isLoading: authLoading, login, sendPhoneOtp, verifyPhoneOtp, loginWithGoogle } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  const [mode, setMode] = useState<'phone-otp' | 'password'>('phone-otp');

  // Phone OTP state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState<number>(0);
  const [formattedPhoneDisplay, setFormattedPhoneDisplay] = useState('');

  // Password login state
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');

  // Status state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // OTP Box refs for auto-focus & backspace navigation
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const urlError = searchParams.get('error') || searchParams.get('error_description');
      if (urlError) {
        setError(formatAuthError(urlError));
      }
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user && isAuthenticated) {
      goToRole(user);
    }
  }, [authLoading, user, isAuthenticated]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    if (otpSent && otpInputRefs.current[0]) {
      otpInputRefs.current[0]?.focus();
    }
  }, [otpSent]);

  const goToRole = (userProfile: any) => {
    if (userProfile?.needs_onboarding) {
      router.push('/auth/onboarding');
      return;
    }
    const role = userProfile.role;
    if (role === 'farmer') router.push('/farmer/dashboard');
    else if (role === 'buyer') router.push('/buyer/marketplace');
    else if (role === 'fpo') router.push('/fpo/dashboard');
    else if (role === 'logistics') router.push('/logistics/deliveries');
    else if (role === 'admin') router.push('/admin/dashboard');
    else router.push('/farmer/dashboard');
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loading || googleLoading || (resendTimer > 0 && otpSent)) return;
    setError('');

    let normalized = '';
    try {
      normalized = normalizePhone(phoneNumber);
    } catch (err: any) {
      setError(err.message || 'Enter a valid mobile number.');
      return;
    }

    setLoading(true);
    try {
      await sendPhoneOtp(phoneNumber);
      setOtpSent(true);
      setResendTimer(60);
      setOtpDigits(['', '', '', '', '', '']);
      setFormattedPhoneDisplay(normalized);
    } catch (err: any) {
      setError(formatAuthError(err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleOtpDigitChange = (index: number, value: string) => {
    const numericChar = value.replace(/\D/g, '');
    if (!numericChar && value !== '') return;

    const newDigits = [...otpDigits];
    newDigits[index] = numericChar.slice(-1);
    setOtpDigits(newDigits);

    if (numericChar && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
        const newDigits = [...otpDigits];
        newDigits[index - 1] = '';
        setOtpDigits(newDigits);
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 0) return;

    const newDigits = ['', '', '', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setOtpDigits(newDigits);

    const nextIndex = Math.min(pasted.length, 5);
    otpInputRefs.current[nextIndex]?.focus();
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || googleLoading) return;
    setError('');

    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setError('Incorrect OTP. Please check the 6-digit code and try again.');
      return;
    }

    setLoading(true);
    try {
      const userProfile = await verifyPhoneOtp(phoneNumber, fullOtp);
      goToRole(userProfile);
    } catch (err: any) {
      setError(formatAuthError(err.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || googleLoading) return;
    setError('');
    setLoading(true);
    try {
      const userProfile = await login({
        email: emailOrPhone.includes('@') ? emailOrPhone : undefined,
        phone_or_email: emailOrPhone,
        password,
      });
      goToRole(userProfile);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
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
    <div className="max-w-md mx-auto my-10 p-6 bg-[#121a16] border border-[#1e2d26] rounded-2xl shadow-2xl">
      <div className="text-center mb-6">
        <div className="inline-flex p-3 bg-emerald-950/70 border border-emerald-800/50 rounded-full mb-3 text-emerald-400">
          <LogIn className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-gray-100">AgriMark Login</h1>
        <p className="text-sm text-gray-400 mt-1">Farmer-first marketplace authentication</p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-2 p-1 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl mb-6 text-sm font-semibold">
        <button
          type="button"
          onClick={() => { setMode('phone-otp'); setError(''); }}
          className={`py-2 rounded-lg transition flex items-center justify-center gap-2 ${
            mode === 'phone-otp'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Mobile OTP</span>
        </button>
        <button
          type="button"
          onClick={() => { setMode('password'); setError(''); }}
          className={`py-2 rounded-lg transition flex items-center justify-center gap-2 ${
            mode === 'password'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Email & Password</span>
        </button>
      </div>

      {error && (
        <div className="mb-5 p-3.5 bg-red-950/60 border border-red-800/60 rounded-xl text-red-300 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
          <span className="leading-snug">{error}</span>
        </div>
      )}

      {/* Google Login Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading || googleLoading}
        className="w-full py-3 px-4 mb-5 bg-white hover:bg-gray-100 disabled:opacity-50 text-gray-900 font-bold rounded-xl shadow transition flex items-center justify-center gap-3 border border-gray-300"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        <span>{googleLoading ? t('loading') : 'Continue with Google'}</span>
      </button>

      <div className="relative flex py-2 items-center mb-5">
        <div className="flex-grow border-t border-[#1e2d26]"></div>
        <span className="flex-shrink mx-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {mode === 'phone-otp' ? 'Or log in with mobile OTP' : 'Or log in with password'}
        </span>
        <div className="flex-grow border-t border-[#1e2d26]"></div>
      </div>

      {/* MOBILE OTP MODE */}
      {mode === 'phone-otp' && (
        <>
          {!otpSent ? (
            /* STEP 1: ENTER MOBILE NUMBER */
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5">Mobile Number</label>
                <div className="flex items-center gap-2">
                  <div className="px-3.5 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-emerald-400 font-bold text-sm select-none shrink-0">
                    +91
                  </div>
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white font-medium focus:border-emerald-500 focus:outline-none"
                    placeholder="98765 43210"
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1.5">Enter 10-digit mobile number to receive a 6-digit OTP</p>
              </div>

              <button
                type="submit"
                disabled={loading || googleLoading || !phoneNumber.trim()}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-950 disabled:text-gray-500 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                {loading ? t('loading') : 'Send 6-digit OTP'}
              </button>
            </form>
          ) : (
            /* STEP 2: ENTER 6-DIGIT OTP */
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="p-3.5 bg-emerald-950/30 border border-emerald-900/40 rounded-xl text-center">
                <p className="text-xs text-gray-300">OTP sent to</p>
                <p className="text-base font-bold text-emerald-400 mt-0.5">{formattedPhoneDisplay}</p>
                <button
                  type="button"
                  onClick={() => { setOtpSent(false); setOtpDigits(['', '', '', '', '', '']); setError(''); }}
                  className="text-xs text-gray-400 hover:text-emerald-400 underline mt-1 inline-block"
                >
                  Change mobile number
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-2 text-center">
                  Enter 6-Digit Verification Code
                </label>
                <div className="flex items-center justify-between gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { otpInputRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      autoComplete="one-time-code"
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className="w-12 h-14 bg-[#0a0f0d] border border-[#1e2d26] focus:border-emerald-500 rounded-xl text-center text-xl font-bold text-white shadow-inner focus:outline-none transition"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || googleLoading || otpDigits.join('').length !== 6}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-950 disabled:text-gray-500 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                {loading ? t('loading') : 'Verify & Continue'}
              </button>

              <div className="text-center text-xs text-gray-400 pt-1">
                <span>Didn&apos;t receive the OTP? </span>
                {resendTimer > 0 ? (
                  <span className="text-gray-500 font-semibold">Resend OTP in {resendTimer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={loading}
                    className="text-emerald-400 hover:underline font-bold"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}
        </>
      )}

      {/* EMAIL & PASSWORD MODE */}
      {mode === 'password' && (
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Email or Phone Number</label>
            <input
              type="text"
              required
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#1e2d26] rounded-xl text-white focus:border-emerald-500 focus:outline-none font-medium"
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
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-950 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
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

      <div className="mt-4 pt-4 border-t border-[#1e2d26]/60 text-center text-[11px] text-gray-500 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span>Secured by Supabase Auth & AgriMark Protection</span>
      </div>
    </div>
  );
}
