import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const SITE_URL = 'https://agrimark-six.vercel.app';
const SUPABASE_URL = 'https://xrcqzpnstdbbtafhcwbb.supabase.co';

function safeNext(value: string | null): string {
  if (value && value.startsWith('/') && !value.startsWith('//')) return value;
  return '/';
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');
  const next = safeNext(url.searchParams.get('next'));

  if (error || errorDescription) {
    const loginUrl = new URL('/auth/login', SITE_URL);
    loginUrl.searchParams.set('error', errorDescription || error || 'oauth_error');
    return NextResponse.redirect(loginUrl);
  }

  if (!code) {
    const loginUrl = new URL('/auth/login', SITE_URL);
    loginUrl.searchParams.set('error', 'oauth_callback_failed');
    return NextResponse.redirect(loginUrl);
  }

  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseKey) {
    const loginUrl = new URL('/auth/login', SITE_URL);
    loginUrl.searchParams.set('error', 'oauth_configuration_failed');
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.redirect(new URL(next, SITE_URL));
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

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    const loginUrl = new URL('/auth/login', SITE_URL);
    loginUrl.searchParams.set('error', 'oauth_code_exchange_failed');
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
