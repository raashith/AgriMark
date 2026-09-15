import { NextResponse } from 'next/server';
import { CommodityBalanceEngine } from '@/lib/commodity-balance-engine';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestId = `req-${Date.now()}`;
  const { searchParams } = new URL(request.url);
  const commodityCode = searchParams.get('commodity_code') || 'RICE_PADDY';
  const stateCode = searchParams.get('state_code') || undefined;
  const periodStart = searchParams.get('period_start') || '2025-04-01';
  const periodEnd = searchParams.get('period_end') || '2026-03-31';

  const balance = CommodityBalanceEngine.calculateBalance({
    commodity_code: commodityCode,
    state_code: stateCode,
    period_start: periodStart,
    period_end: periodEnd,
    opening_stock: { value: 1200000, nature: 'OBSERVED' },
    production: { value: 4500000, nature: 'ESTIMATED' },
    imports: { value: 150000, nature: 'OBSERVED' },
    exports: { value: 300000, nature: 'OBSERVED' },
    processing: { value: 800000, nature: 'ESTIMATED' },
    consumption: { value: 3800000, nature: 'ESTIMATED' },
    losses: { value: 250000, nature: 'ESTIMATED' },
    source: 'DES_MINISTRY_OF_AGRICULTURE',
    geography: stateCode || 'INDIA_NATIONAL'
  });

  return NextResponse.json({
    success: true,
    request_id: requestId,
    timestamp: new Date().toISOString(),
    data: {
      commodities: [
        { code: 'RICE_PADDY', name: 'Paddy Rice', category: 'CEREALS', standard_unit: 'METRIC_TON' },
        { code: 'WHEAT', name: 'Wheat', category: 'CEREALS', standard_unit: 'METRIC_TON' },
        { code: 'MAIZE', name: 'Maize', category: 'CEREALS', standard_unit: 'METRIC_TON' },
        { code: 'COTTON', name: 'Raw Cotton', category: 'FIBER', standard_unit: 'METRIC_TON' },
        { code: 'SOYBEAN', name: 'Soybean', category: 'OILSEEDS', standard_unit: 'METRIC_TON' },
        { code: 'ONION', name: 'Red Onion', category: 'VEGETABLES', standard_unit: 'METRIC_TON' }
      ],
      balance
    }
  }, {
    headers: {
      'X-Request-ID': requestId,
      'Cache-Control': 'public, max-age=300'
    }
  });
}



