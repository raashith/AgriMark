export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { calculateFarmEmissions } from '@/lib/emissions-foundation-engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const farmId = searchParams.get('farm_id') || 'FARM_DEMO_1';
  const isSynthetic = searchParams.get('synthetic') === 'true';

  const profile = await calculateFarmEmissions(farmId, [], 4200, isSynthetic);
  return NextResponse.json({
    success: true,
    data: profile,
    meta: {
      disclaimer: 'Emissions estimates are decision-support baselines using IPCC Tier 2 methodology. Verified carbon offset credits are not claimed.'
    }
  });
}

