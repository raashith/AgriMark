export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getProcessingAnalytics } from '@/lib/storage-processing-intelligence';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const commodity = searchParams.get('commodity') || 'Turmeric';

  const processing = await getProcessingAnalytics(commodity);
  return NextResponse.json({ success: true, data: processing });
}

