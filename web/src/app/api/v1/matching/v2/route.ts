export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { computeMatchingV2, getMatchesForFarmer } from '@/lib/matching-v2-engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const farmerId = searchParams.get('farmer_id') || 'usr_f_sample';

  const matches = await getMatchesForFarmer(farmerId);
  return NextResponse.json({
    success: true,
    data: matches
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { farmer_id, buyer_id, produce_params } = body;

    const match = await computeMatchingV2(farmer_id || 'usr_f_sample', buyer_id || 'byr_sample', produce_params || {});
    return NextResponse.json({
      success: true,
      data: match
    });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}

