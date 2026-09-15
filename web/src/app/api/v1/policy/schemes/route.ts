import { NextResponse } from 'next/server';
import { getActiveSchemes } from '@/lib/scheme-intelligence-engine';
import { compareGovernmentSchemes } from '@/lib/policy-search-comparison';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'compare') {
    const s1 = searchParams.get('scheme_1') || 'TN_PM_KUSUM_SOLAR_2026';
    const s2 = searchParams.get('scheme_2') || 'NAT_PM_KISAN_2026';
    const comparison = await compareGovernmentSchemes(s1, s2);
    return NextResponse.json({ success: true, data: comparison });
  }

  const schemes = await getActiveSchemes();
  return NextResponse.json({ success: true, data: schemes });
}



