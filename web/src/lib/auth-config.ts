export const PRODUCTION_SITE_URL = 'https://agrimark-six.vercel.app';
export const PRODUCTION_AUTH_CALLBACK = `${PRODUCTION_SITE_URL}/auth/callback`;

export const SUPABASE_EXPECTED_HOST = 'xrcqzpnstdbbtafhcwbb.supabase.co';
export const SUPABASE_GOOGLE_CALLBACK = `https://${SUPABASE_EXPECTED_HOST}/auth/v1/callback`;

export function getAuthCallbackUrl(): string {
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
      return `${window.location.origin}/auth/callback`;
    }
    return PRODUCTION_AUTH_CALLBACK;
  }
  return PRODUCTION_AUTH_CALLBACK;
}

export interface OAuthUrlDiagnostics {
  rawUrl: string;
  host: string;
  redirectUri: string | null;
  clientIdSuffix: string | null;
  scope: string | null;
  responseType: string | null;
  codeChallengeMethod: string | null;
  hasState: boolean;
  isValidGoogleHost: boolean;
  isCanonicalSupabaseCallback: boolean;
}

export function parseOAuthUrl(urlStr: string): OAuthUrlDiagnostics {
  try {
    const parsed = new URL(urlStr);
    const redirectUri = parsed.searchParams.get('redirect_uri');
    const clientId = parsed.searchParams.get('client_id');
    const scope = parsed.searchParams.get('scope');
    const responseType = parsed.searchParams.get('response_type');
    const codeChallengeMethod = parsed.searchParams.get('code_challenge_method');
    const hasState = Boolean(parsed.searchParams.get('state'));

    let clientIdSuffix: string | null = null;
    if (clientId) {
      clientIdSuffix = clientId.length > 10 ? `...${clientId.slice(-10)}` : clientId;
    }

    return {
      rawUrl: urlStr,
      host: parsed.hostname,
      redirectUri,
      clientIdSuffix,
      scope,
      responseType,
      codeChallengeMethod,
      hasState,
      isValidGoogleHost: parsed.hostname === 'accounts.google.com',
      isCanonicalSupabaseCallback: redirectUri === SUPABASE_GOOGLE_CALLBACK,
    };
  } catch {
    return {
      rawUrl: urlStr,
      host: 'invalid',
      redirectUri: null,
      clientIdSuffix: null,
      scope: null,
      responseType: null,
      codeChallengeMethod: null,
      hasState: false,
      isValidGoogleHost: false,
      isCanonicalSupabaseCallback: false,
    };
  }
}
