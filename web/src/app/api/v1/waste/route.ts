export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { listWasteMaterial, WasteMaterialListing } from '@/lib/circular-agriculture-marketplace';

export async function GET(request: Request) {
  const sampleListing: WasteMaterialListing = {
    id: 'waste_sample_1',
    seller_id: 'FARMER_SALEM_01',
    waste_type: 'CROP_RESIDUE',
    source_description: 'Turmeric leaf & stem dry biomass residual post-harvest',
    quantity_kg: 3500,
    quality_grade: 'GRADE_A',
    location: 'Salem Rural, TN',
    rate_per_kg: 3.5,
    intended_use: 'COMPOST',
    status: 'AVAILABLE',
    safety_approved: true,
    created_at: new Date().toISOString()
  };

  return NextResponse.json({ success: true, data: [sampleListing] });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const listing = await listWasteMaterial(body);
    return NextResponse.json({ success: true, data: listing });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

