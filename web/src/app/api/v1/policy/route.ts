import { NextResponse } from 'next/server';
import { fetchPolicyDocument } from '@/lib/policy-document-system';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const policyId = searchParams.get('id') || 'TN_PM_KUSUM_SOLAR_2026';

  const doc = await fetchPolicyDocument(policyId);
  return NextResponse.json({
    success: true,
    data: doc,
    meta: {
      official_portal_disclaimer: 'AgriMark is an independent intelligence platform, not an official government portal.'
    }
  });
}



