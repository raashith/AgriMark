export const PRODUCTION_SITE_URL = 'https://agrimark-six.vercel.app';
export const PRODUCTION_AUTH_CALLBACK = `${PRODUCTION_SITE_URL}/auth/callback`;
export const SUPABASE_EXPECTED_HOST = 'xrcqzpnstdbbtafhcwbb.supabase.co';

export function normalizeAuthEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isEmail(value: string): boolean {
  return /\S+@\S+\.\S+/.test(value.trim());
}
