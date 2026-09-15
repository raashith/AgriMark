export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { detectNetworkRisks } from '@/lib/network-risk-engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get('region') || 'Salem';

  const risks = await detectNetworkRisks(region);
  return NextResponse.json({ success: true, data: risks });
}

