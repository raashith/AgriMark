import { supabase as supabaseAdmin } from './supabase';

export interface InfrastructureTwinState {
  id: string;
  facility_id: string;
  facility_type: 'warehouse' | 'cold_storage' | 'processing' | 'transport_hub' | 'road' | 'market';
  total_capacity: number;
  utilization_pct: number;
  operational_status: string;
  maintenance_flag: boolean;
  district_code: string;
  updated_at?: string;
}

export interface MarketTwinState {
  id: string;
  mandi_code: string;
  commodity_code: string;
  supply_mt: number;
  demand_mt: number;
  simulated_price_per_qt: number;
  is_simulated: boolean;
  arrival_mt: number;
  inventory_mt: number;
  disclaimer: string;
  state_timestamp: string;
}

export interface SupplyTwinState {
  id: string;
  district_code: string;
  commodity_code: string;
  production_balance_mt: number;
  surplus_mt: number;
  deficit_mt: number;
  storage_coverage_days: number;
  processing_capacity_mt: number;
  logistics_bottleneck_flag: boolean;
  updated_at?: string;
}

export class InfrastructureMarketSupplyTwinEngine {
  static simulateMarketPrice(commodity: string, supply_mt: number, demand_mt: number): MarketTwinState {
    const basePrice = 2400; // INR / Quintal baseline
    const supplyDemandRatio = demand_mt > 0 ? supply_mt / demand_mt : 1.0;
    
    // Elasticity factor
    let simulatedPrice = basePrice * (1.5 - 0.5 * supplyDemandRatio);
    simulatedPrice = Math.max(1200, Math.min(6000, Math.round(simulatedPrice)));

    return {
      id: `MKT-SIM-${Date.now()}`,
      mandi_code: 'TN-SLM-01',
      commodity_code: commodity,
      supply_mt,
      demand_mt,
      simulated_price_per_qt: simulatedPrice,
      is_simulated: true,
      arrival_mt: Math.round(supply_mt * 0.8),
      inventory_mt: Math.round(supply_mt * 0.2),
      disclaimer: 'SIMULATION ONLY: Simulated price derived from computational model. Not a live market price or transaction quote.',
      state_timestamp: new Date().toISOString(),
    };
  }

  static calculateSupplyBalance(district_code: string, commodity: string, production_mt: number, consumption_mt: number): SupplyTwinState {
    const balance = production_mt - consumption_mt;
    const surplus = Math.max(0, balance);
    const deficit = Math.max(0, -balance);
    const storage_coverage_days = consumption_mt > 0 ? Math.round((production_mt / (consumption_mt / 30)) * 10) / 10 : 90;

    return {
      id: `SUP-${district_code}-${commodity}`,
      district_code,
      commodity_code: commodity,
      production_balance_mt: balance,
      surplus_mt: surplus,
      deficit_mt: deficit,
      storage_coverage_days,
      processing_capacity_mt: 5000,
      logistics_bottleneck_flag: deficit > 1000,
      updated_at: new Date().toISOString(),
    };
  }
}
