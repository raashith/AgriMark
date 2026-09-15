import { NextResponse } from 'next/server';
import { InsuranceIntelligenceEngine } from '@/lib/insurance-intelligence-engine';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestId = `req-${Date.now()}`;
  const { searchParams } = new URL(request.url);
  const farmId = searchParams.get('farm_id') || 'farm_tn_0982';

  const riskProfile = InsuranceIntelligenceEngine.evaluateInsuranceRisk({
    farm_id: farmId,
    commodity_code: 'RICE_PADDY',
    acreage_hectares: 1.85,
    state_code: 'TN',
    district_code: 'THANJAVUR',
    historical_yield_variance_percent: 12.5,
    drought_risk_index: 0.25,
    flood_risk_index: 0.65,
    heat_stress_index: 0.30,
    estimated_crop_value_inr: 165000
  });

  return NextResponse.json({
    success: true,
    request_id: requestId,
    timestamp: new Date().toISOString(),
    data: riskProfile
  }, {
    headers: { 'X-Request-ID': requestId }
  });
}



