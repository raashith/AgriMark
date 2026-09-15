export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { computeScientificConsensus } from '@/lib/knowledge-conflict-consensus';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get('topic') || 'Pulse Drip Irrigation Curcumin Enhancement';

  const consensus = await computeScientificConsensus(topic);
  return NextResponse.json({
    success: true,
    data: consensus,
    meta: {
      paper_count_equals_truth_warning: 'Paper publication count is evaluated alongside method and geographic diversity. Raw paper count does not equal scientific truth.'
    }
  });
}

