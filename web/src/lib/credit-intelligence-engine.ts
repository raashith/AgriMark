/**
 * AgriMark Phase 12 - Credit Intelligence & Financial Product Eligibility Engine
 * Provides non-automated credit risk decision-support (risk_band, confidence, evidence, data_gaps)
 * and evaluates financial product eligibility with full criteria tracing.
 * Strictly refrains from automated loan approvals/rejections and credit bureau claims.
 */

export type CreditRiskBand = 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_RISK' | 'INSUFFICIENT_DATA';

export interface CreditEvaluationInput {
  farmer_id: string;
  verified_farm_years: number;
  total_sales_history_inr: number;
  order_fulfillment_rate: number; // 0 to 1
  has_fpo_membership: boolean;
  warehouse_receipt_available: boolean;
  has_repayment_history?: boolean;
}

export interface CreditRiskAssessment {
  farmer_id: string;
  risk_band: CreditRiskBand;
  confidence: number;
  evidence: string[];
  data_gaps: string[];
  disclaimer: string;
}

export class CreditIntelligenceEngine {
  public static evaluateCreditRisk(input: CreditEvaluationInput): CreditRiskAssessment {
    const evidence: string[] = [];
    const data_gaps: string[] = [];

    // Evaluate evidence
    if (input.verified_farm_years >= 2) {
      evidence.push(`Verified farm cultivation history of ${input.verified_farm_years} years.`);
    } else {
      data_gaps.push('Limited verified historical farm cultivation tenure (<2 years).');
    }

    if (input.total_sales_history_inr >= 100000) {
      evidence.push(`Verified platform sales realization of ₹${input.total_sales_history_inr.toLocaleString('en-IN')}.`);
    } else {
      data_gaps.push('Low historical platform sales volume (<₹100,000).');
    }

    if (input.order_fulfillment_rate >= 0.90) {
      evidence.push(`High order fulfillment reliability (${Math.round(input.order_fulfillment_rate * 100)}%).`);
    } else {
      data_gaps.push(`Fulfillment reliability rate is ${Math.round(input.order_fulfillment_rate * 100)}%.`);
    }

    if (input.has_fpo_membership) {
      evidence.push('Active membership in registered Farmer Producer Organization.');
    }

    if (input.warehouse_receipt_available) {
      evidence.push('WDRA-compliant warehouse receipt backed inventory available.');
    }

    if (input.has_repayment_history === undefined) {
      data_gaps.push('External credit bureau repayment history not consented or integrated.');
    }

    // Determine Risk Band
    let risk_band: CreditRiskBand = 'MODERATE_RISK';
    let confidence = 0.85;

    if (evidence.length >= 4 && data_gaps.length <= 1) {
      risk_band = 'LOW_RISK';
      confidence = 0.92;
    } else if (evidence.length <= 1) {
      risk_band = 'INSUFFICIENT_DATA';
      confidence = 0.60;
    } else if (data_gaps.length >= 3) {
      risk_band = 'HIGH_RISK';
      confidence = 0.80;
    }

    return {
      farmer_id: input.farmer_id,
      risk_band,
      confidence,
      evidence,
      data_gaps,
      disclaimer: 'DISCLAIMER: This assessment provides algorithmic decision-support indicators for formal banking partners. AgriMark does not approve loans, issue credit decisions, or claim regulatory credit rating authority.'
    };
  }
}
