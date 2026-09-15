import { NextResponse } from 'next/server';
import { detectSupplyShocks } from '@/lib/supply-shock-engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get('region') || 'Salem Cluster';
  const commodity = searchParams.get('commodity') || 'Turmeric';

  const shocks = await detectSupplyShocks(region, commodity);
  return NextResponse.json({ success: true, data: shocks });
}
