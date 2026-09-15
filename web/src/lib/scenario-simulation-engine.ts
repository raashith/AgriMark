import { supabase as supabaseAdmin } from './supabase';

export type ScenarioType =
  | 'drought' | 'flood' | 'heatwave' | 'pest_outbreak' | 'disease_outbreak'
  | 'fertilizer_shortage' | 'fuel_price_shock' | 'transport_disruption'
  | 'market_demand_shock' | 'crop_failure' | 'export_restriction' | 'import_disruption' | 'custom'
  | 'PROD_DECLINE_25' | 'LOGISTICS_STRIKE_7D' | 'IMPORT_HALT_14D' | 'HEATWAVE_SEASONAL';

export type SimulationScenarioType = ScenarioType;

export interface SimulationScenario {
  id: string;
  title: string;
  scenario_type: ScenarioType;
  assumptions: Record<string, any>;
  affected_regions: string[];
  affected_commodities: string[];
  severity: 'MILD' | 'MODERATE' | 'SEVERE' | 'EXTREME';
  duration_days: number;
  start_time: string;
  end_time?: string;
  data_origin: string;
  created_at?: string;
}

export interface SimulationResult {
  id: string;
  run_id: string;
  baseline_metrics: Record<string, any>;
  simulated_metrics: Record<string, any>;
  variance_metrics: Record<string, any>;
  confidence_score: number;
  uncertainty_bound: { p10: number; p50: number; p90: number };
  created_at?: string;
}

// Simple deterministic Mulberry32 Pseudo-Random Generator for reproducible Monte Carlo
function seededRandom(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class ScenarioSimulationEngine {
  static async createScenario(scenario: Omit<SimulationScenario, 'created_at'>): Promise<SimulationScenario> {
    const record: SimulationScenario = {
      ...scenario,
      created_at: new Date().toISOString(),
    };
    if (process.env.NODE_ENV !== 'test') {
      await supabaseAdmin.from('simulation_scenarios').insert([record]);
    }
    return record;
  }

  static runMonteCarloSimulation(params: {
    baselineProductionMT: number;
    scenarioSeverity: 'MILD' | 'MODERATE' | 'SEVERE' | 'EXTREME';
    randomSeed?: number;
    runsCount?: number;
  }): {
    runs: number[];
    mean: number;
    variance: number;
    p10: number;
    p50: number;
    p90: number;
    randomSeed: number;
  } {
    const seed = params.randomSeed ?? 42;
    const count = params.runsCount ?? 100;
    const rng = seededRandom(seed);

    let reductionFactor = 0.1;
    if (params.scenarioSeverity === 'MODERATE') reductionFactor = 0.25;
    if (params.scenarioSeverity === 'SEVERE') reductionFactor = 0.45;
    if (params.scenarioSeverity === 'EXTREME') reductionFactor = 0.65;

    const runs: number[] = [];
    for (let i = 0; i < count; i++) {
      const u1 = Math.max(0.0001, rng());
      const u2 = Math.max(0.0001, rng());
      const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

      const runLossPct = Math.max(0, Math.min(1.0, reductionFactor + z * 0.05));
      const simulatedYield = params.baselineProductionMT * (1.0 - runLossPct);
      runs.push(Math.round(simulatedYield));
    }

    runs.sort((a, b) => a - b);
    const mean = Math.round(runs.reduce((acc, v) => acc + v, 0) / count);
    const p10 = runs[Math.floor(count * 0.10)];
    const p50 = runs[Math.floor(count * 0.50)];
    const p90 = runs[Math.floor(count * 0.90)];

    const variance = Math.round(
      runs.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / count
    );

    return {
      runs,
      mean,
      variance,
      p10,
      p50,
      p90,
      randomSeed: seed,
    };
  }
}

export async function runScenarioSimulation(
  scenarioType: SimulationScenarioType,
  commodity: string,
  region: string
) {
  const mc = ScenarioSimulationEngine.runMonteCarloSimulation({
    baselineProductionMT: 50000,
    scenarioSeverity: scenarioType === 'PROD_DECLINE_25' ? 'MODERATE' : 'SEVERE',
    randomSeed: 42,
    runsCount: 100,
  });

  return {
    scenario_type: scenarioType,
    commodity,
    region,
    baseline_production_mt: 50000,
    projected_production_mt: mc.mean,
    p10_pessimistic_mt: mc.p10,
    p90_optimistic_mt: mc.p90,
    variance: mc.variance,
    confidence_score: 0.92,
    disclaimer: 'COMPUTATIONAL MODEL ONLY: Simulation output for food security analysis.'
  };
}
