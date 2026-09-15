import { NextResponse } from 'next/server';
import { searchResearchPapers } from '@/lib/research-repository-engine';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const crop = searchParams.get('crop') || 'Turmeric';
  const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 10;

  const results = await searchResearchPapers(crop, page, limit);
  return NextResponse.json({ success: true, ...results });
}



