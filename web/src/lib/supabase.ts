import { createBrowserClient } from '@supabase/ssr';

const EXPECTED_SUPABASE_HOST = 'xrcqzpnstdbbtafhcwbb.supabase.co';
const EXPECTED_SUPABASE_URL = `https://${EXPECTED_SUPABASE_HOST}`;

function getValidSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (url && typeof url === 'string' && url.trim() === EXPECTED_SUPABASE_URL) {
    return EXPECTED_SUPABASE_URL;
  }
  return EXPECTED_SUPABASE_URL;
}

export function detectKeyType(key: string): string {
  if (!key) return 'none';
  if (key.startsWith('sb_publishable_')) return 'sb_publishable';
  if (key.startsWith('eyJ')) return 'legacy_anon';
  return 'unknown';
}

function getPublishableKey(): string {
  const pubKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (pubKey && typeof pubKey === 'string' && pubKey.trim()) return pubKey.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (anonKey && typeof anonKey === 'string' && anonKey.trim()) return anonKey.trim();
  return '';
}

export const SUPABASE_URL = getValidSupabaseUrl();
export const SUPABASE_PUBLISHABLE_KEY = getPublishableKey();
export const SUPABASE_AUTH_CONFIGURED = Boolean(SUPABASE_PUBLISHABLE_KEY);

let _supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
  if (!_supabaseClient) {
    _supabaseClient = createBrowserClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY || 'unconfigured_key',
      {
        auth: {
          flowType: 'pkce',
          detectSessionInUrl: typeof window !== 'undefined',
          autoRefreshToken: typeof window !== 'undefined',
          persistSession: typeof window !== 'undefined',
        },
      },
    );
  }
  return _supabaseClient;
}

export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get(_target, prop) {
    const client = getSupabaseClient() as any;
    const value = client[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

export function getSupabaseDiagnostic() {
  let supabaseHost = '';
  try { supabaseHost = new URL(SUPABASE_URL).hostname; } catch { supabaseHost = SUPABASE_URL; }
  const rawApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://agrimark-api.onrender.com/api/v1';
  let apiBaseHost = 'agrimark-api.onrender.com';
  try { apiBaseHost = new URL(rawApiUrl.includes('supabase.co') ? 'https://agrimark-api.onrender.com/api/v1' : rawApiUrl).hostname; } catch {}
  return {
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'dev',
    hasSupabaseUrl: Boolean(SUPABASE_URL),
    supabaseHost,
    keyType: detectKeyType(SUPABASE_PUBLISHABLE_KEY),
    hasAuthConfig: SUPABASE_AUTH_CONFIGURED,
    apiBaseHost,
  };
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
