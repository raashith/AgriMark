import { NextResponse } from 'next/server';
import { FarmerOutcomesEngine } from '@/lib/farmer-outcomes-engine';

export async function GET(request: Request) {
  const requestId = `req-${Date.now()}`;
  const { searchParams } = new URL(request.url);
  const farmerId = searchParams.get('farmer_id') || 'usr_f_tn_98231';

  const outcomes = FarmerOutcomesEngine.calculateOutcomes({
    farmer_id: farmerId,
    baseline_period: 'KHARIF_2024',
    comparison_period: 'KHARIF_2025',
    baseline_net_income_inr: 85000,
    comparison_net_income_inr: 104550,
    baseline_post_harvest_loss_percent: 12.0,
    comparison_post_harvest_loss_percent: 4.5,
    baseline_avg_mandi_price_inr: 2150,
    achieved_avg_price_inr: 2350
  });

  return NextResponse.json({
    success: true,
    request_id: requestId,
    timestamp: new Date().toISOString(),
    data: outcomes
  }, {
    headers: { 'X-Request-ID': requestId }
  });
}
