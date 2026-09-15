import { supabase as supabaseAdmin } from './supabase';

export type WasteType =
  | 'CROP_RESIDUE'
  | 'FOOD_WASTE'
  | 'PACKAGING'
  | 'ORGANIC_WASTE'
  | 'MANURE'
  | 'PROCESSING_BYPRODUCT';

export type ReusePathway =
  | 'COMPOST'
  | 'BIO_INPUTS'
  | 'ANIMAL_FEED'
  | 'BIOENERGY'
  | 'RECYCLING'
  | 'SOIL_AMENDMENT';

export type ValueType = 'OBSERVED' | 'ESTIMATED' | 'FORECAST';

export interface WasteMaterialListing {
  id: string;
  seller_id: string;
  waste_type: WasteType;
  source_description: string;
  quantity_kg: number;
  quality_grade: string;
  location: string;
  rate_per_kg: number;
  intended_use: ReusePathway;
  status: 'AVAILABLE' | 'MATCHED' | 'PROCESSED' | 'REJECTED';
  safety_approved: boolean; // Never recommend unsafe biological use
  created_at: string;
}

export interface CircularMatchResult {
  id: string;
  waste_id: string;
  buyer_id: string;
  processor_id?: string;
  match_score: number;
  route_details: {
    origin: string;
    destination: string;
    estimated_distance_km: number;
  };
  status: 'MATCHED' | 'CONFIRMED' | 'FULFILLED';
  matched_at: string;
}

export interface CircularValueMetrics {
  id: string;
  waste_diverted_kg: number;
  material_reused_kg: number;
  gross_economic_value_inr: number;
  processing_cost_inr: number;
  transport_cost_inr: number;
  net_value_inr: number;
  value_type: ValueType;
  calculated_at: string;
}

// Safety validator for biological waste reuse
export function validateBiologicalSafety(wasteType: WasteType, intendedUse: ReusePathway): { safe: boolean; reason?: string } {
  if (wasteType === 'MANURE' && intendedUse === 'ANIMAL_FEED') {
    return { safe: false, reason: 'UNSAFE_BIOLOGICAL_USE: Raw manure cannot be used directly for animal feed.' };
  }
  if (wasteType === 'PACKAGING' && (intendedUse === 'COMPOST' || intendedUse === 'ANIMAL_FEED' || intendedUse === 'BIO_INPUTS')) {
    return { safe: false, reason: 'UNSAFE_MATERIAL_USE: Non-biodegradable packaging cannot be processed into compost or feed.' };
  }
  return { safe: true };
}

export async function listWasteMaterial(
  listing: Omit<WasteMaterialListing, 'id' | 'status' | 'safety_approved' | 'created_at'>
): Promise<WasteMaterialListing> {
  const safetyCheck = validateBiologicalSafety(listing.waste_type, listing.intended_use);
  if (!safetyCheck.safe) {
    throw new Error(safetyCheck.reason || 'Unsafe material reuse pathway');
  }

  const record: WasteMaterialListing = {
    ...listing,
    id: `waste_${Math.random().toString(36).substring(2, 10)}`,
    status: 'AVAILABLE',
    safety_approved: true,
    created_at: new Date().toISOString()
  };

  if (supabaseAdmin) {
    await supabaseAdmin.from('waste_materials').insert({
      id: record.id,
      seller_id: record.seller_id,
      waste_type: record.waste_type,
      source_description: record.source_description,
      quantity_kg: record.quantity_kg,
      quality_grade: record.quality_grade,
      location: record.location,
      rate_per_kg: record.rate_per_kg,
      intended_use: record.intended_use,
      status: record.status,
      created_at: record.created_at
    });
  }

  return record;
}

export async function matchCircularDemand(
  wasteId: string,
  buyerId: string,
  processorId?: string
): Promise<CircularMatchResult> {
  const match: CircularMatchResult = {
    id: `circ_match_${Math.random().toString(36).substring(2, 10)}`,
    waste_id: wasteId,
    buyer_id: buyerId,
    processor_id: processorId || `proc_${Math.random().toString(36).substring(2, 8)}`,
    match_score: 94.5,
    route_details: {
      origin: 'Salem Cluster North',
      destination: 'Namakkal Bio-Compost Facility',
      estimated_distance_km: 24.5
    },
    status: 'MATCHED',
    matched_at: new Date().toISOString()
  };

  if (supabaseAdmin) {
    await supabaseAdmin.from('circular_matches').insert({
      id: match.id,
      waste_id: match.waste_id,
      buyer_id: match.buyer_id,
      processor_id: match.processor_id,
      match_score: match.match_score,
      status: match.status,
      matched_at: match.matched_at
    });
  }

  return match;
}

export async function computeCircularValue(
  quantityKg: number = 2500,
  ratePerKg: number = 4.5,
  valueType: ValueType = 'OBSERVED'
): Promise<CircularValueMetrics> {
  const grossValue = quantityKg * ratePerKg;
  const processingCost = quantityKg * 0.8;
  const transportCost = 1200;
  const netValue = grossValue - (processingCost + transportCost);

  const metrics: CircularValueMetrics = {
    id: `circ_val_${Date.now()}`,
    waste_diverted_kg: quantityKg,
    material_reused_kg: quantityKg * 0.92,
    gross_economic_value_inr: grossValue,
    processing_cost_inr: processingCost,
    transport_cost_inr: transportCost,
    net_value_inr: netValue,
    value_type: valueType,
    calculated_at: new Date().toISOString()
  };

  return metrics;
}
