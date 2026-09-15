import { NextResponse } from 'next/server';
import { getCriticalSupplyNodes } from '@/lib/resilience-planning-engine';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get('region') || 'Salem';

  const nodes = await getCriticalSupplyNodes(region);
  return NextResponse.json({
    success: true,
    data: nodes,
    meta: {
      sensitive_infrastructure_protected: true,
      coordinate_precision: 'MASKED_SECTOR_LEVEL'
    }
  });
}



