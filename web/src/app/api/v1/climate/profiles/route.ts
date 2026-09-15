import { NextResponse } from 'next/server';
import { getFarmClimateProfile } from '@/lib/farm-climate-profile';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const farmId = searchParams.get('farm_id') || 'FARM_DEMO_1';

  const profile = await getFarmClimateProfile(farmId);
  return NextResponse.json({
    success: true,
    data: profile,
    meta: {
      location_protected: true,
      coordinate_precision: 'MASKED_DISTRICT_LEVEL'
    }
  });
}
