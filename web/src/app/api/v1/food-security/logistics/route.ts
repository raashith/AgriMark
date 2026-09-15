export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { detectLogisticsBottlenecks } from '@/lib/logistics-bottleneck-engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin') || 'Salem North';
  const destination = searchParams.get('destination') || 'Chennai Wholesale Hub';

  const bottlenecks = await detectLogisticsBottlenecks(origin, destination);
  return NextResponse.json({ success: true, data: bottlenecks });
}

