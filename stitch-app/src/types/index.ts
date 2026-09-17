export type UserRole = 'farmer' | 'buyer' | 'fpo' | 'logistics' | 'admin';

export interface UserProfile {
  id: string;
  email?: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  location?: string;
  district?: string;
  state?: string;
  organization_name?: string;
  is_verified?: boolean;
  trust_score?: number;
  created_at?: string;
}

export interface Farm {
  id: string;
  owner_id: string;
  name: string;
  acreage: number;
  location_address: string;
  district: string;
  state: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  soil_type?: string;
  soil_ph?: number;
  organic_carbon_pct?: number;
  ror_number?: string;
  ror_verified?: boolean;
  created_at?: string;
}

export interface Cultivation {
  id: string;
  farm_id: string;
  crop_name: string;
  variety?: string;
  area_acres: number;
  sowing_date: string;
  expected_harvest_date?: string;
  status: 'planned' | 'sown' | 'growing' | 'flowering' | 'fruiting' | 'harvested' | 'completed';
  yield_forecast_kg?: number;
  created_at?: string;
}

export interface FieldObservation {
  id: string;
  cultivation_id: string;
  observation_type: 'pest' | 'disease' | 'nutrient' | 'irrigation' | 'general';
  severity: 'low' | 'medium' | 'high' | 'critical';
  notes: string;
  photo_url?: string;
  audio_url?: string;
  latitude?: number;
  longitude?: number;
  ai_diagnosis?: string;
  created_at?: string;
}

export interface InputLog {
  id: string;
  cultivation_id: string;
  input_name: string;
  category: 'fertilizer' | 'pesticide' | 'seed' | 'growth_promoter' | 'equipment';
  quantity: number;
  unit: string;
  cost: number;
  application_date: string;
  supplier?: string;
  created_at?: string;
}

export interface HarvestBatch {
  id: string;
  cultivation_id: string;
  harvest_date: string;
  total_quantity_kg: number;
  grade_a_kg: number;
  grade_b_kg: number;
  grade_c_kg: number;
  moisture_pct?: number;
  curing_hours?: number;
  lot_code: string;
  created_at?: string;
}

export interface ProduceLot {
  id: string;
  harvest_batch_id: string;
  crop_name: string;
  variety?: string;
  quantity_available_kg: number;
  escrow_locked_kg: number;
  grade: 'Grade A' | 'Grade B' | 'Grade C';
  assay_tag?: string;
  origin_farm_name: string;
  district: string;
  state: string;
  created_at?: string;
}

export interface Listing {
  id: string;
  produce_lot_id: string;
  seller_id: string;
  crop_name: string;
  variety?: string;
  quantity_kg: number;
  price_per_kg: number;
  mandi_reference_price?: number;
  location: string;
  district: string;
  state: string;
  grade: string;
  status: 'active' | 'sold' | 'cancelled' | 'pending';
  photos?: string[];
  description?: string;
  seller_name?: string;
  seller_trust_score?: number;
  created_at?: string;
}

export interface Order {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  quantity_kg: number;
  total_amount: number;
  escrow_amount: number;
  status: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'disputed' | 'completed' | 'cancelled';
  delivery_address: string;
  reefer_temp_c?: number;
  gate_pass_qr?: string;
  bay_number?: string;
  created_at?: string;
}

export interface BuyerRFQ {
  id: string;
  buyer_id: string;
  crop_name: string;
  target_quantity_kg: number;
  target_price_per_kg: number;
  preferred_district: string;
  delivery_deadline: string;
  status: 'open' | 'fulfilled' | 'closed';
  created_at?: string;
}

export interface Dispute {
  id: string;
  order_id: string;
  raised_by: string;
  reason: string;
  description: string;
  evidence_urls?: string[];
  status: 'open' | 'under_review' | 'resolved' | 'rejected';
  resolution_notes?: string;
  created_at?: string;
}

export interface FinanceEntry {
  id: string;
  farm_id?: string;
  profile_id: string;
  entry_type: 'income' | 'expense';
  category: 'produce_sale' | 'input_purchase' | 'labor' | 'logistics' | 'equipment' | 'other';
  amount: number;
  description: string;
  entry_date: string;
  created_at?: string;
}
