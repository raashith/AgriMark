/**
 * AgriMark Phase 12 - Insurance Risk Intelligence Engine
 * Evaluates agricultural crop risk profiles, hazard exposures (flood, drought, heat stress, pest outbreak),
 * and estimated financial exposure for underwriting decision support.
 * Does not approve claims or issue policies autonomously.
 */

export interface InsuranceEvaluationInput {
  farm_id: string;
  commodity_code: string;
  acreage_hectares: number;
  state_code: string;
  district_code: string;
  historical_yield_variance_percent: number;
  drought_risk_index: number; // 0 to 1
  flood_risk_index: number;   // 0 to 1
  heat_stress_index: number;  // 0 to 1
  estimated_crop_value_inr: number;
}

export interface InsuranceRiskProfileResult {
  farm_id: string;
  commodity_code: string;
  geography: string;
  risk_profile: 'LOW_HAZARD' | 'MODERATE_HAZARD' | 'HIGH_HAZARD' | 'CRITICAL_HAZARD';
  hazards: { hazard_type: string; severity: string; score: number }[];
  estimated_exposure_inr: number;
  evidence: string[];
  disclaimer: string;
}

export class InsuranceIntelligenceEngine {
  public static evaluateInsuranceRisk(input: InsuranceEvaluationInput): InsuranceRiskProfileResult {
    const hazards: { hazard_type: string; severity: string; score: number }[] = [];
    const evidence: string[] = [];

    if (input.drought_risk_index > 0.5) {
      hazards.push({ hazard_type: 'DROUGHT_STRESS', severity: input.drought_risk_index > 0.75 ? 'HIGH' : 'MODERATE', score: input.drought_risk_index });
      evidence.push(`Elevated drought risk index of ${input.drought_risk_index} detected in ${input.district_code}.`);
    }

    if (input.flood_risk_index > 0.5) {
      hazards.push({ hazard_type: 'FLOOD_INUNDATION', severity: input.flood_risk_index > 0.75 ? 'HIGH' : 'MODERATE', score: input.flood_risk_index });
      evidence.push(`Elevated flood risk index of ${input.flood_risk_index} detected in ${input.district_code}.`);
    }

    if (input.heat_stress_index > 0.5) {
      hazards.push({ hazard_type: 'HEAT_STRESS', severity: input.heat_stress_index > 0.75 ? 'HIGH' : 'MODERATE', score: input.heat_stress_index });
      evidence.push(`Heat stress index of ${input.heat_stress_index} calculated during peak flowering window.`);
    }

    if (input.historical_yield_variance_percent > 20.0) {
      evidence.push(`Historical regional yield variance of ${input.historical_yield_variance_percent}% observed.`);
    }

    let risk_profile: 'LOW_HAZARD' | 'MODERATE_HAZARD' | 'HIGH_HAZARD' | 'CRITICAL_HAZARD' = 'LOW_HAZARD';
    if (hazards.length >= 2 || input.historical_yield_variance_percent > 30.0) {
      risk_profile = 'HIGH_HAZARD';
    } else if (hazards.length === 1) {
      risk_profile = 'MODERATE_HAZARD';
    }

    return {
      farm_id: input.farm_id,
      commodity_code: input.commodity_code,
      geography: `${input.district_code}, ${input.state_code}`,
      risk_profile,
      hazards,
      estimated_exposure_inr: input.estimated_crop_value_inr,
      evidence,
      disclaimer: 'DISCLAIMER: Insurance risk profiles provide decision-support hazard metrics for authorized insurance underwriters. AgriMark does not adjudicate claims or issue regulated insurance policies.'
    };
  }
}
