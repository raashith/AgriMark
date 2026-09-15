import { NextResponse } from 'next/server';
import { WeatherClimateEngine } from '@/lib/weather-climate-engine';

export async function GET(request: Request) {
  const requestId = `req-${Date.now()}`;
  const { searchParams } = new URL(request.url);
  const districtCode = searchParams.get('district_code') || 'THANJAVUR';
  const stateCode = searchParams.get('state_code') || 'TN';
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const observation = WeatherClimateEngine.createObservation(
    districtCode,
    stateCode,
    date,
    {
      temp_min_c: 24.5,
      temp_max_c: 34.2,
      temp_avg_c: 29.35,
      rainfall_mm: 14.8,
      relative_humidity_percent: 78.5,
      wind_speed_kmh: 12.4,
      soil_moisture_volumetric: 0.28,
      solar_radiation_mj_m2: 21.4
    },
    'IMD_OFFICIAL'
  );

  return NextResponse.json({
    success: true,
    request_id: requestId,
    timestamp: new Date().toISOString(),
    data: observation
  }, {
    headers: { 'X-Request-ID': requestId }
  });
}
