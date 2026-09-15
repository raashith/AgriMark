-- Migration: phase9_regional_scale_indexes
-- Purpose: Schema expansions and database scale performance indexes for FPO network, regional search, market intelligence ingestion, settlement abstraction, matching engine, and notifications.

-- 1. FPO & MEMBER AGGREGATION TABLES
CREATE TABLE IF NOT EXISTS public.fpos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  registration_number TEXT UNIQUE NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  admin_id UUID REFERENCES public.profiles(id),
  total_members INTEGER DEFAULT 0,
  verification_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fpo_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fpo_id UUID REFERENCES public.fpos(id) ON DELETE CASCADE,
  farmer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  role TEXT DEFAULT 'member',
  UNIQUE(fpo_id, farmer_id)
);

CREATE TABLE IF NOT EXISTS public.fpo_aggregated_lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fpo_id UUID REFERENCES public.fpos(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  crop_id TEXT NOT NULL,
  crop_name TEXT NOT NULL,
  total_quantity_kg NUMERIC NOT NULL CHECK (total_quantity_kg >= 0),
  available_quantity_kg NUMERIC NOT NULL CHECK (available_quantity_kg >= 0),
  quality_grade TEXT NOT NULL,
  asking_price_per_kg NUMERIC NOT NULL,
  member_sources JSONB NOT NULL, -- Array of {farmer_id, lot_id, contributed_kg}
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DATA INGESTION PIPELINE TABLES
CREATE TABLE IF NOT EXISTS public.raw_data_ingestion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  source_url TEXT,
  license TEXT,
  retrieved_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  checksum TEXT UNIQUE,
  schema_version TEXT DEFAULT 'v1',
  quality_score NUMERIC DEFAULT 1.0,
  validation_status TEXT DEFAULT 'valid',
  raw_payload JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS public.ingestion_quarantine (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  quarantine_reason TEXT NOT NULL,
  quarantined_at TIMESTAMPTZ DEFAULT NOW(),
  raw_payload JSONB NOT NULL
);

-- 3. SETTLEMENT ABSTRACTION & LEDGER TABLES
CREATE TABLE IF NOT EXISTS public.payment_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.marketplace_orders(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES public.profiles(id),
  seller_id UUID REFERENCES public.profiles(id),
  gross_amount NUMERIC NOT NULL,
  platform_fee NUMERIC DEFAULT 0,
  logistics_fee NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  seller_payable NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, escrowed, released, refunded
  idempotency_key TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_intent_id UUID REFERENCES public.payment_intents(id),
  user_id UUID REFERENCES public.profiles(id),
  amount NUMERIC NOT NULL,
  settlement_type TEXT NOT NULL, -- payout, fee_deduction, refund
  status TEXT DEFAULT 'completed',
  settled_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. LOGISTICS EVENTS
CREATE TABLE IF NOT EXISTS public.logistics_shipment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.marketplace_orders(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- pickup_assigned, picked_up, in_transit, arrived, delivered
  location_notes TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  event_timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 5. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  channel TEXT DEFAULT 'in_app', -- in_app, email, sms, push
  delivery_status TEXT DEFAULT 'delivered',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. REGIONAL SCALE COVERING INDEXES
CREATE INDEX IF NOT EXISTS idx_fpos_district_state ON public.fpos(district, state);
CREATE INDEX IF NOT EXISTS idx_fpo_members_fpo_id ON public.fpo_members(fpo_id);
CREATE INDEX IF NOT EXISTS idx_fpo_members_farmer_id ON public.fpo_members(farmer_id);
CREATE INDEX IF NOT EXISTS idx_fpo_agg_status ON public.fpo_aggregated_lots(status);

CREATE INDEX IF NOT EXISTS idx_listings_regional_search ON public.listings(state, district, crop_category, status);
CREATE INDEX IF NOT EXISTS idx_listings_created_at_desc ON public.listings(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_raw_ingestion_source ON public.raw_data_ingestion(source, retrieved_at);
CREATE INDEX IF NOT EXISTS idx_payment_intents_order_id ON public.payment_intents(order_id);
CREATE INDEX IF NOT EXISTS idx_logistics_events_order_id ON public.logistics_shipment_events(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.user_notifications(user_id, is_read);

-- 7. RLS ENABLEMENT & INITPLAN OPTIMIZATIONS
ALTER TABLE public.fpos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fpo_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fpo_aggregated_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view verified FPOs" ON public.fpos;
CREATE POLICY "Public can view verified FPOs" ON public.fpos FOR SELECT USING (true);

DROP POLICY IF EXISTS "FPO admins can manage their FPO" ON public.fpos;
CREATE POLICY "FPO admins can manage their FPO" ON public.fpos FOR ALL USING (admin_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Members can view their FPO memberships" ON public.fpo_members;
CREATE POLICY "Members can view their FPO memberships" ON public.fpo_members FOR SELECT USING (farmer_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can view their notifications" ON public.user_notifications;
CREATE POLICY "Users can view their notifications" ON public.user_notifications FOR SELECT USING (user_id = (SELECT auth.uid()));
