import { supabase as supabaseAdmin } from './supabase';

export type SimulationScenarioType =
  | 'PROD_DECLINE_10'
  | 'PROD_DECLINE_25'
  | 'MAJOR_FLOOD'
  | 'MAJOR_DROUGHT'
  | 'IMPORT_INTERRUPTION'
  | 'EXPORT_SURGE'
  | 'WAREHOUSE_OUTAGE'
  | 'TRANSPORT_DISRUPTION'
  | 'PROCESSING_CAPACITY_LOSS';

export interface ScenarioSimulationResult {
  id: string;
  scenario_type: SimulationScenarioType;
  commodity: string;
  region: string;
  simulated_supply_gap_mt: number;
  price_pressure_index: number; // 1.0 = baseline
  inventory_depletion_days: number;
  regional_effects: Record<string, any>;
  data_origin: 'SIMULATION'; // Mandatory simulation marker
  disclaimer: string;
  simulated_at: string;
}

export async function runScenarioSimulation(
  scenarioType: SimulationScenarioType = 'PROD_DECLINE_25',
  commodity: string = 'Turmeric',
  region: string = 'Tamil Nadu'
): Promise<ScenarioSimulationResult> {
  const supplyGap = scenarioType === 'PROD_DECLINE_25' ? 11250 : 4500;
  const priceIndex = scenarioType === 'PROD_DECLINE_25' ? 1.32 : 1.12;

  const result: ScenarioSimulationResult = {
    id: `sim_${scenarioType.toLowerCase()}_${Date.now()}`,
    scenario_type: scenarioType,
    commodity,
    region,
    simulated_supply_gap_mt: supplyGap,
    price_pressure_index: priceIndex,
    inventory_depletion_days: 42,
    regional_effects: {
      affected_districts: ['Salem', 'Erode', 'Namakkal'],
      estimated_price_increase_pct: Math.round((priceIndex - 1.0) * 100),
      buffer_depletion_rate_pct_per_week: 14.5
    },
    data_origin: 'SIMULATION',
    disclaimer: 'SIMULATION OUTPUT ONLY: Results represent synthetic modeling scenarios and must not be interpreted as empirical forecasts or actual facts.',
    simulated_at: new Date().toISOString()
  };

  if (supabaseAdmin) {
    await supabaseAdmin.from('scenario_simulations').insert({
      id: result.id,
      scenario_type: result.scenario_type,
      commodity: result.commodity,
      region: result.region,
      simulated_supply_gap_mt: result.simulated_supply_gap_mt,
      price_pressure_index: result.price_pressure_index,
      inventory_depletion_days: result.inventory_depletion_days,
      regional_effects: result.regional_effects,
      data_origin: result.data_origin,
      simulated_at: result.simulated_at
    });
  }

  return result;
}
