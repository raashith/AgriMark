import { NextResponse } from 'next/server';
import { InfrastructureMarketSupplyTwinEngine } from '@/lib/infrastructure-market-supply-twin';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const commodity = searchParams.get('commodity') || 'PADDY-PB1121';
  const supply = parseFloat(searchParams.get('supply_mt') || '12000');
  const demand = parseFloat(searchParams.get('demand_mt') || '15000');

  const marketSim = InfrastructureMarketSupplyTwinEngine.simulateMarketPrice(commodity, supply, demand);
  return NextResponse.json(marketSim);
}



