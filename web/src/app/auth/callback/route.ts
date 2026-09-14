import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://agrimark-six.vercel.app';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xrcqzpnstdbbtafhcwbb.supabase.co';

function getSafeNext(value: string | null): string {
  if (value && value.startsWith('/') && !value.startsWith('//')) return value;
  return '/auth/login';
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const flowId = requestUrl.searchParams.get('sb_flow_id');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  const rawNext = requestUrl.searchParams.get('next');
  const nextRoute = getSafeNext(rawNext);

  const isLocalhost = requestUrl.origin.includes('localhost') || requestUrl.origin.includes('127.0.0.1');
  const baseUrl = isLocalhost ? requestUrl.origin : SITE_URL;

  if (error || errorDescription) {
    const loginUrl = new URL('/auth/login', baseUrl);
    loginUrl.searchParams.set('error', 'Google Sign-In couldn\'t be completed. Please try again.');
    return NextResponse.redirect(loginUrl);
  }

  if (!code) {
    const loginUrl = new URL('/auth/login', baseUrl);
    loginUrl.searchParams.set('error', 'Google Sign-In couldn\'t be completed. Please try again.');
    return NextResponse.redirect(loginUrl);
  }

  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseKey) {
    const loginUrl = new URL('/auth/login', baseUrl);
    loginUrl.searchParams.set('error', 'Google Sign-In couldn\'t be completed. Please try again.');
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.redirect(new URL(nextRoute, baseUrl));
  const supabase = createServerClient(SUPABASE_URL, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Guard against duplicate code exchange if session is already established
  const { data: existingSessionData } = await supabase.auth.getSession();
  if (!existingSessionData?.session && code) {
    const exchangeResult = flowId
      ? await supabase.auth.exchangeCodeForSession(code, { flowId })
      : await supabase.auth.exchangeCodeForSession(code);

    if (exchangeResult.error) {
      const { data: recheckData } = await supabase.auth.getSession();
      if (!recheckData?.session) {
        const loginUrl = new URL('/auth/login', baseUrl);
        const errMsg = (exchangeResult.error.message || '').toLowerCase();
        const userMsg = errMsg.includes('expired') || errMsg.includes('4/0a') || errMsg.includes('already used') || errMsg.includes('invalid_grant')
          ? 'Your sign-in session expired. Please start Google Sign-In again.'
          : 'Google Sign-In couldn\'t be completed. Please try again.';
        loginUrl.searchParams.set('error', userMsg);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  return response;
}
