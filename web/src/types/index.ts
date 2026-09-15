export type UserRole = 'farmer' | 'fpo' | 'buyer' | 'logistics' | 'service_provider' | 'admin';

export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string | null;
  phone?: string | null;
  phone_number?: string;
  role: UserRole;
  location?: string;
  village?: string;
  district?: string;
  state?: string;
  avatar_url?: string;
  kyc_status?: 'unverified' | 'pending' | 'verified' | 'rejected';
  needs_onboarding?: boolean;
  created_at?: string;
}

export interface Farm {
  id: string;
  owner_id?: string;
  name?: string | null;
  village?: string | null;
  district?: string | null;
  state?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  location?: string;
  area_acres?: number | null;
  soil_type?: string;
  irrigation_source?: string;
  water_source?: string;
  electricity_available?: boolean;
  tenancy_type?: 'owned' | 'leased' | 'sharecropping';
  infrastructure?: string[];
  created_at?: string;
}

export interface CropCatalogItem {
  id: string;
  name: string;
  hindi_name?: string;
  tamil_name?: string;
  category: 'Cereals' | 'Pulses' | 'Oilseeds' | 'Spices' | 'Vegetables' | 'Fruits' | 'Cash Crops';
  typical_duration_days: number;
  season: 'Kharif' | 'Rabi' | 'Zaid' | 'Perennial';
  agronomy_tips?: string;
}

export interface Cultivation {
  id: string;
  farm_id: string;
  farmer_id?: string;
  crop_id: string;
  crop_name?: string;
  variety?: string;
  season?: string;
  sowing_date?: string | null;
  expected_harvest_date?: string | null;
  area_acres?: number | null;
  expected_yield_kg?: number | null;
  status: 'planned' | 'active' | 'harvested' | 'cancelled' | 'failed';
  organic_practice?: boolean;
  seed_variety?: string;
  agronomy_notes?: string;
  budget_inr?: number;
  created_at?: string;
}

export interface FieldObservation {
  id: string;
  cultivation_id: string;
  farm_id: string;
  crop_stage: string;
  plant_health_score: number; // 1-10
  pest_pressure: 'none' | 'low' | 'moderate' | 'high' | 'severe';
  disease_pressure: 'none' | 'low' | 'moderate' | 'high' | 'severe';
  weed_pressure: 'none' | 'low' | 'moderate' | 'high';
  soil_moisture_pct?: number;
  rainfall_mm?: number;
  temp_c?: number;
  notes?: string;
  photo_urls?: string[];
  observed_at: string;
}

export interface HarvestBatch {
  id: string;
  cultivation_id: string;
  harvest_date: string;
  total_quantity_kg: number;
  quality_grade: 'Grade A' | 'Grade B' | 'Grade C' | 'Export Quality';
  moisture_pct?: number;
  rejection_pct?: number;
  packaging_type?: string;
  storage_requirement?: string;
  trace_code: string;
  created_at?: string;
}

export interface ProduceLot {
  id: string;
  owner_id?: string;
  harvest_batch_id?: string;
  cultivation_id?: string | null;
  crop_id: string;
  crop_name?: string;
  quantity: number;
  quantity_kg?: number;
  unit: string;
  quality_grade?: string | null;
  available_quantity?: number | null;
  harvested_at?: string | null;
  harvest_date?: string;
  storage_location?: string;
  trace_code?: string;
  is_listed?: boolean;
  status?: 'available' | 'reserved' | 'sold' | 'expired';
  created_at?: string;
}

export interface Listing {
  id: string;
  seller_id: string;
  lot_id: string;
  produce_lot_id?: string;
  title: string;
  price_per_unit: number;
  price_per_kg?: number;
  currency: string;
  min_order_quantity: number;
  min_order_quantity_kg?: number;
  crop_name?: string;
  crop_category?: string;
  quantity_available_kg?: number;
  quality_grade?: string;
  location?: string;
  district?: string;
  state?: string;
  seller_name?: string;
  seller_rating?: number;
  images?: string[];
  description?: string;
  status: 'active' | 'paused' | 'sold' | 'closed' | 'sold_out' | 'cancelled';
  created_at?: string;
}

export interface MarketplaceOrder {
  id: string;
  listing_id: string;
  listing_title?: string;
  buyer_id: string;
  buyer_name?: string;
  seller_id: string;
  seller_name?: string;
  quantity: number;
  quantity_kg?: number;
  unit: string;
  unit_price: number;
  total_amount: number;
  total_price?: number;
  status: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';
  payment_status?: 'pending' | 'escrowed' | 'released' | 'refunded';
  delivery_address?: string;
  created_at?: string;
}

