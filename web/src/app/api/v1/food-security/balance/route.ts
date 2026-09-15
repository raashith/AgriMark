import { NextResponse } from 'next/server';
import { computeSupplyBalance } from '@/lib/national-supply-balance';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const commodity = searchParams.get('commodity') || 'Turmeric';
  const state = searchParams.get('state') || 'Tamil Nadu';
  const district = searchParams.get('district') || 'Salem';
  const period = searchParams.get('period') || '2026-Q3';

  const balance = await computeSupplyBalance(commodity, state, district, period);
  return NextResponse.json({
    success: true,
    data: balance,
    meta: {
      provenance_tracked: true,
      data_type: balance.data_type,
      uncertainty_pct: balance.uncertainty_pct
    }
  });
}



