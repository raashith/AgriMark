import { NextResponse } from 'next/server';
import { ProcurementCommerceEngine } from '@/lib/procurement-commerce-engine';

export async function GET(request: Request) {
  const requestId = `req-${Date.now()}`;
  const { searchParams } = new URL(request.url);
  const commodityCode = searchParams.get('commodity_code') || 'RICE_PADDY';
  const targetPrice = parseFloat(searchParams.get('target_price') || '2400');

  const candidates = ProcurementCommerceEngine.matchSuppliers({
    commodity_code: commodityCode,
    required_quantity_mt: 50.0,
    required_grade: 'GRADE_A',
    max_distance_km: 150,
    max_target_price_inr: targetPrice,
    buyer_location: 'CHENNAI, TN'
  }, [
    {
      supplier_id: 'fpo_tn_delta_01',
      supplier_name: 'Thanjavur Delta Farmer Producer Co',
      supplier_type: 'FPO',
      available_quantity_mt: 120.0,
      asking_price_inr: 2320,
      distance_km: 45,
      quality_fit_score: 0.95,
      historical_fulfillment_rate: 0.98,
      trust_score: 92,
      overall_match_score: 0,
      match_explanation: []
    },
    {
      supplier_id: 'usr_f_tn_98231',
      supplier_name: 'R. Murugesan (Farmer)',
      supplier_type: 'FARMER',
      available_quantity_mt: 14.5,
      asking_price_inr: 2350,
      distance_km: 30,
      quality_fit_score: 0.90,
      historical_fulfillment_rate: 1.0,
      trust_score: 95,
      overall_match_score: 0,
      match_explanation: []
    }
  ]);

  return NextResponse.json({
    success: true,
    request_id: requestId,
    timestamp: new Date().toISOString(),
    data: {
      matches_count: candidates.length,
      candidate_matches: candidates
    }
  }, {
    headers: { 'X-Request-ID': requestId }
  });
}
