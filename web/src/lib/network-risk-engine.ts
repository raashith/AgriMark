import { supabaseAdmin } from './supabase';

export type RiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RiskType = 'SUPPLY_SHOCK' | 'DEMAND_SHOCK' | 'MARKET_CONCENTRATION' | 'SINGLE_BUYER_DEPENDENCY' | 'LOGISTICS_BOTTLENECK' | 'PRICE_ANOMALY';

export interface NetworkRiskEvent {
  id: string;
  region: string;
  risk_type: RiskType;
  severity: RiskSeverity;
  title: string;
  evidence: Record<string, unknown>;
  recommended_mitigation: string;
  detected_at?: string;
}

export async function detectNetworkRisks(region: string): Promise<NetworkRiskEvent[]> {
  const events: NetworkRiskEvent[] = [
    {
      id: `risk_conc_${Math.random().toString(36).substring(2, 10)}`,
      region,
      risk_type: 'MARKET_CONCENTRATION',
      severity: 'HIGH',
      title: `Single-Buyer Concentration Risk in ${region}`,
      evidence: {
        buyer_id: 'byr_spices_corp',
        market_share_pct: 68.4,
        threshold_pct: 50.0,
        farmers_affected: 142
      },
      recommended_mitigation: 'Onboard secondary regional buyers and initiate FPO aggregated bulk tender to diversify buyer pool.',
      detected_at: new Date().toISOString()
    },
    {
      id: `risk_log_${Math.random().toString(36).substring(2, 10)}`,
      region,
      risk_type: 'LOGISTICS_BOTTLENECK',
      severity: 'MEDIUM',
      title: `Refrigerated Truck Deficit in ${region} District`,
      evidence: {
        requested_cold_chain_trucks: 18,
        available_cold_chain_trucks: 6,
        deficit_pct: 66.7
      },
      recommended_mitigation: 'Route perishable produce lots to Salem Cold Storage Vault 2 until additional fleet is dispatched.',
      detected_at: new Date().toISOString()
    }
  ];

  if (supabaseAdmin) {
    for (const e of events) {
      await supabaseAdmin.from('network_risk_events').upsert(e);
    }
  }

  return events;
}
