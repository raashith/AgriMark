import { NextResponse } from 'next/server';
import { detectPolicyChanges } from '@/lib/policy-change-detection';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const policyId = searchParams.get('policy_id') || 'TN_PM_KUSUM_SOLAR_2026';

  const changes = await detectPolicyChanges(policyId);
  return NextResponse.json({ success: true, data: changes });
}



