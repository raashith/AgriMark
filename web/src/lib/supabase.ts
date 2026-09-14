import { createBrowserClient } from '@supabase/ssr';

const EXPECTED_SUPABASE_REF = 'xrcqzpnstdbbtafhcwbb';
const EXPECTED_SUPABASE_HOST = 'xrcqzpnstdbbtafhcwbb.supabase.co';
const EXPECTED_SUPABASE_URL = `https://${EXPECTED_SUPABASE_HOST}`;

function getValidSupabaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!envUrl) return EXPECTED_SUPABASE_URL;
  try {
    const parsed = new URL(envUrl);
    if (parsed.protocol !== 'https:' || !parsed.hostname.includes(EXPECTED_SUPABASE_REF)) {
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
  const valid = candidates.find((key) => {
    const isPublishable = key.startsWith('sb_publishable_');
    const isLegacyJwt = key.split('.').length === 3 && key.length > 50;
    return isPublishable || isLegacyJwt;
  });

  if (!valid) return candidates[0] || '';
  if (valid.startsWith('sb_publishable_')) return valid;

  try {
    const parts = valid.split('.');
    if (parts.length === 3) {
      const payloadStr = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(payloadStr);
      if (payload.ref && payload.ref !== EXPECTED_SUPABASE_REF) return '';
    }
  } catch {}

  return valid;
}

export const SUPABASE_URL = getValidSupabaseUrl();
export const SUPABASE_PUBLISHABLE_KEY = getValidPublishableKey();

export const supabase = createBrowserClient(
  SUPABASE_URL,
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
    apiBaseHost,
  };
}

export function logSupabaseDiagnostic(
  action: string,
  url: string,
  status: number,
  errorCode?: string
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
