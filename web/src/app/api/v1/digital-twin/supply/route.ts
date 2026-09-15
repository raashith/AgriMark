import { NextResponse } from 'next/server';
import { InfrastructureMarketSupplyTwinEngine } from '@/lib/infrastructure-market-supply-twin';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const district = searchParams.get('district') || 'TN-SLM';
  const commodity = searchParams.get('commodity') || 'PADDY';
  const prod = parseFloat(searchParams.get('production_mt') || '45000');
  const cons = parseFloat(searchParams.get('consumption_mt') || '38000');

  const supplyTwin = InfrastructureMarketSupplyTwinEngine.calculateSupplyBalance(district, commodity, prod, cons);
  return NextResponse.json(supplyTwin);
}



