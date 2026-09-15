import { NextResponse } from 'next/server';
import { ingestTelemetry, getDeviceTelemetry } from '@/lib/telemetry-ingestion-engine';
import { evaluateSensorQuality } from '@/lib/sensor-quality-engine';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get('device_id') || 'dev_soil_salem_01';

  const telemetry = await getDeviceTelemetry(deviceId);
  return NextResponse.json({ success: true, data: telemetry });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const telemetry = await ingestTelemetry(body);
    const quality = await evaluateSensorQuality(telemetry);

    return NextResponse.json({
      success: true,
      data: {
        telemetry,
        quality
      }
    });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}



