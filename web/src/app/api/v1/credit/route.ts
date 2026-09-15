export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { CreditIntelligenceEngine } from '@/lib/credit-intelligence-engine';

export async function GET(request: Request) {
  const requestId = `req-${Date.now()}`;
  const { searchParams } = new URL(request.url);
  const farmerId = searchParams.get('farmer_id') || 'usr_f_tn_98231';

  const assessment = CreditIntelligenceEngine.evaluateCreditRisk({
    farmer_id: farmerId,
    verified_farm_years: 3,
    total_sales_history_inr: 450000,
    order_fulfillment_rate: 0.95,
    has_fpo_membership: true,
    warehouse_receipt_available: true
  });

  return NextResponse.json({
    success: true,
    request_id: requestId,
    timestamp: new Date().toISOString(),
    data: assessment
  }, {
    headers: { 'X-Request-ID': requestId }
  });
}

