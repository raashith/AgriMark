import { createClient } from '@supabase/supabase-js';

const EXPECTED_SUPABASE_REF = 'xrcqzpnstdbbtafhcwbb';
const EXPECTED_SUPABASE_HOST = 'xrcqzpnstdbbtafhcwbb.supabase.co';
const EXPECTED_SUPABASE_URL = `https://${EXPECTED_SUPABASE_HOST}`;

function getValidSupabaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!envUrl) return EXPECTED_SUPABASE_URL;
  try {
    const parsed = new URL(envUrl);
    if (parsed.protocol !== 'https:' || parsed.hostname !== EXPECTED_SUPABASE_HOST) {
      return EXPECTED_SUPABASE_URL;
    }
    return EXPECTED_SUPABASE_URL;
  } catch {
    return EXPECTED_SUPABASE_URL;
  }
}

function getValidPublishableKey(): string {
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!envKey || !envKey.startsWith('sb_publishable_')) {
    throw new Error(
      'AgriMark Supabase configuration is invalid. Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to the publishable key from the canonical Supabase project.'
    );
  }
  return envKey;
}

export const SUPABASE_URL = getValidSupabaseUrl();
export const SUPABASE_PUBLISHABLE_KEY = getValidPublishableKey();

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export function getSupabaseDiagnostic() {
  let supabaseHost = '';
  try {
    supabaseHost = new URL(SUPABASE_URL).hostname;
  } catch {
    supabaseHost = SUPABASE_URL;
  }

  let apiBaseHost = '';
  try {
    const rawApiUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      'https://agrimark-api.onrender.com/api/v1';
    const cleanApiUrl = rawApiUrl.includes('supabase.co')
      ? 'https://agrimark-api.onrender.com/api/v1'
      : rawApiUrl;
    apiBaseHost = new URL(cleanApiUrl).hostname;
  } catch {
    apiBaseHost = 'agrimark-api.onrender.com';
  }

  return {
    hasSupabaseUrl: Boolean(SUPABASE_URL),
    supabaseHost,
    hasSupabasePublishableKey: Boolean(SUPABASE_PUBLISHABLE_KEY),
    publishableKeyPrefix: SUPABASE_PUBLISHABLE_KEY.slice(0, 14),
    apiBaseHost,
  };
}
