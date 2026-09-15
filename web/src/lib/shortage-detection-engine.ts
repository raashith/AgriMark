import { supabase as supabaseAdmin } from './supabase';

export type ShortageClassification = 'NORMAL' | 'WATCH' | 'SHORTAGE_RISK' | 'SHORTAGE' | 'CRITICAL';

export interface ShortageAssessment {
  id: string;
  commodity: string;
  region: string;
  status_classification: ShortageClassification;
  available_supply_mt: number;
  expected_demand_mt: number;
  buffer_inventory_mt: number;
  inbound_logistics_mt: number;
  single_price_spike_override: false; // Explicit prohibition on inferring shortage from a single price spike
  confidence: number;
  evaluated_at: string;
}

export async function evaluateShortageRisk(
  commodity: string = 'Turmeric',
  region: string = 'Tamil Nadu',
  priceSpikeOnly: boolean = false
): Promise<ShortageAssessment> {
  const availableSupply = 18500;
  const expectedDemand = 22000;
  const bufferInventory = 3000;
  const inboundLogistics = 2500;

  const totalEffectiveSupply = availableSupply + bufferInventory + inboundLogistics;
  const coverageRatio = totalEffectiveSupply / expectedDemand;

  let classification: ShortageClassification = 'NORMAL';

  if (priceSpikeOnly) {
    // Rule: Never infer shortage from a single price spike alone
    classification = 'NORMAL';
  } else if (coverageRatio < 0.85) {
    classification = 'SHORTAGE';
  } else if (coverageRatio < 0.95) {
    classification = 'SHORTAGE_RISK';
  } else if (coverageRatio < 1.05) {
    classification = 'WATCH';
  }

  const assessment: ShortageAssessment = {
    id: `shortage_${commodity.toLowerCase()}_${region.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    commodity,
    region,
    status_classification: classification,
    available_supply_mt: availableSupply,
    expected_demand_mt: expectedDemand,
    buffer_inventory_mt: bufferInventory,
    inbound_logistics_mt: inboundLogistics,
    single_price_spike_override: false,
    confidence: 0.92,
    evaluated_at: new Date().toISOString()
  };

  if (supabaseAdmin) {
    await supabaseAdmin.from('shortage_alerts').upsert({
      id: assessment.id,
      commodity: assessment.commodity,
      region: assessment.region,
      status_classification: assessment.status_classification,
      available_supply_mt: assessment.available_supply_mt,
      expected_demand_mt: assessment.expected_demand_mt,
      buffer_inventory_mt: assessment.buffer_inventory_mt,
      inbound_logistics_mt: assessment.inbound_logistics_mt,
      single_price_spike_override: assessment.single_price_spike_override,
      confidence: assessment.confidence,
      evaluated_at: assessment.evaluated_at
    });
  }

  return assessment;
}
