/**
 * AgriMark Phase 12 - Farmer Outcome Engine
 * Measures actual farmer financial & operational outcomes (income change, net realization,
 * price improvement, loss reduction) against historical baseline periods with evidence tracking.
 * Refrains from claiming 100% causal attribution to AgriMark alone.
 */

export interface OutcomeMeasurementInput {
  farmer_id: string;
  baseline_period: string;
  comparison_period: string;
  baseline_net_income_inr: number;
  comparison_net_income_inr: number;
  baseline_post_harvest_loss_percent: number;
  comparison_post_harvest_loss_percent: number;
  baseline_avg_mandi_price_inr: number;
  achieved_avg_price_inr: number;
}

export interface FarmerOutcomeReport {
  farmer_id: string;
  baseline_period: string;
  comparison_period: string;
  net_income_change_percent: number;
  income_growth_inr: number;
  post_harvest_loss_reduction_percent: number;
  price_realization_uplift_percent: number;
  evidence: string[];
  attribution_notes: string;
}

export class FarmerOutcomesEngine {
  public static calculateOutcomes(input: OutcomeMeasurementInput): FarmerOutcomeReport {
    const income_growth_inr = Math.round((input.comparison_net_income_inr - input.baseline_net_income_inr) * 100) / 100;
    
    const net_income_change_percent = input.baseline_net_income_inr > 0
      ? Math.round(((input.comparison_net_income_inr - input.baseline_net_income_inr) / input.baseline_net_income_inr) * 10000) / 100
      : 0;

    const post_harvest_loss_reduction_percent = Math.round(
      Math.max(0, input.baseline_post_harvest_loss_percent - input.comparison_post_harvest_loss_percent) * 100
    ) / 100;

    const price_realization_uplift_percent = input.baseline_avg_mandi_price_inr > 0
      ? Math.round(((input.achieved_avg_price_inr - input.baseline_avg_mandi_price_inr) / input.baseline_avg_mandi_price_inr) * 10000) / 100
      : 0;

    const evidence = [
      `Net seasonal income increased from ₹${input.baseline_net_income_inr.toLocaleString('en-IN')} to ₹${input.comparison_net_income_inr.toLocaleString('en-IN')}.`,
      `Post-harvest produce loss decreased from ${input.baseline_post_harvest_loss_percent}% to ${input.comparison_post_harvest_loss_percent}%.`,
      `Realized selling price of ₹${input.achieved_avg_price_inr}/QTL compared to baseline market price of ₹${input.baseline_avg_mandi_price_inr}/QTL.`
    ];

    return {
      farmer_id: input.farmer_id,
      baseline_period: input.baseline_period,
      comparison_period: input.comparison_period,
      net_income_change_percent,
      income_growth_inr,
      post_harvest_loss_reduction_percent,
      price_realization_uplift_percent,
      evidence,
      attribution_notes: 'Outcome measurements reflect combined effects of direct platform market access, climate conditions, regional price trends, and improved post-harvest handling. Income improvements are not attributed solely to AgriMark.'
    };
  }
}
