import { NextResponse } from 'next/server';
import { createClimateAlert, ClimateAlert } from '@/lib/climate-response-workflows';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get('region') || 'Salem';

  const alert: ClimateAlert = {
    id: `alert_demo_1`,
    region,
    hazard_type: 'HEAT_WAVE',
    alert_level: 'WARNING',
    time_window_start: new Date().toISOString(),
    time_window_end: new Date(Date.now() + 3 * 86400 * 1000).toISOString(),
    source: 'IMD_AGROMET_MODELS',
    confidence: 0.91,
    evidence: [`Forecast peak temperatures of 39.5°C in ${region}`, 'Soil moisture deficit 18.5%'],
    recommended_actions: ['Schedule night irrigation drip pulses', 'Apply organic straw mulch'],
    created_at: new Date().toISOString()
  };

  return NextResponse.json({ success: true, data: [alert] });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const alert = await createClimateAlert(body);
    return NextResponse.json({ success: true, data: alert });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
