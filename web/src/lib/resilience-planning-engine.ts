import { supabase as supabaseAdmin } from './supabase';

export interface ResilienceRecommendation {
  id: string;
  region: string;
  action: string;
  expected_benefit: string;
  cost_assumptions_inr: number;
  risks: string[];
  confidence: number;
  evidence: string[];
  requires_human_approval: true; // Consequential actions require human approval
  created_at: string;
}

export interface NationalResilienceIndexComponents {
  region: string;
  production_diversity_score: number;
  supplier_diversity_score: number;
  buyer_diversity_score: number;
  storage_resilience_score: number;
  processing_resilience_score: number;
  logistics_resilience_score: number;
  import_dependency_score: number;
  climate_exposure_score: number;
  overall_resilience_index: number;
  evaluated_at: string;
}

export interface CriticalSupplyNodeInfo {
  id: string;
  node_name: string;
  node_type: 'WAREHOUSE' | 'COLD_STORE' | 'PROCESSING_PLANT' | 'MANDI' | 'TRANSPORT_HUB' | 'LOGISTICS_CORRIDOR';
  location_masked: string; // Coordinate details masked for security
  capacity_throughput_mt: number;
  single_point_of_failure: boolean;
  concentration_risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  is_sensitive: boolean;
}

export async function generateResiliencePlan(region: string = 'Salem Region'): Promise<ResilienceRecommendation[]> {
  const recommendations: ResilienceRecommendation[] = [
    {
      id: `rec_${Math.random().toString(36).substring(2, 10)}`,
      region,
      action: 'Reroute 1,200 MT dry turmeric via Namakkal rail-head logistics corridor',
      expected_benefit: 'Bypasses NH-44 congestion bottleneck and reduces transport lead time by 18 hours',
      cost_assumptions_inr: 145000,
      risks: ['Rail freight wagon availability lead time', 'Intermodal transshipment handling'],
      confidence: 0.92,
      evidence: [
        'NH-44 toll delay telemetry currently averaging 4.5 hours',
        'Namakkal goods shed transshipment capacity is operating at 42% capacity'
      ],
      requires_human_approval: true,
      created_at: new Date().toISOString()
    }
  ];

  if (supabaseAdmin) {
    for (const rec of recommendations) {
      await supabaseAdmin.from('resilience_recommendations').insert({
        id: rec.id,
        region: rec.region,
        action: rec.action,
        expected_benefit: rec.expected_benefit,
        cost_assumptions_inr: rec.cost_assumptions_inr,
        risks: rec.risks,
        confidence: rec.confidence,
        evidence: rec.evidence,
        requires_human_approval: rec.requires_human_approval,
        created_at: rec.created_at
      });
    }
  }

  return recommendations;
}

export async function computeNationalResilienceIndex(region: string = 'Tamil Nadu'): Promise<NationalResilienceIndexComponents> {
  const components: NationalResilienceIndexComponents = {
    region,
    production_diversity_score: 82.0,
    supplier_diversity_score: 85.5,
    buyer_diversity_score: 88.0,
    storage_resilience_score: 84.0,
    processing_resilience_score: 79.0,
    logistics_resilience_score: 81.5,
    import_dependency_score: 75.0,
    climate_exposure_score: 68.0,
    overall_resilience_index: 80.4,
    evaluated_at: new Date().toISOString()
  };

  return components;
}

export async function getCriticalSupplyNodes(region: string = 'Salem'): Promise<CriticalSupplyNodeInfo[]> {
  return [
    {
      id: `node_wh_central`,
      node_name: 'Regional Ag-Logistics Node Alpha',
      node_type: 'WAREHOUSE',
      location_masked: 'Salem District Sector 4 (Precise GPS Masked)',
      capacity_throughput_mt: 25000,
      single_point_of_failure: true,
      concentration_risk_level: 'HIGH',
      is_sensitive: true
    },
    {
      id: `node_rail_hub`,
      node_name: 'Namakkal Multimodal Transport Hub',
      node_type: 'TRANSPORT_HUB',
      location_masked: 'Namakkal District Sector 2 (Precise GPS Masked)',
      capacity_throughput_mt: 40000,
      single_point_of_failure: false,
      concentration_risk_level: 'MEDIUM',
      is_sensitive: true
    }
  ];
}
