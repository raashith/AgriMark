import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_WEATHER_URL =
  (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://agrimark-api.onrender.com/api/v1').replace(/\/$/, '') +
  '/weather/current';

function toNumber(value: string | null, name: string): number | null {
  if (value === null || value.trim() === '') return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`Invalid ${name}`);
  return parsed;
}

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const latitude = toNumber(searchParams.get('latitude'), 'latitude');
    const longitude = toNumber(searchParams.get('longitude'), 'longitude');

    if (latitude === null || longitude === null) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          meta: {
            data_origin: 'INPUT_REQUIRED',
            message: 'latitude and longitude are required for live weather observations.',
          },
        },
        { status: 400 },
      );
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { success: false, data: null, meta: { data_origin: 'INVALID_INPUT', message: 'Coordinates are outside valid WGS84 ranges.' } },
        { status: 400 },
      );
    }

    const url = new URL(BACKEND_WEATHER_URL);
    url.searchParams.set('latitude', String(latitude));
    url.searchParams.set('longitude', String(longitude));

    const response = await fetch(url.toString(), {
      cache: 'no-store',
      headers: { accept: 'application/json' },
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          meta: {
            data_origin: 'AGRIMARK_BACKEND',
            message:
              payload && typeof payload === 'object' && 'detail' in payload
                ? String((payload as { detail?: unknown }).detail)
                : `Weather backend returned HTTP ${response.status}.`,
          },
        },
        { status: response.status >= 500 ? 502 : response.status },
      );
    }

    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        meta: {
          data_origin: 'AGRIMARK_BACKEND',
          message: error instanceof Error ? error.message : 'Live weather request failed.',
        },
      },
      { status: 502 },
    );
  }
}
