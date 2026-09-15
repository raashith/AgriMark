import { NextResponse } from 'next/server';
import { matchCircularDemand, computeCircularValue } from '@/lib/circular-agriculture-marketplace';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wasteId = searchParams.get('waste_id') || 'WASTE_DEMO_1';
  const buyerId = searchParams.get('buyer_id') || 'BUYER_COMPOST_CO';

  const match = await matchCircularDemand(wasteId, buyerId);
  const valueMetrics = await computeCircularValue();

  return NextResponse.json({
    success: true,
    data: {
      circular_match: match,
      value_engine: valueMetrics
    }
  });
}
