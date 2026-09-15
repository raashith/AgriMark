import { NextResponse } from 'next/server';
import { FarmerEconomicsEngine } from '@/lib/farmer-economics-engine';

export async function GET(request: Request) {
  const requestId = `req-${Date.now()}`;
  const { searchParams } = new URL(request.url);
  const farmerId = searchParams.get('farmer_id') || 'usr_f_tn_98231';

  const summary = FarmerEconomicsEngine.calculateLedger(
    farmerId,
    '2025-26',
    'RICE_PADDY',
    {
      production_cost_inr: 25000,
      input_cost_inr: 32000,
      labor_cost_inr: 18000,
      irrigation_cost_inr: 6000,
      transport_cost_inr: 4500,
      storage_cost_inr: 3000,
      platform_fees_inr: 1450,
      sale_revenue_inr: 145000
    }
  );

  return NextResponse.json({
    success: true,
    request_id: requestId,
    timestamp: new Date().toISOString(),
    data: summary
  }, {
    headers: { 'X-Request-ID': requestId }
  });
}
