import { supabase as supabaseAdmin } from './supabase';

export type EligibilityStatus = 'ELIGIBLE' | 'POSSIBLY_ELIGIBLE' | 'NOT_ELIGIBLE' | 'INSUFFICIENT_INFORMATION';

export interface FarmerProfileInput {
  farmer_id: string;
  state: string;
  district?: string;
  farmer_category?: 'SMALL' | 'MARGINAL' | 'LARGE';
  landholding_acres?: number;
  crop_names?: string[];
  fpo_member?: boolean;
  documents_available?: string[];
}

export interface EligibilityEvaluationResult {
  id: string;
  farmer_id: string;
  scheme_id: string;
  scheme_name: string;
  status: EligibilityStatus;
  matched_rules: string[];
  failed_rules: string[];
  missing_information: string[];
  provenance: {
    source: string;
    source_version: string;
    effective_date: string;
  };
  confidence: number;
  evaluated_at: string;
}

export async function evaluateEligibility(
  input: FarmerProfileInput,
  schemeId: string = 'TN_PM_KUSUM_SOLAR_2026'
): Promise<EligibilityEvaluationResult> {
  const matchedRules: string[] = [];
  const failedRules: string[] = [];
  const missingInfo: string[] = [];

  // Rule 1: Location Check
  if (input.state === 'Tamil Nadu') {
    matchedRules.push('Jurisdiction Match: Tamil Nadu resident');
  } else {
    failedRules.push(`Jurisdiction Mismatch: Scheme is specific to Tamil Nadu, farmer is in ${input.state}`);
  }

  // Rule 2: Landholding Check
  if (input.landholding_acres !== undefined) {
    if (input.landholding_acres <= 5.0) {
      matchedRules.push(`Landholding Rule: ${input.landholding_acres} acres meets Small/Marginal threshold (<= 5 acres)`);
    } else {
      failedRules.push(`Landholding Rule: ${input.landholding_acres} acres exceeds maximum threshold of 5 acres`);
    }
  } else {
    missingInfo.push('Landholding acreage not specified in profile');
  }

  // Rule 3: Document Check
  if (input.documents_available) {
    if (input.documents_available.includes('LAND_PATTA')) {
      matchedRules.push('Document Rule: Verified Land Patta available');
    } else {
      missingInfo.push('Missing Land Patta document copy');
    }
  } else {
    missingInfo.push('No verified documents uploaded');
  }

  let status: EligibilityStatus = 'ELIGIBLE';

  if (failedRules.length > 0) {
    status = 'NOT_ELIGIBLE';
  } else if (missingInfo.length > 0) {
    status = matchedRules.length > 0 ? 'POSSIBLY_ELIGIBLE' : 'INSUFFICIENT_INFORMATION';
  }

  const result: EligibilityEvaluationResult = {
    id: `eval_${input.farmer_id.toLowerCase()}_${schemeId.toLowerCase()}`,
    farmer_id: input.farmer_id,
    scheme_id: schemeId,
    scheme_name: 'PM-KUSUM Component B Solar Off-Grid Pump Subsidy',
    status,
    matched_rules: matchedRules,
    failed_rules: failedRules,
    missing_information: missingInfo,
    provenance: {
      source: 'TN AED Scheme Operational Guidelines 2026',
      source_version: 'v2026.1',
      effective_date: '2026-04-01T00:00:00Z'
    },
    confidence: missingInfo.length > 0 ? 0.75 : 0.95,
    evaluated_at: new Date().toISOString()
  };

  if (supabaseAdmin) {
    await supabaseAdmin.from('eligibility_evaluations').upsert({
      id: result.id,
      farmer_id: result.farmer_id,
      scheme_id: result.scheme_id,
      status: result.status,
      matched_rules: result.matched_rules,
      failed_rules: result.failed_rules,
      missing_info: result.missing_information,
      confidence: result.confidence,
      evaluated_at: result.evaluated_at
    });
  }

  return result;
}
