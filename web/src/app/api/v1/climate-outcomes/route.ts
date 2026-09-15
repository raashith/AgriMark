import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const farmId = searchParams.get('farm_id') || 'FARM_DEMO_1';

  return NextResponse.json({
    success: true,
    data: [
      {
        id: `outcome_${farmId}`,
        farm_id: farmId,
        environmental_result: {
          water_saved_m3: 18.5,
          temp_mitigation_c: 3.2,
          soil_moisture_retained_pct: 28.0
        },
        economic_result_inr: 3600,
        confidence: 0.92,
        evidence_window: '30_DAYS',
        data_origin: 'agrimark_measured',
        measured_at: new Date().toISOString()
      }
    ]
  });
}
