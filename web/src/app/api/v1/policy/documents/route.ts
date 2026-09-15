import { NextResponse } from 'next/server';
import { evaluateDocumentReadiness } from '@/lib/document-readiness-engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const farmerId = searchParams.get('farmer_id') || 'FARMER_DEMO_1';
  const schemeId = searchParams.get('scheme_id') || 'TN_PM_KUSUM_SOLAR_2026';

  const readiness = await evaluateDocumentReadiness(farmerId, schemeId);
  return NextResponse.json({
    success: true,
    data: readiness,
    meta: {
      auto_submit_enabled: false,
      privacy_notice: 'Private farmer identity and land documents are encrypted and protected under RLS policies.'
    }
  });
}
