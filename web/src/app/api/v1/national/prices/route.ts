import { NextResponse } from 'next/server';
import { NationalPriceIntelligenceEngine } from '@/lib/national-price-intelligence';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestId = `req-${Date.now()}`;
  const { searchParams } = new URL(request.url);
  const commodityCode = searchParams.get('commodity_code') || 'RICE_PADDY';
  const geography = searchParams.get('geography') || 'TN_THANJAVUR';
  const now = new Date().toISOString();

  const observedMandi = NationalPriceIntelligenceEngine.createPriceObservation({
    commodity_code: commodityCode,
    price_signal_type: 'OBSERVED_MANDI',
    min_price: 2150,
    max_price: 2320,
    modal_price: 2240,
    arrival_quantity_mt: 450,
    observed_at: now,
    source: 'AGMARKNET_OFFICIAL',
    state_code: 'TN',
    district_code: 'THANJAVUR'
  });

  const farmerAsking = NationalPriceIntelligenceEngine.createPriceObservation({
    commodity_code: commodityCode,
    price_signal_type: 'FARMER_ASKING',
    min_price: 2200,
    max_price: 2400,
    modal_price: 2350,
    observed_at: now,
    source: 'AGRIMARK_FARMER_LISTINGS',
    state_code: 'TN',
    district_code: 'THANJAVUR'
  });

  const buyerOffer = NationalPriceIntelligenceEngine.createPriceObservation({
    commodity_code: commodityCode,
    price_signal_type: 'BUYER_OFFER',
    min_price: 2100,
    max_price: 2280,
    modal_price: 2220,
    observed_at: now,
    source: 'AGRIMARK_BUYER_RFQS',
    state_code: 'TN',
    district_code: 'THANJAVUR'
  });

  const fpoAsking = NationalPriceIntelligenceEngine.createPriceObservation({
    commodity_code: commodityCode,
    price_signal_type: 'FPO_ASKING',
    min_price: 2250,
    max_price: 2380,
    modal_price: 2310,
    observed_at: now,
    source: 'AGRIMARK_FPO_POOLS',
    state_code: 'TN',
    district_code: 'THANJAVUR'
  });

  const aiForecast = NationalPriceIntelligenceEngine.createPriceObservation({
    commodity_code: commodityCode,
    price_signal_type: 'AI_FORECAST',
    min_price: 2210,
    max_price: 2360,
    modal_price: 2285,
    observed_at: now,
    source: 'AGRIMARK_FORECAST_ENGINE',
    state_code: 'TN',
    district_code: 'THANJAVUR'
  });

  const report = NationalPriceIntelligenceEngine.buildMultiSignalReport(
    commodityCode,
    geography,
    [observedMandi, farmerAsking, buyerOffer, fpoAsking, aiForecast]
  );

  return NextResponse.json({
    success: true,
    request_id: requestId,
    timestamp: now,
    data: report
  }, {
    headers: { 'X-Request-ID': requestId }
  });
}



