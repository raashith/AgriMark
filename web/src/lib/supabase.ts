import { createBrowserClient } from '@supabase/ssr';

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

export function detectKeyType(key: string): string {
  if (!key) return 'none';
  if (key.startsWith('sb_publishable_')) return 'sb_publishable';
  if (key.startsWith('eyJ')) return 'legacy_anon';
  return 'unknown';
}

function getValidPublishableKey(): string {
  const preferred = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  const legacy = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const candidates = [preferred, legacy].filter(Boolean) as string[];

  // Prefer the modern publishable key. Both this key and the legacy anon key are
  // safe to expose in a browser when backed by proper RLS policies.
  const publishable = candidates.find((key) => key.startsWith('sb_publishable_'));
  if (publishable) return publishable;

  const legacyJwt = candidates.find((key) => key.split('.').length === 3 && key.length > 50);
  if (legacyJwt) {
    try {
      const parts = legacyJwt.split('.');
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (payload.ref && payload.ref !== EXPECTED_SUPABASE_REF) return '';
      if (payload.iss && payload.iss !== 'supabase') return '';
    } catch {
      return '';
    }
    return legacyJwt;
  }

  return '';
}

export const SUPABASE_URL = getValidSupabaseUrl();
export const SUPABASE_PUBLISHABLE_KEY = getValidPublishableKey();
export const SUPABASE_AUTH_CONFIGURED = Boolean(SUPABASE_PUBLISHABLE_KEY);

export const supabase = createBrowserClient(
  SUPABASE_URL,
  // Keep the client constructible for SSR/build environments; auth operations
  // are guarded by SUPABASE_AUTH_CONFIGURED and fail with a clear message when
  // deployment variables have not been supplied.
  SUPABASE_PUBLISHABLE_KEY || 'unconfigured_key',
  {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: false,
      experimental: {
        appendPkceFlowIdToRedirects: true,
      },
    },
  },
);

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
    keyType: detectKeyType(SUPABASE_PUBLISHABLE_KEY),
    hasAuthConfig: SUPABASE_AUTH_CONFIGURED,
    apiBaseHost,
  };
}

export function logSupabaseDiagnostic(
  action: string,
  url: string,
  status: number,
  errorCode?: string,
) {
  if (typeof window !== 'undefined') {
    try {
      const parsedUrl = new URL(url);
      console.error(`[AgriMark Auth Diagnostic] ${action} failed`, {
        endpointHost: parsedUrl.hostname,
        endpointPath: parsedUrl.pathname,
        status,
        errorCode: errorCode || 'unknown',
        keyType: detectKeyType(SUPABASE_PUBLISHABLE_KEY),
        hasApiKey: Boolean(SUPABASE_PUBLISHABLE_KEY),
        hasAuthorization: Boolean(localStorage.getItem('agrimark_token')),
        authorizationType: localStorage.getItem('agrimark_token') ? 'Bearer' : 'none',
      });
    } catch {}
  }
}
