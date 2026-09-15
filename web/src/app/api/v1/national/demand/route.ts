import { NextResponse } from 'next/server';
import { NationalSupplyDemandEngine } from '@/lib/national-supply-demand';

export async function GET(request: Request) {
  const requestId = `req-${Date.now()}`;
  const { searchParams } = new URL(request.url);
  const commodityCode = searchParams.get('commodity_code') || 'RICE_PADDY';
  const geography = searchParams.get('geography') || 'INDIA_NATIONAL';

  const demandEstimate = NationalSupplyDemandEngine.calculateDemand(commodityCode, {
    buyer_rfq_volume_mt: 2100000,
    confirmed_orders_mt: 1450000,
    processing_demand_mt: 800000,
    export_demand_mt: 450000,
    regional_consumption_mt: 12000000,
    historical_trade_volume_mt: 16000000,
    geography
  });

  return NextResponse.json({
    success: true,
    request_id: requestId,
    timestamp: new Date().toISOString(),
    data: demandEstimate
  }, {
    headers: { 'X-Request-ID': requestId }
  });
}
