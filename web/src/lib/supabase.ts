import { createBrowserClient } from '@supabase/ssr';

const EXPECTED_SUPABASE_HOST = 'xrcqzpnstdbbtafhcwbb.supabase.co';
const EXPECTED_SUPABASE_URL = `https://${EXPECTED_SUPABASE_HOST}`;

function getValidSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() === EXPECTED_SUPABASE_URL
    ? EXPECTED_SUPABASE_URL
    : EXPECTED_SUPABASE_URL;
}

export function detectKeyType(key: string): string {
  if (!key) return 'none';
  if (key.startsWith('sb_publishable_')) return 'sb_publishable';
  if (key.startsWith('eyJ')) return 'legacy_anon';
  return 'unknown';
}

function getPublishableKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';
}

export const SUPABASE_URL = getValidSupabaseUrl();
export const SUPABASE_PUBLISHABLE_KEY = getPublishableKey();
export const SUPABASE_AUTH_CONFIGURED = Boolean(SUPABASE_PUBLISHABLE_KEY);

export const supabase = createBrowserClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY || 'unconfigured_key',
  {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: true,
      autoRefreshToken: true,
      persistSession: true,
    },
  },
);

export function getSupabaseDiagnostic() {
  let supabaseHost = '';
  try { supabaseHost = new URL(SUPABASE_URL).hostname; } catch { supabaseHost = SUPABASE_URL; }
  const rawApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://agrimark-api.onrender.com/api/v1';
  let apiBaseHost = 'agrimark-api.onrender.com';
  try { apiBaseHost = new URL(rawApiUrl.includes('supabase.co') ? 'https://agrimark-api.onrender.com/api/v1' : rawApiUrl).hostname; } catch {}
  return { hasSupabaseUrl: Boolean(SUPABASE_URL), supabaseHost, keyType: detectKeyType(SUPABASE_PUBLISHABLE_KEY), hasAuthConfig: SUPABASE_AUTH_CONFIGURED, apiBaseHost };
}

export function logSupabaseDiagnostic(action: string, url: string, status: number, errorCode?: string) {
  if (typeof window === 'undefined') return;
  try {
    const parsed = new URL(url);
    console.error(`[AgriMark Auth Diagnostic] ${action} failed`, {
      endpointHost: parsed.hostname,
      endpointPath: parsed.pathname,
      status,
      errorCode: errorCode || 'unknown',
      keyType: detectKeyType(SUPABASE_PUBLISHABLE_KEY),
      hasApiKey: Boolean(SUPABASE_PUBLISHABLE_KEY),
      hasAuthorization: Boolean(localStorage.getItem('agrimark_token')),
    });
  } catch {}
}
