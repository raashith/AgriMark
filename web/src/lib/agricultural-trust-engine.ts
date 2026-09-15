/**
 * AgriMark Phase 12 - Agricultural Trust Framework Engine
 * Calculates transparent, multi-signal trust scores for Farmers, Buyers, FPOs, Logistics, and Quality Providers.
 * Signals: identity verification, farm verification, historical fulfillment, order completion,
 * quality consistency, delivery reliability, listing accuracy, dispute history, data quality.
 * Outputs score (0-100), version, confidence, and full explicit evidence trace.
 */

export interface TrustSignalsInput {
  entity_id: string;
  entity_type: 'FARMER' | 'BUYER' | 'FPO' | 'LOGISTICS' | 'QUALITY_PROVIDER';
  identity_verified: boolean;
  farm_verified?: boolean;
  total_orders_attempted: number;
  orders_fulfilled: number;
  quality_inspections_passed: number;
  total_quality_inspections: number;
  disputes_opened_against: number;
  data_quality_score?: number;
}

export interface TrustScoreResult {
  entity_id: string;
  entity_type: string;
  trust_score: number;
  score_version: string;
  confidence: number;
  evidence: { signal: string; weight: number; contribution: number; explanation: string }[];
  last_updated: string;
}

export class AgriculturalTrustEngine {
  public static readonly SCORE_VERSION = 'v1.0';

  public static calculateTrustScore(input: TrustSignalsInput): TrustScoreResult {
    const evidence: { signal: string; weight: number; contribution: number; explanation: string }[] = [];

    // 1. Identity Verification Signal (Weight: 20 points)
    const identityContribution = input.identity_verified ? 20.0 : 0.0;
    evidence.push({
      signal: 'IDENTITY_VERIFICATION',
      weight: 20.0,
      contribution: identityContribution,
      explanation: input.identity_verified 
        ? 'Government identity & mobile verification completed (+20 pts).' 
        : 'Identity verification pending (0 pts).'
    });

    // 2. Farm / Infrastructure Verification (Weight: 20 points)
    const farmContribution = input.farm_verified ? 20.0 : 5.0;
    evidence.push({
      signal: 'FARM_INFRASTRUCTURE_VERIFICATION',
      weight: 20.0,
      contribution: farmContribution,
      explanation: input.farm_verified 
        ? 'Physical farm geo-location and land record verified (+20 pts).' 
        : 'Basic unverified farm profile registered (+5 pts).'
    });

    // 3. Order Fulfillment Reliability (Weight: 30 points)
    let fulfillmentRate = 1.0;
    if (input.total_orders_attempted > 0) {
      fulfillmentRate = Math.min(1.0, input.orders_fulfilled / input.total_orders_attempted);
    }
    const fulfillmentContribution = Math.round(fulfillmentRate * 30.0 * 100) / 100;
    evidence.push({
      signal: 'HISTORICAL_ORDER_FULFILLMENT',
      weight: 30.0,
      contribution: fulfillmentContribution,
      explanation: `${input.orders_fulfilled}/${input.total_orders_attempted} orders successfully fulfilled (${Math.round(fulfillmentRate * 100)}% rate, +${fulfillmentContribution} pts).`
    });

    // 4. Quality Consistency (Weight: 15 points)
    let qualityRate = 1.0;
    if (input.total_quality_inspections > 0) {
      qualityRate = Math.min(1.0, input.quality_inspections_passed / input.total_quality_inspections);
    }
    const qualityContribution = Math.round(qualityRate * 15.0 * 100) / 100;
    evidence.push({
      signal: 'QUALITY_ASSAY_CONSISTENCY',
      weight: 15.0,
      contribution: qualityContribution,
      explanation: `${input.quality_inspections_passed}/${input.total_quality_inspections} quality inspections passed (${Math.round(qualityRate * 100)}% pass rate, +${qualityContribution} pts).`
    });

    // 5. Dispute Penalty (Max Penalty: -15 points)
    const disputePenalty = Math.min(15.0, input.disputes_opened_against * 5.0);
    const disputeContribution = 15.0 - disputePenalty;
    evidence.push({
      signal: 'DISPUTE_HISTORY',
      weight: 15.0,
      contribution: disputeContribution,
      explanation: input.disputes_opened_against === 0 
        ? 'Clean trade record with 0 disputes opened against entity (+15 pts).' 
        : `${input.disputes_opened_against} disputes opened against entity (-${disputePenalty} pts penalty).`
    });

    // Sum total score bounded [0, 100]
    const totalScore = Math.max(0, Math.min(100.0, Math.round(
      identityContribution + farmContribution + fulfillmentContribution + qualityContribution + disputeContribution
    )));

    // Confidence depends on total completed trades
    let confidence = 0.70;
    if (input.total_orders_attempted >= 10) confidence = 0.95;
    else if (input.total_orders_attempted >= 3) confidence = 0.85;

    return {
      entity_id: input.entity_id,
      entity_type: input.entity_type,
      trust_score: totalScore,
      score_version: this.SCORE_VERSION,
      confidence,
      evidence,
      last_updated: new Date().toISOString()
    };
  }
}
