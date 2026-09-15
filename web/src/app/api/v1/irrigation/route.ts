import { NextResponse } from 'next/server';
import { approveIrrigationRecommendation } from '@/lib/irrigation-control-engine';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recommendation_id, farmer_id, device_id, params } = body;

    const res = await approveIrrigationRecommendation(
      recommendation_id || 'rec_irr_001',
      farmer_id || 'usr_f_sample',
      device_id || 'dev_irr_ctrl_01',
      params || { duration_sec: 3600, water_liters: 12500 }
    );

    return NextResponse.json({ success: true, data: res });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}



