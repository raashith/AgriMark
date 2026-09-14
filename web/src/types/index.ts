export type UserRole = 'farmer' | 'fpo' | 'buyer' | 'logistics' | 'service_provider' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  role: UserRole;
  location?: string;
  created_at?: string;
}

export interface Farm {
  id: string;
  name: string;
  location: string;
  area_acres: number;
  soil_type?: string;
  irrigation_source?: string;
  created_at?: string;
}

export interface Cultivation {
  id: string;
  farm_id: string;
  crop_name: string;
  variety?: string;
  sowing_date: string;
  expected_harvest_date?: string;
  area_acres: number;
  status: 'active' | 'harvested' | 'failed';
  created_at?: string;
}

export interface ProduceLot {
  id: string;
  farm_id: string;
  crop_name: string;
  quantity_kg: number;
  harvest_date: string;
  quality_grade: string;
  storage_location?: string;
  is_listed?: boolean;
  created_at?: string;
}

export interface Listing {
  id: string;
  produce_lot_id: string;
  seller_id: string;
  seller_name?: string;
  crop_name: string;
  quantity_available_kg: number;
  price_per_kg: number;
  min_order_quantity_kg: number;
  quality_grade: string;
  location: string;
  status: 'active' | 'sold_out' | 'cancelled';
  created_at?: string;
}

export interface MarketplaceOrder {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  quantity_kg: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';
  created_at?: string;
}

export interface MarketPriceObservation {
  id: string;
  mandi_name: string;
  commodity: string;
  observation_date: string;
  min_price: number;
  modal_price: number;
  max_price: number;
  unit: string;
  source: string;
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
