import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_BASE_URL =
  (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://agrimark-api.onrender.com/api/v1').replace(/\/$/, '');

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const latitude = Number(searchParams.get('latitude'));
    const longitude = Number(searchParams.get('longitude'));

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) ||
        latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { success: false, data: null, meta: { data_origin: 'INVALID_INPUT', message: 'Valid latitude and longitude are required.' } },
        { status: 400 },
      );
    }

    const url = new URL(`${BACKEND_BASE_URL}/weather/forecast`);
    url.searchParams.set('latitude', String(latitude));
    url.searchParams.set('longitude', String(longitude));
    url.searchParams.set('days', '5');

    const response = await fetch(url.toString(), { cache: 'no-store', headers: { accept: 'application/json' } });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        { success: false, data: null, meta: { data_origin: 'AGRIMARK_BACKEND', message: payload?.detail || `Weather backend returned HTTP ${response.status}.` } },
        { status: response.status >= 500 ? 502 : response.status },
      );
    }

    return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, meta: { data_origin: 'AGRIMARK_BACKEND', message: error instanceof Error ? error.message : 'Live weather forecast failed.' } },
      { status: 502 },
    );
  }
}
