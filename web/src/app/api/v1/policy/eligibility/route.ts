import { NextResponse } from 'next/server';
import { evaluateEligibility } from '@/lib/eligibility-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await evaluateEligibility(body.farmer_profile, body.scheme_id);
    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const farmerId = searchParams.get('farmer_id') || 'FARMER_DEMO_1';

  const sampleProfile = {
    farmer_id: farmerId,
    state: 'Tamil Nadu',
    farmer_category: 'SMALL' as const,
    landholding_acres: 3.5,
    crop_names: ['Turmeric'],
    documents_available: ['LAND_PATTA', 'AADHAAR_CARD']
  };

  const result = await evaluateEligibility(sampleProfile);
  return NextResponse.json({ success: true, data: result });
}
