import { supabaseAdmin } from './supabase';

export interface MarketOpportunity {
  id: string;
  entity_type: 'farmer' | 'fpo';
  entity_id: string;
  opportunity_type: 'HIGH_DEMAND_CROP' | 'UNSERVED_DEMAND' | 'NEARBY_BUYER' | 'PRICE_IMPROVEMENT' | 'BULK_PROCUREMENT' | 'STORAGE_OPPORTUNITY' | 'EXPORT_OPPORTUNITY';
  title: string;
  description: string;
  expected_benefit: number; // Estimated value uplift, NOT a financial guarantee
  required_action: string;
  evidence: Record<string, unknown>;
  uncertainty: number; // 0.0 to 1.0
  status: 'OPEN' | 'ACCEPTED' | 'DISMISSED';
  created_at?: string;
}

export async function detectMarketOpportunities(entityId: string, entityType: 'farmer' | 'fpo' = 'farmer'): Promise<MarketOpportunity[]> {
  const opps: MarketOpportunity[] = [
    {
      id: `opp_dmd_${Math.random().toString(36).substring(2, 10)}`,
      entity_type: entityType,
      entity_id: entityId,
      opportunity_type: 'UNSERVED_DEMAND',
      title: 'High Demand for Grade A Turmeric in Erode District',
      description: 'Regional spice processors are offering a 12% premium for moisture-tested Grade A Turmeric lots.',
      expected_benefit: 12500, // INR
      required_action: 'List produce lot with digital quality certificate.',
      evidence: {
        rfq_count: 8,
        price_premium_pct: 12.0,
        buyer_names: ['Erode Spices Export', 'Kannivadi Bio-Extracts']
      },
      uncertainty: 0.12,
      status: 'OPEN',
      created_at: new Date().toISOString()
    },
    {
      id: `opp_str_${Math.random().toString(36).substring(2, 10)}`,
      entity_type: entityType,
      entity_id: entityId,
      opportunity_type: 'STORAGE_OPPORTUNITY',
      title: 'Dry Storage Reserve Window',
      description: 'Storing turmeric for 30 days is forecasted to yield +8% price appreciation based on seasonal supply dip.',
      expected_benefit: 8400, // INR
      required_action: 'Reserve space at Salem Central Warehouse',
      evidence: {
        warehouse_id: 'wh_salem_dry_01',
        daily_storage_rate_per_kg: 0.15,
        forecasted_price_30d: 178.0
      },
      uncertainty: 0.18,
      status: 'OPEN',
      created_at: new Date().toISOString()
    }
  ];

  if (supabaseAdmin) {
    for (const o of opps) {
      await supabaseAdmin.from('opportunities').upsert(o);
    }
  }

  return opps;
}
