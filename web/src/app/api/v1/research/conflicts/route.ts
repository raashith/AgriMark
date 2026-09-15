export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { detectKnowledgeConflicts } from '@/lib/knowledge-conflict-consensus';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get('topic') || 'Foliar Nitrogen Application in Heavy Rainfall';

  const conflicts = await detectKnowledgeConflicts(topic);
  return NextResponse.json({
    success: true,
    data: conflicts,
    meta: {
      transparent_conflict_notice: 'Conflicting research findings are surfaced explicitly for user review. AgriMark does not hide source disagreements.'
    }
  });
}

