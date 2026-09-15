import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { PRODUCTION_SITE_URL, SUPABASE_EXPECTED_HOST } from '@/lib/auth-config';

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
  const flowId = requestUrl.searchParams.get('sb_flow_id');
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

  if (!code) {
    return redirectToLogin('Google Sign-In couldn\'t be completed. Please try again.');
  }

  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseKey) {
    return redirectToLogin('Google Sign-In couldn\'t be completed. Please try again.');
  }

  const response = NextResponse.redirect(new URL('/farmer/dashboard', baseUrl));
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  const supabase = createServerClient(SUPABASE_URL, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        if (headers) {
          for (const [name, value] of Object.entries(headers)) {
            response.headers.set(name, value);
          }
        }
      },
    },
  });

  const exchangeResult = flowId
    ? await supabase.auth.exchangeCodeForSession(code, { flowId })
    : await supabase.auth.exchangeCodeForSession(code);

  if (exchangeResult.error) {
    const { data: recheckData } = await supabase.auth.getSession();
    if (!recheckData?.session) {
      const errMsg = (exchangeResult.error.message || '').toLowerCase();
      const userMsg = errMsg.includes('expired') || errMsg.includes('4/0a') || errMsg.includes('already used') || errMsg.includes('invalid_grant')
        ? 'Your sign-in session expired. Please start Google Sign-In again.'
        : 'Google Sign-In couldn\'t be completed. Please try again.';
      return redirectToLogin(userMsg);
    }
  }

  const { data: { user } } = await supabase.auth.getUser();
  let targetPath = '/farmer/dashboard';

  if (user) {
    if (sanitizedNext) {
      targetPath = sanitizedNext;
    } else {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
      targetPath = profile?.role ? getRoleDashboard(profile.role) : '/auth/onboarding';
    }
  }

  response.headers.set('Location', new URL(targetPath, baseUrl).toString());
  return response;
}
