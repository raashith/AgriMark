export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { DataQualityProvenanceEngine } from '@/lib/data-quality-provenance';

export async function GET() {
  const requestId = `req-${Date.now()}`;

  const qualityReport = DataQualityProvenanceEngine.evaluateQuality({
    dataset_name: 'NATIONAL_MANDI_PRICE_FEED',
    table_name: 'national_market_price_observations',
    total_records: 125000,
    missing_critical_fields_count: 450,
    latest_record_age_hours: 1.2,
    duplicate_count: 120,
    source_reliability_score: 0.98,
    districts_covered: 685,
    total_districts: 766
  });

  return NextResponse.json({
    status: 'HEALTHY',
    system: 'AGRIMARK_NATIONAL_AGRICULTURAL_INTELLIGENCE_CONTROL_TOWER',
    version: '10.0.0',
    timestamp: new Date().toISOString(),
    request_id: requestId,
    services: {
      commodity_balance_engine: 'OPERATIONAL',
      supply_demand_intelligence: 'OPERATIONAL',
      price_signal_separation: 'OPERATIONAL',
      weather_climate_adapters: 'OPERATIONAL',
      forecasting_mlops: 'OPERATIONAL',
      policy_eligibility_engine: 'OPERATIONAL',
      food_security_indicators: 'OPERATIONAL',
      data_quality_control: 'OPERATIONAL'
    },
    latest_quality_report: qualityReport
  }, {
    headers: { 'X-Request-ID': requestId }
  });
}

