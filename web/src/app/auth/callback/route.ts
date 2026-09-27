import { NextRequest, NextResponse } from 'next/server';
import { PRODUCTION_SITE_URL } from '@/lib/auth-config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SITE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL &&
    typeof process.env.NEXT_PUBLIC_SITE_URL === 'string' &&
    process.env.NEXT_PUBLIC_SITE_URL.trim()) ||
  PRODUCTION_SITE_URL;

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const isLocalhost =
    requestUrl.origin.includes('localhost') || requestUrl.origin.includes('127.0.0.1');
  const baseUrl = isLocalhost ? requestUrl.origin : SITE_URL;

  const loginUrl = new URL('/auth/login', baseUrl);
  const response = NextResponse.redirect(loginUrl);
  response.headers.set('Cache-Control', 'private, no-store, no-cache, must-revalidate');
  return response;
}
