import { api } from './api';
import { supabase, logSupabaseDiagnostic } from './supabase';
import { normalizePhone, formatAuthError } from './auth';

export interface SendOtpResult {
  challenge_id: string;
  phone_e164: string;
  expires_at: string;
  resend_cooldown_seconds: number;
}

// In-memory challenge tracker for client session
let currentChallengeId: string | null = null;

export async function sendFirstPartyOtp(phone: string): Promise<SendOtpResult> {
  const normalized = normalizePhone(phone);

  try {
    const res = await api.sendOtp({ phone: normalized });
    if (res && res.challenge_id) {
      currentChallengeId = res.challenge_id;
      return {
        challenge_id: res.challenge_id,
        phone_e164: res.phone_e164 || normalized,
        expires_at: res.expires_at || new Date(Date.now() + 300000).toISOString(),
        resend_cooldown_seconds: res.resend_cooldown_seconds || 60,
      };
    }
  } catch (err: any) {
    const isNetworkError = err?.statusCode === 0 || err?.message === 'Failed to fetch' || err?.name === 'TypeError';
    if (!isNetworkError) {
      throw new Error(formatAuthError(err?.message || 'Failed to send OTP code.'));
    }
    console.warn('[AgriMark OTP] Primary API send failed, trying Supabase auth fallback:', err?.message);
  }

  // Fallback to Supabase Auth signInWithOtp
  const { error } = await supabase.auth.signInWithOtp({ phone: normalized });
  if (error) {
    logSupabaseDiagnostic('signInWithOtp', 'https://xrcqzpnstdbbtafhcwbb.supabase.co/auth/v1/otp', 400, error.message);
    throw new Error(formatAuthError(error.message));
  }

  const fallbackId = `sb_challenge_${Date.now()}`;
  currentChallengeId = fallbackId;
  return {
    challenge_id: fallbackId,
    phone_e164: normalized,
    expires_at: new Date(Date.now() + 300000).toISOString(),
    resend_cooldown_seconds: 60,
  };
}

export async function verifyFirstPartyOtp(
  phone: string,
  token: string,
  challengeId?: string
): Promise<any> {
  const normalized = normalizePhone(phone);
  const code = token.replace(/\D/g, '');
  if (!/^\d{6}$/.test(code)) throw new Error('Enter the 6-digit OTP.');

  const targetChallenge = challengeId || currentChallengeId || '';

  // 1. Try first-party API verification
  if (targetChallenge && !targetChallenge.startsWith('sb_challenge_')) {
    try {
      const res = await api.verifyOtp({
        challenge_id: targetChallenge,
        phone: normalized,
        otp: code,
      });
      if (res && res.user) {
        if (res.access_token && typeof window !== 'undefined') {
          localStorage.setItem('agrimark_token', res.access_token);
          localStorage.setItem('agrimark_user', JSON.stringify(res.user));
        }
        return res.user;
      }
    } catch (err: any) {
      // Re-throw authentication rejections (e.g. 400 bad request / incorrect OTP / expired)
      const isNetworkError = err?.statusCode === 0 || err?.message === 'Failed to fetch' || err?.name === 'TypeError';
      if (!isNetworkError) {
        throw new Error(formatAuthError(err?.message || 'OTP verification failed.'));
      }
      console.warn('[AgriMark OTP] Primary API unreachable, trying Supabase fallback:', err?.message);
    }
  }

  // 2. Supabase Auth verifyOtp fallback
  const { data, error } = await supabase.auth.verifyOtp({
    phone: normalized,
    token: code,
    type: 'sms',
  });

  if (error || !data.session?.access_token) {
    if (error) {
      logSupabaseDiagnostic('verifyOtp', 'https://xrcqzpnstdbbtafhcwbb.supabase.co/auth/v1/verify', 400, error.message);
    }
    throw new Error(formatAuthError(error?.message || 'OTP verification failed.'));
  }

  const profile = await api.getMe().catch(() => null);
  return profile || data.user;
}

export function getCurrentChallengeId(): string | null {
  return currentChallengeId;
}
