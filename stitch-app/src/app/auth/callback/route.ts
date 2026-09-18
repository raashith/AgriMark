import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://agrimark-stitch-web.onrender.com';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xrcqzpnstdbbtafhcwbb.supabase.co';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const flowId = requestUrl.searchParams.get('sb_flow_id');
  const error = requestUrl.searchParams.get('error');

  const baseUrl = requestUrl.origin.includes('localhost') ? requestUrl.origin : SITE_URL;

  if (error || !code) {
    const loginUrl = new URL('/login', baseUrl);
    loginUrl.searchParams.set('error', 'Google Sign-In was not completed.');
    return NextResponse.redirect(loginUrl);
  }

  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_dummy';
  const response = NextResponse.redirect(new URL('/dashboard', baseUrl));

  const supabase = createServerClient(SUPABASE_URL, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: any[]) {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const { data: existingSession } = await supabase.auth.getSession();
  if (!existingSession?.session && code) {
    if (flowId) {
      await supabase.auth.exchangeCodeForSession(code, { flowId });
    } else {
      await supabase.auth.exchangeCodeForSession(code);
    }
  }

  return response;
}
