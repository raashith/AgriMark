import { NextResponse } from 'next/server';
import { generateResiliencePlan, computeNationalResilienceIndex } from '@/lib/resilience-planning-engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get('region') || 'Tamil Nadu';

  const plan = await generateResiliencePlan(region);
  const index = await computeNationalResilienceIndex(region);

  return NextResponse.json({
    success: true,
    data: {
      resilience_recommendations: plan,
      resilience_index_components: index
    },
    meta: {
      human_approval_required: true
    }
  });
}
