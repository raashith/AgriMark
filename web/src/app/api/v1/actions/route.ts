import { NextResponse } from 'next/server';
import { FarmerActionCenterEngine } from '@/lib/farmer-action-center';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestId = `req-${Date.now()}`;
  const { searchParams } = new URL(request.url);
  const farmerId = searchParams.get('farmer_id') || 'usr_f_tn_98231';

  const action = FarmerActionCenterEngine.triggerHeatStressIntelligenceLoop(farmerId, 'THANJAVUR', 0.82);

  return NextResponse.json({
    success: true,
    request_id: requestId,
    timestamp: new Date().toISOString(),
    data: [action]
  }, {
    headers: { 'X-Request-ID': requestId }
  });
}



