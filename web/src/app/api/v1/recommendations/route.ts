export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { generateFarmerRecommendations } from '@/lib/farmer-recommendation-engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const farmerId = searchParams.get('farmer_id') || 'usr_f_sample';

  const recs = await generateFarmerRecommendations(farmerId);
  return NextResponse.json({ success: true, data: recs });
}

