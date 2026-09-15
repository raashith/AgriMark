import { NextResponse } from 'next/server';
import { getUpcomingDeadlines } from '@/lib/deadline-intelligence-engine';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const farmerId = searchParams.get('farmer_id') || 'FARMER_DEMO_1';

  const deadlines = await getUpcomingDeadlines(farmerId);
  return NextResponse.json({ success: true, data: deadlines });
}



