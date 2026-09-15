export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { FoodSecurityEngine } from '@/lib/food-security-engine';

export async function GET(request: Request) {
  const requestId = `req-${Date.now()}`;
  const { searchParams } = new URL(request.url);
  const stateCode = searchParams.get('state_code') || 'TN';
  const districtCode = searchParams.get('district_code') || 'THANJAVUR';

  const indicators = FoodSecurityEngine.calculateIndicators(stateCode, districtCode, {
    production_shortfall_risk: 0.12,
    market_availability_index: 0.88,
    price_volatility_score: 0.18,
    storage_adequacy_ratio: 1.25,
    supply_concentration_index: 0.22,
    import_dependence_ratio: 0.05,
    export_pressure_index: 0.15,
    crop_failure_risk: 0.10
  });

  return NextResponse.json({
    success: true,
    request_id: requestId,
    timestamp: new Date().toISOString(),
    data: indicators
  }, {
    headers: { 'X-Request-ID': requestId }
  });
}

