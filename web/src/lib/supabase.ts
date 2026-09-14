import { createClient } from '@supabase/supabase-js';

const EXPECTED_SUPABASE_REF = 'xrcqzpnstdbbtafhcwbb';
const EXPECTED_SUPABASE_HOST = 'xrcqzpnstdbbtafhcwbb.supabase.co';
const EXPECTED_SUPABASE_URL = `https://${EXPECTED_SUPABASE_HOST}`;
const FALLBACK_PUBLISHABLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyY3F6cG5zdGRiYnRhZmhjd2JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMTIwMDAsImV4cCI6MjA1Njg4ODAwMH0.dummy_publishable_key';

function getValidSupabaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!envUrl) return EXPECTED_SUPABASE_URL;
  try {
    const parsed = new URL(envUrl);
    if (parsed.hostname.includes('tsd') || !parsed.hostname.includes(EXPECTED_SUPABASE_REF)) {
      return EXPECTED_SUPABASE_URL;
    }
    return envUrl;
  } catch {
    return EXPECTED_SUPABASE_URL;
  }
}

function getValidPublishableKey(): string {
  const envKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!envKey) return FALLBACK_PUBLISHABLE_KEY;

  try {
    const parts = envKey.split('.');
    if (parts.length === 3) {
      const payloadStr = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(payloadStr);
      if (payload.ref && payload.ref !== EXPECTED_SUPABASE_REF) {
        return FALLBACK_PUBLISHABLE_KEY;
      }
    }
  } catch {
    return FALLBACK_PUBLISHABLE_KEY;
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
    apiBaseHost,
  };
}

