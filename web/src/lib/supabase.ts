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

function getValidSupabaseKey(): string {
  const preferred = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  const legacy = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  // Prefer the modern browser-safe publishable key, but accept the legacy anon
  // key during Supabase's migration period. Never fall back to a fabricated key.
  const candidates = [preferred, legacy].filter(Boolean) as string[];
  const valid = candidates.find((key) => {
    const isPublishable = key.startsWith('sb_publishable_');
    const isLegacyJwt = key.split('.').length === 3 && key.length > 100;
    return isPublishable || isLegacyJwt;
  });

  if (!valid) {
    throw new Error(
      'AgriMark Supabase configuration is missing or invalid. Configure NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (preferred) or NEXT_PUBLIC_SUPABASE_ANON_KEY for the canonical project.'
    );
  }

  if (valid.includes(EXPECTED_SUPABASE_REF)) return valid;
  if (valid.startsWith('sb_publishable_')) return valid;

  try {
    const payload = JSON.parse(Buffer.from(valid.split('.')[1], 'base64url').toString('utf8')) as { ref?: string };
    if (payload.ref && payload.ref !== EXPECTED_SUPABASE_REF) {
      throw new Error('AgriMark Supabase API key belongs to a different project.');
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('different project')) throw error;
    // A publishable key is intentionally not a JWT and cannot expose the ref.
  }

  return valid;
}

export const SUPABASE_URL = getValidSupabaseUrl();
export const SUPABASE_PUBLISHABLE_KEY = getValidSupabaseKey();

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
    publishableKeyPrefix: SUPABASE_PUBLISHABLE_KEY.startsWith('sb_publishable_')
      ? 'sb_publishable_'
      : 'legacy_anon_jwt',
    apiBaseHost,
  };
}
