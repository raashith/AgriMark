import { NextRequest, NextResponse } from 'next/server';
import { PRODUCTION_AUTH_CALLBACK, PRODUCTION_SITE_URL, SUPABASE_EXPECTED_HOST } from '@/lib/auth-config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || PRODUCTION_SITE_URL;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || `https://${SUPABASE_EXPECTED_HOST}`;

function getRoleDashboard(role?: string | null): string {
  switch (role) {
    case 'buyer':
      return '/buyer/marketplace';
    case 'admin':
      return '/admin/dashboard';
    case 'fpo':
      return '/fpo/dashboard';
    case 'logistics':
      return '/logistics/deliveries';
    case 'farmer':
    default:
      return '/farmer/dashboard';
  }
}

function getBaseUrl(requestUrl: URL): string {
  const isLocalhost = requestUrl.hostname === 'localhost' || requestUrl.hostname === '127.0.0.1';
  if (isLocalhost) return requestUrl.origin;
  return SITE_URL.replace(/\/$/, '');
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const baseUrl = getBaseUrl(requestUrl);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  const rawNext = requestUrl.searchParams.get('next');
  const sanitizedNext = rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') && rawNext !== '/auth/login'
    ? rawNext
    : null;

  const redirectToLogin = (message: string) => {
    const loginUrl = new URL('/auth/login', baseUrl);
    loginUrl.searchParams.set('error', message);
    return NextResponse.redirect(loginUrl);
  };

  if (error || errorDescription) {
    return redirectToLogin('Google Sign-In couldn\'t be completed. Please try again.');
  }

  // Browser-side createBrowserClient is configured with detectSessionInUrl: true.
  // Let Supabase Auth complete the PKCE exchange in the browser using its stored
  // verifier instead of attempting a second server-side exchange here.
  if (code) {
    const callbackUrl = new URL(PRODUCTION_AUTH_CALLBACK);
    if (sanitizedNext) callbackUrl.searchParams.set('next', sanitizedNext);

    const response = NextResponse.redirect(callbackUrl);
    response.headers.set('Cache-Control', 'private, no-store');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }

  return redirectToLogin('Google Sign-In couldn\'t be completed. Please try again.');
}
