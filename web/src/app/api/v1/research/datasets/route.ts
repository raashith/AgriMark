export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getResearchDatasets } from '@/lib/dataset-catalog-quality';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const crop = searchParams.get('crop') || 'Turmeric';

  const datasets = await getResearchDatasets(crop);
  return NextResponse.json({ success: true, data: datasets });
}

