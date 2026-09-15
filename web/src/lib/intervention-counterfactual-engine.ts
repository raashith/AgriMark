import { supabase as supabaseAdmin } from './supabase';

export type InterventionType =
  | 'additional_irrigation'
  | 'storage_expansion'
  | 'logistics_rerouting'
  | 'crop_diversification'
  | 'processing_expansion'
  | 'market_redistribution'
  | 'water_conservation'
  | 'fpo_aggregation';

export interface InterventionComparison {
  id: string;
  run_id: string;
  intervention_type: InterventionType;
  cost_inr: number;
  production_effect_pct: number;
  water_effect_mcm: number;
  food_security_effect_score: number;
  logistics_efficiency_gain_pct: number;
  farmer_income_change_pct: number;
  created_at?: string;
}

export interface CounterfactualRun {
  id: string;
  run_id: string;
  output_tag: 'COUNTERFACTUAL_SIMULATION';
  hypothetical_variable: string;
  observed_baseline: Record<string, any>;
  counterfactual_outcome: Record<string, any>;
  delta_explanation: string;
  created_at?: string;
}

export class InterventionCounterfactualEngine {
  static simulateIntervention(params: {
    run_id: string;
    intervention_type: InterventionType;
    investment_amount_inr: number;
  }): InterventionComparison {
    let prodEffect = 5.0;
    let waterEffect = -10.0;
    let foodScore = 75;
    let logisticsGain = 0;
    let incomeChange = 8.5;

    if (params.intervention_type === 'additional_irrigation') {
      prodEffect = 18.5;
      waterEffect = 45.0;
      foodScore = 88;
      incomeChange = 14.2;
    } else if (params.intervention_type === 'storage_expansion') {
      prodEffect = 2.0;
      waterEffect = 0.0;
      foodScore = 92;
      logisticsGain = 25.0;
      incomeChange = 11.0;
    } else if (params.intervention_type === 'logistics_rerouting') {
      logisticsGain = 35.0;
      incomeChange = 6.4;
      foodScore = 80;
    }

    return {
      id: `INT-${Date.now()}`,
      run_id: params.run_id,
      intervention_type: params.intervention_type,
      cost_inr: params.investment_amount_inr,
      production_effect_pct: prodEffect,
      water_effect_mcm: waterEffect,
      food_security_effect_score: foodScore,
      logistics_efficiency_gain_pct: logisticsGain,
      farmer_income_change_pct: incomeChange,
      created_at: new Date().toISOString(),
    };
  }

  static runCounterfactual(params: {
    run_id: string;
    hypothetical_variable: string;
    observed_baseline: Record<string, any>;
    hypothetical_value: any;
  }): CounterfactualRun {
    const outcome = {
      ...params.observed_baseline,
      simulated_with: params.hypothetical_variable,
      hypothetical_value: params.hypothetical_value,
      projected_yield_mt: (params.observed_baseline.yield_mt || 1000) * 1.25,
      risk_reduced_pct: 30,
    };

    return {
      id: `CF-${Date.now()}`,
      run_id: params.run_id,
      output_tag: 'COUNTERFACTUAL_SIMULATION',
      hypothetical_variable: params.hypothetical_variable,
      observed_baseline: params.observed_baseline,
      counterfactual_outcome: outcome,
      delta_explanation: `If ${params.hypothetical_variable} were ${JSON.stringify(params.hypothetical_value)}, regional production would have increased by 25% with 30% reduced climate vulnerability.`,
      created_at: new Date().toISOString(),
    };
  }
}
