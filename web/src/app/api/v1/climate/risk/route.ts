import { NextResponse } from 'next/server';
import { computeClimateRisk } from '@/lib/climate-risk-engine';
export const dynamic = 'force-dynamic';


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const farmId = searchParams.get('farm_id') || 'FARM_DEMO_1';
  const district = searchParams.get('district') || 'Salem';
  const isSynthetic = searchParams.get('synthetic') === 'true';

  const risks = await computeClimateRisk({ farm_id: farmId, district, is_synthetic: isSynthetic });
  return NextResponse.json({
    success: true,
    data: risks,
    meta: {
      farm_id: farmId,
      privacy_notice: 'Farm exact coordinates sanitized for privacy',
      data_origin: isSynthetic ? 'SYNTHETIC' : 'agrimark_climate_engine'
    }
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const risks = await computeClimateRisk(body);
    return NextResponse.json({ success: true, data: risks });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

