export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { NationalSupplyDemandEngine } from '@/lib/national-supply-demand';

export async function GET(request: Request) {
  const requestId = `req-${Date.now()}`;
  const { searchParams } = new URL(request.url);
  const commodityCode = searchParams.get('commodity_code') || 'RICE_PADDY';
  const geography = searchParams.get('geography') || 'INDIA_NATIONAL';

  const supplyEstimate = NationalSupplyDemandEngine.calculateSupply(commodityCode, {
    acreage_hectares: 4500000,
    expected_yield_kg_ha: 3800,
    fpo_pool_volume_mt: 850000,
    warehouse_inventory_mt: 1200000,
    produce_listings_mt: 340000,
    historical_production_mt: 16500000,
    geography
  });

  return NextResponse.json({
    success: true,
    request_id: requestId,
    timestamp: new Date().toISOString(),
    data: supplyEstimate
  }, {
    headers: { 'X-Request-ID': requestId }
  });
}

