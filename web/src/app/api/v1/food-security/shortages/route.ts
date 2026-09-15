import { NextResponse } from 'next/server';
import { evaluateShortageRisk } from '@/lib/shortage-detection-engine';
import { computeRegionalRedistribution } from '@/lib/regional-redistribution-engine';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const commodity = searchParams.get('commodity') || 'Turmeric';
  const region = searchParams.get('region') || 'Tamil Nadu';

  const assessment = await evaluateShortageRisk(commodity, region);
  const redistribution = await computeRegionalRedistribution(commodity, 'Erode Cluster', region);

  return NextResponse.json({
    success: true,
    data: {
      shortage_assessment: assessment,
      redistribution_opportunity: redistribution
    },
    meta: {
      single_price_spike_override: false,
      non_autonomous_execution: 'Redistribution requires explicit human authorization.'
    }
  });
}



