import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const farmId = searchParams.get('farm_id') || 'FM-SLM-001';

  return NextResponse.json({
    farm_id: farmId,
    boundary: { type: 'Polygon', coordinates: [[[78.14, 11.66], [78.15, 11.66], [78.15, 11.67], [78.14, 11.67], [78.14, 11.66]]] },
    crop_code: 'PADDY-PB1121',
    soil_type: 'Alluvial Clay',
    farm_health_score: 87.5,
    expected_production_range: { min_mt: 18.5, max_mt: 24.0, unit: 'Metric Tons' },
    water_demand_liters: 4500000,
    input_demand_kg: { urea: 450, npk: 250, biofertilizer: 50 },
    risk_exposure_score: 22.0,
    uncertainty_margin: 0.08,
    data_origin: 'LIVE_OPERATIONAL'
  });
}
