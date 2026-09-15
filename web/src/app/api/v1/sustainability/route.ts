import { NextResponse } from 'next/server';
import { computeSustainabilityMetrics } from '@/lib/sustainability-metrics-engine';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const farmId = searchParams.get('farm_id') || 'FARM_DEMO_1';

  const metrics = await computeSustainabilityMetrics(farmId);
  return NextResponse.json({
    success: true,
    data: metrics,
    meta: {
      provenance_tracked: true,
      opaque_single_score_prohibited: 'All 7 component metrics are explicitly exposed.'
    }
  });
}



