import { NextResponse } from 'next/server';
import { detectMarketOpportunities } from '@/lib/market-opportunity-engine';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const entityId = searchParams.get('entity_id') || 'usr_f_sample';
  const entityType = (searchParams.get('entity_type') as 'farmer' | 'fpo') || 'farmer';

  const opportunities = await detectMarketOpportunities(entityId, entityType);
  return NextResponse.json({ success: true, data: opportunities });
}



