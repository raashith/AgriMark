export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { calculateRegionalLiquidity, getLiquidityOverview } from '@/lib/market-liquidity-engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get('region');

  if (region) {
    const data = await calculateRegionalLiquidity(region);
    return NextResponse.json({ success: true, data });
  }

  const overview = await getLiquidityOverview();
  return NextResponse.json({ success: true, data: overview });
}

