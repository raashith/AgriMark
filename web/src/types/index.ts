export type UserRole = 'farmer' | 'fpo' | 'buyer' | 'logistics' | 'service_provider' | 'admin';

export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string | null;
  phone?: string | null;
  phone_number?: string;
  role: UserRole;
  location?: string;
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
  created_at?: string;
}

export interface Cultivation {
  id: string;
  farm_id: string;
  crop_id: string;
  crop_name?: string;
  variety?: string;
  season?: string;
  sowing_date?: string | null;
  expected_harvest_date?: string | null;
  area_acres?: number | null;
  status: 'planned' | 'active' | 'harvested' | 'cancelled' | 'failed';
  created_at?: string;
}

export interface ProduceLot {
  id: string;
  owner_id?: string;
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
  quantity_available_kg?: number;
  quality_grade?: string;
  location?: string;
  seller_name?: string;
  status: 'active' | 'paused' | 'sold' | 'closed' | 'sold_out' | 'cancelled';
  created_at?: string;
}

export interface MarketplaceOrder {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  quantity: number;
  quantity_kg?: number;
  unit: string;
  unit_price: number;
  total_amount: number;
  total_price?: number;
  status: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';
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
