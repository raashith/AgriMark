import { NextResponse } from 'next/server';
import { verifyPolicySource } from '@/lib/policy-source-verification';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sourceUrl = searchParams.get('url') || 'https://tnaed.tn.gov.in/schemes/kusum-component-b';

  const verification = await verifyPolicySource(sourceUrl);
  return NextResponse.json({
    success: true,
    data: verification,
    meta: {
      trust_rank_info: 'Rank 1 = OFFICIAL_PRIMARY (gov.in/nic.in). Lower trust sources are never presented as official government portals.'
    }
  });
}



