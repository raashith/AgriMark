'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, normalizePhone, formatAuthError } from '@/lib/auth';
import { getDefaultAddress } from '@/lib/delivery-addresses';
import Link from 'next/link';
import { Sprout, Smartphone, ArrowRight, ArrowLeft, AlertCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const { user, isAuthenticated, isLoading: authLoading, sendPhoneOtp, verifyPhoneOtp } = useAuth();
  const router = useRouter();

  // Flow step: 'phone' | 'otp'
  const [step, setStep] = useState<'phone' | 'otp'>('phone');

  // Input states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState<number>(0);
  const [formattedPhoneDisplay, setFormattedPhoneDisplay] = useState('');

  // Loading & error states
  const [error, setError] = useState('');
  const [inlinePhoneError, setInlinePhoneError] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoVerifying, setAutoVerifying] = useState(false);

  // OTP Box refs for auto-focus & backspace navigation
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Handle URL errors (if any)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const urlError = searchParams.get('error') || searchParams.get('error_description');
      if (urlError) {
        setError(formatAuthError(urlError));
      }
    }
  }, []);

  // Post-auth routing check: Check if user has a default delivery address
  const handlePostAuthRouting = React.useCallback(async (userProfile: any) => {
    try {
      const defaultAddr = await getDefaultAddress();
      if (!defaultAddr) {
        router.push('/auth/location');
        return;
      }
      const role = userProfile.role;
      if (role === 'farmer') router.push('/farmer/dashboard');
      else if (role === 'buyer') router.push('/buyer/marketplace');
      else if (role === 'fpo') router.push('/fpo/dashboard');
      else if (role === 'logistics') router.push('/logistics/deliveries');
      else if (role === 'admin') router.push('/admin/dashboard');
      else router.push('/buyer/marketplace');
    } catch {
      router.push('/auth/location');
    }
  }, [router]);

  useEffect(() => {
    if (!authLoading && user && isAuthenticated) {
      void handlePostAuthRouting(user);
    }
  }, [authLoading, user, isAuthenticated, handlePostAuthRouting]);

  // Handle 10-digit mobile number input validation
  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(rawVal);
    setError('');

    if (rawVal.length > 0 && rawVal.length < 10) {
      setInlinePhoneError('Enter a valid 10-digit Indian mobile number.');
    } else {
      setInlinePhoneError('');
    }
  };

  const isPhoneValid = phoneNumber.length === 10;

  // Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loading || !isPhoneValid) return;
    setError('');
    setInlinePhoneError('');

    let normalized = '';
    try {
      normalized = normalizePhone(phoneNumber);
    } catch (err: any) {
      setError(err.message || 'Enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      await sendPhoneOtp(phoneNumber);
      setStep('otp');
      setResendTimer(60);
      setOtpDigits(['', '', '', '', '', '']);
      setFormattedPhoneDisplay(normalized.replace(/(\+\d{2})(\d{5})(\d{5})/, '$1 $2 $3'));
      // Auto-focus first OTP box
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setError(formatAuthError(err.message));
    } finally {
      setLoading(false);
    }
  };

  // OTP box digit change
  const handleOtpDigitChange = (index: number, value: string) => {
    const numericChar = value.replace(/\D/g, '');
    if (!numericChar && value !== '') return;

    const newDigits = [...otpDigits];
    newDigits[index] = numericChar.slice(-1);
    setOtpDigits(newDigits);
    setError('');

    if (numericChar && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto verify if all 6 digits entered
    const currentCode = newDigits.join('');
    if (currentCode.length === 6) {
      void triggerOtpVerification(currentCode);
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

    if (pasted.length === 6) {
      void triggerOtpVerification(pasted);
    }
  };

  const triggerOtpVerification = async (code: string) => {
    if (loading || autoVerifying) return;
    setError('');
    setAutoVerifying(true);
    setLoading(true);

    try {
      const userProfile = await verifyPhoneOtp(phoneNumber, code);
      await handlePostAuthRouting(userProfile);
    } catch (err: any) {
      setError(formatAuthError(err.message));
    } finally {
      setLoading(false);
      setAutoVerifying(false);
    }
  };

  const handleManualVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of the OTP code.');
      return;
    }
    void triggerOtpVerification(fullOtp);
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-8 bg-[#0a0f0d]">
      <div className="w-full max-w-md bg-[#121a16] border border-[#1e2d26] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">

        {/* AgriMark Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3.5 bg-emerald-950/80 border border-emerald-800/60 rounded-2xl shadow-inner text-emerald-400">
            <Sprout className="w-8 h-8 text-emerald-400 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">AgriMark</h1>
          <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
            Quick Agriculture & Fresh Delivery
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-3.5 bg-red-950/70 border border-red-800/70 rounded-2xl text-red-200 text-xs flex items-start gap-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {step === 'phone' ? (
          /* ==================================================
             STEP 1: ENTER MOBILE NUMBER
             ================================================== */
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Welcome to AgriMark</h2>
              <p className="text-xs text-gray-400">Enter your mobile number to continue</p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase text-gray-400">
                Mobile Number
              </label>
              <div className="flex items-center gap-2">
                {/* India Country Code Badge */}
                <div className="flex items-center gap-1.5 px-3.5 py-3.5 bg-[#0a0f0d] border border-[#1e2d26] rounded-2xl text-emerald-400 font-extrabold text-sm select-none shrink-0 shadow-inner">
                  <span className="text-base">🇮🇳</span>
                  <span>+91</span>
                </div>

                {/* 10-Digit Mobile Input */}
                <div className="relative flex-1">
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    autoComplete="tel-national"
                    required
                    value={phoneNumber}
                    onChange={handlePhoneInputChange}
                    className={`w-full px-4 py-3.5 bg-[#0a0f0d] border ${
                      inlinePhoneError ? 'border-red-500/80' : isPhoneValid ? 'border-emerald-500' : 'border-[#1e2d26]'
                    } rounded-2xl text-white font-bold text-base focus:outline-none focus:border-emerald-500 transition tracking-wider`}
                    placeholder="98765 43210"
                    autoFocus
                  />
                  {isPhoneValid && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 absolute right-3.5 top-3.5" />
                  )}
                </div>
              </div>

              {inlinePhoneError && (
                <p className="text-[11px] text-red-400 font-medium pl-1">{inlinePhoneError}</p>
              )}
            </div>

            {/* Continue CTA Button */}
            <button
              type="submit"
              disabled={loading || !isPhoneValid}
              className="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-950/80 disabled:text-gray-500 text-white font-extrabold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm"
            >
              <span>{loading ? 'Sending OTP...' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-[11px] text-gray-500 leading-relaxed">
              By continuing, you agree to AgriMark&apos;s{' '}
              <Link href="/terms" className="text-emerald-400 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-emerald-400 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </form>
        ) : (
          /* ==================================================
             STEP 2: OTP VERIFICATION SCREEN
             ================================================== */
          <form onSubmit={handleManualVerify} className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setError('');
                }}
                className="p-2 text-gray-400 hover:text-white bg-[#0a0f0d] border border-[#1e2d26] rounded-xl transition"
                title="Back to Mobile Input"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/40 px-3 py-1 rounded-full">
                Step 2 of 2
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Verify your mobile number</h2>
              <p className="text-xs text-gray-400">
                Enter the 6-digit code sent to <strong className="text-emerald-400">{formattedPhoneDisplay}</strong>
              </p>
            </div>

            {/* Change Mobile Action */}
            <div className="flex justify-start">
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setError('');
                }}
                className="text-xs text-emerald-400 hover:underline font-semibold flex items-center gap-1"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Change mobile number</span>
              </button>
            </div>

            {/* 6 OTP Boxes */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase text-gray-400 text-center">
                Enter 6-Digit OTP
              </label>
              <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    autoComplete="one-time-code"
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    className="w-11 h-13 sm:w-12 sm:h-14 bg-[#0a0f0d] border border-[#1e2d26] focus:border-emerald-500 rounded-2xl text-center text-xl font-extrabold text-white shadow-inner focus:outline-none transition"
                  />
                ))}
              </div>
            </div>

            {/* Verify & Continue CTA */}
            <button
              type="submit"
              disabled={loading || otpDigits.join('').length !== 6}
              className="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-950/80 disabled:text-gray-500 text-white font-extrabold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <span>Verifying Code...</span>
              ) : (
                <>
                  <span>Verify &amp; Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* 60s Resend Timer */}
            <div className="text-center text-xs text-gray-400 pt-1">
              <span>Didn&apos;t receive the OTP? </span>
              {resendTimer > 0 ? (
                <span className="text-emerald-400 font-mono font-bold">Resend code in {resendTimer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  disabled={loading}
                  className="text-emerald-400 hover:underline font-bold"
                >
                  Resend OTP Now
                </button>
              )}
            </div>
          </form>
        )}

        {/* Trust Footer */}
        <div className="pt-4 border-t border-[#1e2d26]/60 text-center text-[11px] text-gray-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>Secured by Supabase Auth &amp; AgriMark Encryption</span>
        </div>
      </div>
    </div>
  );
}
