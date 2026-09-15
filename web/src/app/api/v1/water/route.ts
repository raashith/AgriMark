import { NextResponse } from 'next/server';
import { computeWaterIntelligence, generateIrrigationRecommendation } from '@/lib/water-intelligence-engine';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const farmId = searchParams.get('farm_id') || 'FARM_DEMO_1';
  const fieldId = searchParams.get('field_id') || 'FIELD_NORTH_1';
  const isSynthetic = searchParams.get('synthetic') === 'true';

  const analytics = await computeWaterIntelligence(farmId, fieldId, isSynthetic);
  const recommendation = await generateIrrigationRecommendation(fieldId);

  return NextResponse.json({
    success: true,
    data: {
      water_analytics: analytics,
      recommendation: recommendation
    }
  });
}



