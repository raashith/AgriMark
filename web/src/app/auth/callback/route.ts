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

function generateCorrelationId(): string {
  const rand = Math.random().toString(36).substring(2, 9);
  const ts = Date.now().toString(36);
  return `req_${rand}_${ts}`;
}

export async function GET(request: NextRequest) {
  const correlationId = generateCorrelationId();
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const flowId = requestUrl.searchParams.get('sb_flow_id') || requestUrl.searchParams.get('flow_id');
  const providerError = requestUrl.searchParams.get('error');
  const errorCode = requestUrl.searchParams.get('error_code') || 'unknown';
  const errorDescription = requestUrl.searchParams.get('error_description');

  const rawNext = requestUrl.searchParams.get('next');
  const sanitizedNext = rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') && rawNext !== '/auth/login'
    ? rawNext
    : null;

  const isLocalhost = requestUrl.origin.includes('localhost') || requestUrl.origin.includes('127.0.0.1');
  const baseUrl = isLocalhost ? requestUrl.origin : SITE_URL;

  const cookieList = request.cookies.getAll();
  const cookieNames = cookieList.map((c) => c.name);
  const hasAuthTokenCookie = cookieNames.some((n) => n.includes('auth-token'));
  const hasCodeVerifierCookie = cookieNames.some((n) => n.includes('code-verifier'));

  console.log(`[AgriMark Auth Callback] [${correlationId}] Received callback request`, {
    correlationId,
    hasCode: Boolean(code),
    hasFlowId: Boolean(flowId),
    hasProviderError: Boolean(providerError || errorDescription),
    providerError: providerError || 'none',
    errorCode,
    hasAuthTokenCookie,
    hasCodeVerifierCookie,
    cookieCount: cookieList.length,
    origin: requestUrl.origin,
  });

  // Handle provider/OAuth errors returned directly in searchParams (e.g. server_error from Supabase/Google)
  if (providerError || errorDescription) {
    console.error(`[AgriMark Auth Callback] [${correlationId}] OAuth provider returned error parameters:`, {
      correlationId,
      providerError,
      errorCode,
      errorDescription,
      hasCode: Boolean(code),
      hasFlowId: Boolean(flowId),
    });

    const loginUrl = new URL('/auth/login', baseUrl);
    let userMsg = 'Google Sign-In couldn\'t be completed. Please try again.';
    if (providerError === 'access_denied') {
      userMsg = 'Sign-in was cancelled.';
    } else if (errorCode === 'unexpected_failure' || providerError === 'server_error') {
      userMsg = 'Google authentication server encountered an unexpected error. Check Supabase Google Client Secret & Client ID configuration.';
    }
    loginUrl.searchParams.set('error', userMsg);
    if (providerError) loginUrl.searchParams.set('provider_error', providerError);
    if (errorCode && errorCode !== 'unknown') loginUrl.searchParams.set('error_code', errorCode);
    loginUrl.searchParams.set('correlation_id', correlationId);

    return applyNoCacheHeaders(NextResponse.redirect(loginUrl));
  }

  if (!code) {
    console.error(`[AgriMark Auth Callback] [${correlationId}] Missing authorization code in query parameters.`);
    const loginUrl = new URL('/auth/login', baseUrl);
    loginUrl.searchParams.set('error', 'Google Sign-In couldn\'t be completed. Missing authorization code.');
    loginUrl.searchParams.set('correlation_id', correlationId);
    return applyNoCacheHeaders(NextResponse.redirect(loginUrl));
  }

  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseKey) {
    console.error(`[AgriMark Auth Callback] [${correlationId}] Missing Supabase Publishable/Anon Key.`);
    const loginUrl = new URL('/auth/login', baseUrl);
    loginUrl.searchParams.set('error', 'AgriMark authentication configuration is incomplete.');
    loginUrl.searchParams.set('correlation_id', correlationId);
    return applyNoCacheHeaders(NextResponse.redirect(loginUrl));
  }

  // Initial target path placeholder - defaults to farmer dashboard
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
  console.log(`[AgriMark Auth Callback] [${correlationId}] Starting exchangeCodeForSession`, {
    correlationId,
    hasFlowId: Boolean(flowId),
  });

  const exchangeResult = await supabase.auth.exchangeCodeForSession(code, exchangeOptions);

  if (exchangeResult.error) {
    console.error(`[AgriMark Auth Callback] [${correlationId}] exchangeCodeForSession failed:`, {
      correlationId,
      errorName: exchangeResult.error.name,
      status: (exchangeResult.error as any).status || 400,
      code: (exchangeResult.error as any).code || 'unknown',
      message: exchangeResult.error.message,
      hasCode: Boolean(code),
      hasFlowId: Boolean(flowId),
      hasCodeVerifierCookie,
    });

    // Re-check session in case code was already exchanged by a concurrent/retry request
    const { data: recheckData } = await supabase.auth.getSession();
    if (!recheckData?.session) {
      const loginUrl = new URL('/auth/login', baseUrl);
      const errMsg = (exchangeResult.error.message || '').toLowerCase();
      const userMsg = errMsg.includes('expired') || errMsg.includes('4/0a') || errMsg.includes('already used') || errMsg.includes('invalid_grant')
        ? 'Your sign-in session expired. Please start Google Sign-In again.'
        : 'Google Sign-In couldn\'t be completed. Session exchange failed.';
      loginUrl.searchParams.set('error', userMsg);
      if ((exchangeResult.error as any).code) {
        loginUrl.searchParams.set('error_code', (exchangeResult.error as any).code);
      }
      loginUrl.searchParams.set('correlation_id', correlationId);
      return applyNoCacheHeaders(NextResponse.redirect(loginUrl));
    } else {
      console.log(`[AgriMark Auth Callback] [${correlationId}] Exchange returned error but existing session verified.`);
    }
  } else {
    console.log(`[AgriMark Auth Callback] [${correlationId}] exchangeCodeForSession succeeded.`);
  }

  // Session established. Resolve user profile & target route.
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (user) {
    console.log(`[AgriMark Auth Callback] [${correlationId}] getUser succeeded:`, {
      correlationId,
      userId: user.id,
      email: user.email ? 'present' : 'missing',
    });

    if (sanitizedNext) {
      targetPath = sanitizedNext;
    } else {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error(`[AgriMark Auth Callback] [${correlationId}] Profile query error:`, {
            correlationId,
            errorMsg: profileError.message,
          });
        }

        if (profile?.role) {
          targetPath = getRoleDashboard(profile.role);
          console.log(`[AgriMark Auth Callback] [${correlationId}] Profile role resolved: ${profile.role} -> ${targetPath}`);
        } else {
          targetPath = '/auth/onboarding';
          console.log(`[AgriMark Auth Callback] [${correlationId}] No role profile found -> redirecting to onboarding`);
        }
      } catch (pErr) {
        console.error(`[AgriMark Auth Callback] [${correlationId}] Exception during profile lookup:`, pErr);
        targetPath = '/auth/onboarding';
      }
    }
  } else {
    console.error(`[AgriMark Auth Callback] [${correlationId}] getUser() returned null after code exchange:`, userError);
    const loginUrl = new URL('/auth/login', baseUrl);
    loginUrl.searchParams.set('error', 'Authentication succeeded, but session user could not be retrieved.');
    loginUrl.searchParams.set('correlation_id', correlationId);
    return applyNoCacheHeaders(NextResponse.redirect(loginUrl));
  }

  // Set final target location and no-cache headers on redirect response
  response.headers.set('Location', new URL(targetPath, baseUrl).toString());
  return applyNoCacheHeaders(response);
}
