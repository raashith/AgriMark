export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { WeatherClimateEngine } from '@/lib/weather-climate-engine';

export async function GET(request: Request) {
  const requestId = `req-${Date.now()}`;
  const { searchParams } = new URL(request.url);
  const districtCode = searchParams.get('district_code') || 'THANJAVUR';
  const stateCode = searchParams.get('state_code') || 'TN';
  const periodStart = searchParams.get('period_start') || '2026-06-01';
  const periodEnd = searchParams.get('period_end') || '2026-08-31';

  const climateIndex = WeatherClimateEngine.calculateClimateIndices(
    districtCode,
    stateCode,
    periodStart,
    periodEnd,
    420, // Observed rainfall
    380, // Normal rainfall
    29.8,// Observed temp
    28.5,// Normal temp
    0.26 // Soil moisture
  );

  return NextResponse.json({
    success: true,
    request_id: requestId,
    timestamp: new Date().toISOString(),
    data: climateIndex
  }, {
    headers: { 'X-Request-ID': requestId }
  });
}

