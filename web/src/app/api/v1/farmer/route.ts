export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const farmerId = searchParams.get('farmer_id') || 'FMR-TN-001';

  return NextResponse.json({
    farmer_id: farmerId,
    name: 'Ramanathan',
    farm_status: { active_farms: 1, total_area_ha: 4.5, health_score: 88.5 },
    crop_status: { crop: 'Paddy Pusa Basmati 1121', stage: 'VEGETATIVE', GDD: 450 },
    weather: { temp_c: 29.5, rainfall_mm: 12.0, humidity_pct: 68 },
    water: { reserve_pct: 82, deficit_risk: 'LOW' },
    diseases: [{ disease: 'Bacterial Blight', risk: 'LOW', symptom_observed: false }],
    market_prices: [{ commodity: 'Paddy', mandi: 'Salem', price_per_qt: 2180 }],
    selling_opportunities: [{ buyer: 'Kaveri FPO Agro Procurement', offer_price_qt: 2220 }],
    input_needs: [{ input: 'Neem-coated Urea', quantity_kg: 200, status: 'NEEDED' }],
    government_schemes: [{ scheme: 'PM-KISAN', status: 'ACTIVE', eligible: true }],
    financial_position: { pending_payouts_inr: 45000, credit_score: 820 },
    alerts: [{ title: 'Seasonal Pest Alert: BPH Low Density', severity: 'LOW' }],
    tasks: [{ title: 'Apply 2nd Nitrogen split dosage', status: 'PENDING' }],
    ai_recommendation: 'Apply pulse drip irrigation during morning hours. 12% yield improvement projected.'
  });
}

