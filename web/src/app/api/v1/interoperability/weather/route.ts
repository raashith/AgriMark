import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

function toNumber(value: string | null, name: string): number | null {
  if (value === null || value.trim() === '') return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`Invalid ${name}`); 
  return parsed;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
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

    const url = new URL(OPEN_METEO_URL);
    url.searchParams.set('latitude', String(latitude));
    url.searchParams.set('longitude', String(longitude));
    url.searchParams.set(
      'current',
      [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'precipitation',
        'rain',
        'weather_code',
        'cloud_cover',
        'pressure_msl',
        'wind_speed_10m',
        'wind_direction_10m',
        'wind_gusts_10m',
      ].join(','),
    );
    url.searchParams.set('timezone', 'auto');

    const response = await fetch(url.toString(), {
      cache: 'no-store',
      headers: { accept: 'application/json' },
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          meta: {
            data_origin: 'OPEN_METEO',
            message: `Live weather provider returned HTTP ${response.status}.`,
          },
        },
        { status: 502 },
      );
    }

    const weather = await response.json();

    return NextResponse.json(
      {
        success: true,
        data: {
          latitude: weather.latitude,
          longitude: weather.longitude,
          timezone: weather.timezone,
          elevation_m: weather.elevation,
          current: weather.current,
          current_units: weather.current_units,
        },
        meta: {
          data_origin: 'OPEN_METEO',
          provider: 'Open-Meteo',
          observed_at: weather.current?.time ?? null,
          freshness: 'provider_current',
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        meta: {
          data_origin: 'OPEN_METEO',
          message: error instanceof Error ? error.message : 'Live weather request failed.',
        },
      },
      { status: 502 },
    );
  }
}
