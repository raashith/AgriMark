export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { PolicySchemeEngine } from '@/lib/policy-scheme-engine';
import { GovernmentScheme } from '@/lib/national-data-model';

export async function GET(request: Request) {
  const requestId = `req-${Date.now()}`;
  const { searchParams } = new URL(request.url);
  const landHectares = parseFloat(searchParams.get('land_hectares') || '1.8');
  const stateCode = searchParams.get('state_code') || 'TN';

  const sampleScheme: GovernmentScheme = {
    id: 'scheme-pm-kisan',
    scheme_code: 'PM_KISAN_DBT',
    scheme_name: 'Pradhan Mantri Kisan Samman Nidhi',
    description: 'Income support of ₹6,000/- per year in three equal installments to small and marginal farmer families.',
    jurisdiction: 'NATIONAL',
    eligibility_criteria: {
      max_land_hectares: 2.0,
      farmer_types: ['MARGINAL', 'SMALL']
    },
    benefit_structure: {
      cash_transfer_inr: 6000
    },
    required_documents: ['Aadhaar Card', 'Land Revenue Record (7/12 or Chitta)', 'Bank Passbook'],
    official_portal_url: 'https://pmkisan.gov.in',
    effective_from: '2019-02-01',
    provenance: {
      source: 'MINISTRY_OF_AGRICULTURE_GOI',
      source_url: 'https://pmkisan.gov.in',
      retrieved_at: new Date().toISOString(),
      license: 'OPEN_GOV_IN',
      coverage_start: '2019-02-01',
      coverage_end: '2026-12-31',
      geography: 'INDIA_NATIONAL',
      unit: 'SCHEME',
      schema_version: 'v1.0',
      quality_score: 0.98,
      validation_status: 'VALIDATED',
      data_layer: 'CANONICAL'
    }
  };

  const result = PolicySchemeEngine.evaluateEligibility(sampleScheme, {
    land_holding_hectares: landHectares,
    farmer_type: 'SMALL',
    state_code: stateCode,
    crops_cultivated: ['RICE_PADDY']
  });

  return NextResponse.json({
    success: true,
    request_id: requestId,
    timestamp: new Date().toISOString(),
    data: {
      schemes: [sampleScheme],
      evaluation: result
    }
  }, {
    headers: { 'X-Request-ID': requestId }
  });
}

