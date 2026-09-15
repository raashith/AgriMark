import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { PRODUCTION_SITE_URL, SUPABASE_EXPECTED_HOST, getRoleDashboard } from '@/lib/auth-config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || PRODUCTION_SITE_URL;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || `https://${SUPABASE_EXPECTED_HOST}`;

function applyNoCacheHeaders(res: NextResponse): NextResponse {
  res.headers.set('Cache-Control', 'private, no-store, no-cache, must-revalidate');
  res.headers.set('Pragma', 'no-cache');
  res.headers.set('Expires', '0');
  return res;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const flowId = requestUrl.searchParams.get('sb_flow_id') || requestUrl.searchParams.get('flow_id');
  const error = requestUrl.searchParams.get('error');
  const errorCode = requestUrl.searchParams.get('error_code') || 'unknown';
  const errorDescription = requestUrl.searchParams.get('error_description');

  const rawNext = requestUrl.searchParams.get('next');
  const sanitizedNext = rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') && rawNext !== '/auth/login'
    ? rawNext
    : null;

  const isLocalhost = requestUrl.origin.includes('localhost') || requestUrl.origin.includes('127.0.0.1');
  const baseUrl = isLocalhost ? requestUrl.origin : SITE_URL;

  // Handle provider/OAuth errors returned directly in searchParams
  if (error || errorDescription) {
    console.error('[AgriMark Auth Callback] OAuth provider error received:', {
      error,
      errorCode,
      errorDescription,
      hasCode: Boolean(code),
      hasFlowId: Boolean(flowId),
    });

    const loginUrl = new URL('/auth/login', baseUrl);
    let userMsg = 'Google Sign-In couldn\'t be completed. Please try again.';
    if (error === 'access_denied') {
      userMsg = 'Sign-in cancelled. Please try signing in again.';
    } else if (errorCode === 'unexpected_failure' || error === 'server_error') {
      userMsg = 'Google authentication server encountered an issue. Please try again in a moment.';
    }
    loginUrl.searchParams.set('error', userMsg);
    return applyNoCacheHeaders(NextResponse.redirect(loginUrl));
  }

  if (!code) {
    console.error('[AgriMark Auth Callback] Missing authorization code in query.');
    const loginUrl = new URL('/auth/login', baseUrl);
    loginUrl.searchParams.set('error', 'Google Sign-In couldn\'t be completed. Missing auth code.');
    return applyNoCacheHeaders(NextResponse.redirect(loginUrl));
  }

  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseKey) {
    console.error('[AgriMark Auth Callback] Missing Supabase Publishable Key.');
    const loginUrl = new URL('/auth/login', baseUrl);
    loginUrl.searchParams.set('error', 'AgriMark authentication configuration is incomplete.');
    return applyNoCacheHeaders(NextResponse.redirect(loginUrl));
  }

  // Target path placeholder - defaults to farmer dashboard
  let targetPath = '/farmer/dashboard';
  let response = NextResponse.redirect(new URL(targetPath, baseUrl));

  const supabase = createServerClient(SUPABASE_URL, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          try {
            request.cookies.set(name, value);
          } catch {}
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            response.cookies.set(name, value, options);
          } catch {}
        });
      },
    },
  });

  // Perform PKCE code exchange with optional flowId
  const exchangeOptions = flowId ? { flowId } : undefined;
  const exchangeResult = await supabase.auth.exchangeCodeForSession(code, exchangeOptions);

  if (exchangeResult.error) {
    const cookieNames = request.cookies.getAll().map((c) => c.name);
    const hasCodeVerifierCookie = cookieNames.some((name) => name.includes('code-verifier'));

    console.error('[AgriMark Auth Callback] exchangeCodeForSession failed:', {
      errorName: exchangeResult.error.name,
      status: (exchangeResult.error as any).status || 400,
      message: exchangeResult.error.message,
      hasCode: Boolean(code),
      hasFlowId: Boolean(flowId),
      hasCodeVerifierCookie,
      cookieCount: cookieNames.length,
    });

    // Re-check session in case code was already exchanged by a concurrent/retry request
    const { data: recheckData } = await supabase.auth.getSession();
    if (!recheckData?.session) {
      const loginUrl = new URL('/auth/login', baseUrl);
      const errMsg = (exchangeResult.error.message || '').toLowerCase();
      const userMsg = errMsg.includes('expired') || errMsg.includes('4/0a') || errMsg.includes('already used') || errMsg.includes('invalid_grant')
        ? 'Your sign-in session expired. Please start Google Sign-In again.'
        : 'Google Sign-In couldn\'t be completed. Please try again.';
      loginUrl.searchParams.set('error', userMsg);
      return applyNoCacheHeaders(NextResponse.redirect(loginUrl));
    }
  }

  // Session established. Resolve user profile & target route.
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    if (sanitizedNext) {
      targetPath = sanitizedNext;
    } else {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.role) {
          targetPath = getRoleDashboard(profile.role);
        } else {
          targetPath = '/auth/onboarding';
        }
      } catch (pErr) {
        console.error('[AgriMark Auth Callback] Failed to fetch profile role:', pErr);
        targetPath = '/auth/onboarding';
      }
    }
  } else {
    console.error('[AgriMark Auth Callback] getUser() returned null after code exchange.');
    const loginUrl = new URL('/auth/login', baseUrl);
    loginUrl.searchParams.set('error', 'Authentication succeeded, but session user could not be retrieved.');
    return applyNoCacheHeaders(NextResponse.redirect(loginUrl));
  }

  // Set final target location and no-cache headers on redirect response
  response.headers.set('Location', new URL(targetPath, baseUrl).toString());
  return applyNoCacheHeaders(response);
}
