import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { PRODUCTION_SITE_URL, SUPABASE_EXPECTED_HOST } from '@/lib/auth-config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || PRODUCTION_SITE_URL).replace(/\/$/, '');
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || `https://${SUPABASE_EXPECTED_HOST}`;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getRoleDashboard(role?: string | null): string {
  switch (role) {
    case 'buyer': return '/buyer/marketplace';
    case 'admin': return '/admin/dashboard';
    case 'fpo': return '/fpo/dashboard';
    case 'logistics': return '/logistics/deliveries';
    case 'farmer':
    default: return '/farmer/dashboard';
  }
}

function getLocalRedirect(rawNext: string | null): string | null {
  return rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') && rawNext !== '/auth/login'
    ? rawNext
    : null;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const flowId = requestUrl.searchParams.get('sb_flow_id');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  const next = getLocalRedirect(requestUrl.searchParams.get('next'));

  const loginUrl = () => {
    const url = new URL('/auth/login', SITE_URL);
    url.searchParams.set('error', 'Google Sign-In couldn\'t be completed. Please try again.');
    return url;
  };

  if (error || errorDescription || !code || !SUPABASE_KEY) {
    return NextResponse.redirect(loginUrl());
  }

  const response = NextResponse.redirect(new URL(next || '/farmer/dashboard', SITE_URL));
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers || {}).forEach(([name, value]) => response.headers.set(name, value));
      },
    },
  });

  const { error: exchangeError } = flowId
    ? await supabase.auth.exchangeCodeForSession(code, { flowId })
    : await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error('[AgriMark OAuth callback] PKCE exchange failed', {
      name: exchangeError.name,
      status: exchangeError.status,
      code: exchangeError.code,
      message: exchangeError.message,
      hasFlowId: Boolean(flowId),
    });
    return NextResponse.redirect(loginUrl());
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('[AgriMark OAuth callback] Session established but user lookup failed', {
      name: userError?.name,
      status: userError?.status,
      code: userError?.code,
      message: userError?.message,
    });
    return NextResponse.redirect(loginUrl());
  }

  let targetPath = next;
  if (!targetPath) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('[AgriMark OAuth callback] Profile lookup failed', {
        code: profileError.code,
        message: profileError.message,
      });
    }
    targetPath = profile?.role ? getRoleDashboard(profile.role) : '/auth/onboarding';
  }

  response.headers.set('Location', new URL(targetPath, SITE_URL).toString());
  return response;
}
