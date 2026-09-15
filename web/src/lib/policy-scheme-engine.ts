/**
 * AgriMark Phase 10 - Policy & Scheme Intelligence Eligibility Engine
 * Evaluates farmer profile and land metrics against national & state agricultural scheme rules.
 * Produces explicit eligibility classifications ('eligible' | 'possibly_eligible' | 'not_eligible' | 'insufficient_information')
 * with complete rule trace justification. Never claims government approval.
 */

import { GovernmentScheme, ProvenanceMetadata } from './national-data-model';

export type EligibilityStatus = 'eligible' | 'possibly_eligible' | 'not_eligible' | 'insufficient_information';

export interface FarmerProfileCriteria {
  farmer_type?: 'MARGINAL' | 'SMALL' | 'SEMI_MEDIUM' | 'MEDIUM' | 'LARGE';
  land_holding_hectares?: number;
  state_code?: string;
  crops_cultivated?: string[];
  annual_income_inr?: number;
  has_kisan_credit_card?: boolean;
}

export interface SchemeEligibilityResult {
  scheme_code: string;
  scheme_name: string;
  status: EligibilityStatus;
  reasons: string[];
  missing_information: string[];
  benefits_summary: string;
  required_documents: string[];
  official_portal_url?: string;
  disclaimer: string;
  provenance: ProvenanceMetadata;
}

export class PolicySchemeEngine {
  public static evaluateEligibility(
    scheme: GovernmentScheme,
    profile: FarmerProfileCriteria
  ): SchemeEligibilityResult {
    const reasons: string[] = [];
    const missing_information: string[] = [];
    let isNotEligible = false;
    let isMissingInfo = false;

    const criteria = scheme.eligibility_criteria;

    // Check land holding max
    if (criteria.max_land_hectares !== undefined) {
      if (profile.land_holding_hectares === undefined) {
        missing_information.push('Land holding area in hectares is required.');
        isMissingInfo = true;
      } else if (profile.land_holding_hectares > criteria.max_land_hectares) {
        reasons.push(`Land holding (${profile.land_holding_hectares} ha) exceeds scheme maximum limit of ${criteria.max_land_hectares} ha.`);
        isNotEligible = true;
      } else {
        reasons.push(`Land holding (${profile.land_holding_hectares} ha) meets criterion (<= ${criteria.max_land_hectares} ha).`);
      }
    }

    // Check land holding min
    if (criteria.min_land_hectares !== undefined) {
      if (profile.land_holding_hectares === undefined) {
        if (!missing_information.includes('Land holding area in hectares is required.')) {
          missing_information.push('Land holding area in hectares is required.');
        }
        isMissingInfo = true;
      } else if (profile.land_holding_hectares < criteria.min_land_hectares) {
        reasons.push(`Land holding (${profile.land_holding_hectares} ha) is below scheme minimum limit of ${criteria.min_land_hectares} ha.`);
        isNotEligible = true;
      }
    }

    // Check farmer types
    if (criteria.farmer_types && criteria.farmer_types.length > 0) {
      if (!profile.farmer_type) {
        missing_information.push('Farmer category type (e.g., SMALL, MARGINAL) is required.');
        isMissingInfo = true;
      } else if (!criteria.farmer_types.includes(profile.farmer_type)) {
        reasons.push(`Farmer type '${profile.farmer_type}' is not eligible for this scheme (Eligible: ${criteria.farmer_types.join(', ')}).`);
        isNotEligible = true;
      } else {
        reasons.push(`Farmer type '${profile.farmer_type}' matches eligible criteria.`);
      }
    }

    // Check state jurisdiction
    if (scheme.jurisdiction === 'STATE' && scheme.state_code) {
      if (!profile.state_code) {
        missing_information.push('State location is required.');
        isMissingInfo = true;
      } else if (profile.state_code !== scheme.state_code) {
        reasons.push(`Scheme is restricted to state '${scheme.state_code}', but farmer is registered in '${profile.state_code}'.`);
        isNotEligible = true;
      }
    }

    // Check eligible crops
    if (criteria.eligible_crops && criteria.eligible_crops.length > 0) {
      if (!profile.crops_cultivated || profile.crops_cultivated.length === 0) {
        missing_information.push('Cultivated crops list is required.');
        isMissingInfo = true;
      } else {
        const matchingCrops = profile.crops_cultivated.filter(c => criteria.eligible_crops?.includes(c));
        if (matchingCrops.length === 0) {
          reasons.push(`Cultivated crops (${profile.crops_cultivated.join(', ')}) do not match eligible scheme crops (${criteria.eligible_crops.join(', ')}).`);
          isNotEligible = true;
        } else {
          reasons.push(`Matching eligible crops: ${matchingCrops.join(', ')}.`);
        }
      }
    }

    // Classify status
    let status: EligibilityStatus = 'eligible';
    if (isNotEligible) {
      status = 'not_eligible';
    } else if (isMissingInfo && reasons.length > 0) {
      status = 'possibly_eligible';
    } else if (isMissingInfo && reasons.length === 0) {
      status = 'insufficient_information';
    }

    // Formulate benefit summary
    const benefitParts: string[] = [];
    if (scheme.benefit_structure.cash_transfer_inr) {
      benefitParts.push(`Direct Benefit Transfer of ₹${scheme.benefit_structure.cash_transfer_inr.toLocaleString('en-IN')}`);
    }
    if (scheme.benefit_structure.subsidy_percent) {
      benefitParts.push(`${scheme.benefit_structure.subsidy_percent}% Subsidized Support`);
    }
    if (scheme.benefit_structure.insurance_coverage) {
      benefitParts.push('Crop Insurance Coverage');
    }
    const benefits_summary = benefitParts.join(', ') || 'General Government Agricultural Assistance';

    return {
      scheme_code: scheme.scheme_code,
      scheme_name: scheme.scheme_name,
      status,
      reasons,
      missing_information,
      benefits_summary,
      required_documents: scheme.required_documents || [],
      official_portal_url: scheme.official_portal_url,
      disclaimer: 'DISCLAIMER: This automated eligibility check does not constitute official government approval or guarantee entitlement. Final sanction rests with the respective nodal government authority.',
      provenance: scheme.provenance
    };
  }
}