export interface RFQ {
  id: string;
  buyer_id: string;
  buyer_name?: string;
  crop_name: string;
  required_quantity_kg: number;
  target_price_per_kg: number;
  quality_grade?: string;
  location?: string;
  needed_by_date?: string;
  status: 'open' | 'closed' | 'fulfilled';
  created_at?: string;
}

export interface Offer {
  id: string;
  rfq_id: string;
  seller_id: string;
  seller_name?: string;
  offered_price_per_kg: number;
  quantity_offered_kg: number;
  terms?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at?: string;
}

export interface MarketPriceObservation {
  id: string;
  crop_id?: string;
  market_name?: string;
  mandi_name?: string;
  district?: string;
  state?: string;
  commodity?: string;
  observation_date?: string;
  observed_at?: string;
  price?: number | null;
  min_price?: number | null;
  modal_price?: number | null;
  max_price?: number | null;
  unit: string;
  source_name?: string;
  source?: string;
  source_uri?: string | null;
}

export interface MarketIntelligenceSignal {
  commodity: string;
  market_reference: MarketPriceObservation;
  farmer_asking_price?: number;
  trend_signal: 'rising' | 'falling' | 'stable';
  confidence_score: number;
  forecast_horizon_days: number;
  freshness_timestamp: string;
}

export interface WeatherForecast {
  location: string;
  district: string;
  date: string;
  temp_c: number;
  temp_min_c: number;
  temp_max_c: number;
  condition: 'Sunny' | 'Partly Cloudy' | 'Cloudy' | 'Light Rain' | 'Heavy Rain' | 'Thunderstorm';
  humidity_pct: number;
  rainfall_mm: number;
  wind_speed_kmh: number;
  crop_warning?: string;
  alert_level?: 'normal' | 'advisory' | 'warning' | 'severe';
}

export interface FinanceRecord {
  id: string;
  user_id: string;
  farm_id?: string;
  cultivation_id?: string;
  type: 'income' | 'expense';
  category: 'Crop Sales' | 'Government Subsidy' | 'Seeds' | 'Fertilizers' | 'Pesticides' | 'Labour' | 'Machinery' | 'Irrigation' | 'Logistics' | 'Other';
  amount: number;
  transaction_date: string;
  payment_status: 'paid' | 'pending' | 'overdue';
  description?: string;
  reference_no?: string;
  created_at?: string;
}

export interface FarmTask {
  id: string;
  user_id: string;
  farm_id?: string;
  cultivation_id?: string;
  title: string;
  description?: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_recurring?: boolean;
  status: 'pending' | 'in_progress' | 'completed';
  category?: 'Sowing' | 'Irrigation' | 'Fertigation' | 'Pest Control' | 'Harvesting' | 'Market' | 'Maintenance';
  created_at?: string;
}

export interface FarmerDocument {
  id: string;
  user_id: string;
  doc_type: 'Land Record (Patta/Chitta)' | 'Aadhaar ID' | 'Kisan Credit Card' | 'Soil Test Report' | 'Organic Certification' | 'FPO Membership' | 'Trade License';
  doc_number?: string;
  issuing_authority?: string;
  issue_date?: string;
  expiry_date?: string;
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
  file_url: string;
  extracted_info?: string;
  is_private: boolean;
  created_at?: string;
}

export interface ColdStorage {
  id: string;
  name: string;
  district: string;
  state: string;
  total_capacity_tons: number;
  available_capacity_tons: number;
  temp_range_c: string;
  humidity_range_pct: string;
  price_per_ton_day: number;
  contact_phone: string;
}

export interface LogisticsRequest {
  id: string;
  order_id?: string;
  pickup_location: string;
  delivery_location: string;
  crop_name: string;
  weight_kg: number;
  vehicle_type: 'Mini Truck (1.5 Ton)' | 'Medium Truck (5 Ton)' | 'Refrigerated Van (3 Ton)' | 'Heavy Lorry (10 Ton)';
  status: 'requested' | 'assigned' | 'in_transit' | 'delivered';
  tracking_code: string;
  driver_name?: string;
  driver_phone?: string;
  created_at?: string;
}

export interface AiInteraction {
  id: string;
  user_id?: string;
  query: string;
  response: string;
  context?: string;
  model: string;
  created_at?: string;
}

