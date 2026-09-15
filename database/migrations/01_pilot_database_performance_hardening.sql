-- Migration: pilot_database_performance_hardening
-- Target: Supabase / PostgreSQL Application Database
-- Purpose: Hardens AgriMark database schema, covering foreign key indexes, RLS initplan policy optimizations, quantity non-negativity constraints, and transaction-safe inventory reservation.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. FOREIGN KEY COVERING INDEXES
CREATE INDEX IF NOT EXISTS idx_farms_owner_id ON public.farms(owner_id);
CREATE INDEX IF NOT EXISTS idx_cultivations_farm_id ON public.cultivations(farm_id);
CREATE INDEX IF NOT EXISTS idx_cultivations_farmer_id ON public.cultivations(farmer_id);
CREATE INDEX IF NOT EXISTS idx_field_observations_cultivation_id ON public.field_observations(cultivation_id);
CREATE INDEX IF NOT EXISTS idx_field_observations_farm_id ON public.field_observations(farm_id);
CREATE INDEX IF NOT EXISTS idx_harvest_batches_cultivation_id ON public.harvest_batches(cultivation_id);
CREATE INDEX IF NOT EXISTS idx_produce_lots_harvest_batch_id ON public.produce_lots(harvest_batch_id);
CREATE INDEX IF NOT EXISTS idx_produce_lots_owner_id ON public.produce_lots(owner_id);
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON public.listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_lot_id ON public.listings(lot_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_orders_listing_id ON public.marketplace_orders(listing_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.marketplace_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON public.marketplace_orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.marketplace_orders(status);
CREATE INDEX IF NOT EXISTS idx_buyer_rfqs_buyer_id ON public.buyer_rfqs(buyer_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_offers_rfq_id ON public.marketplace_offers(rfq_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_offers_seller_id ON public.marketplace_offers(seller_id);
CREATE INDEX IF NOT EXISTS idx_finance_records_user_id ON public.farmer_finance_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_farm_tasks_user_id ON public.farm_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_farm_documents_user_id ON public.farm_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_user_id ON public.ai_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_user_id ON public.admin_audit_log(user_id);

-- 2. QUANTITY NON-NEGATIVITY CONSTRAINTS
ALTER TABLE public.produce_lots DROP CONSTRAINT IF EXISTS chk_produce_lots_qty_positive;
ALTER TABLE public.produce_lots ADD CONSTRAINT chk_produce_lots_qty_positive CHECK (quantity >= 0);

ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS chk_listings_min_qty_positive;
ALTER TABLE public.listings ADD CONSTRAINT chk_listings_min_qty_positive CHECK (min_order_quantity >= 0);

ALTER TABLE public.marketplace_orders DROP CONSTRAINT IF EXISTS chk_orders_qty_positive;
ALTER TABLE public.marketplace_orders ADD CONSTRAINT chk_orders_qty_positive CHECK (quantity > 0);

-- 3. RLS INITPLAN OPTIMIZATIONS USING (SELECT AUTH.UID())
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cultivations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produce_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
CREATE POLICY "Users can read their own profile" ON public.profiles FOR SELECT USING (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Farmers can access their own farms" ON public.farms;
CREATE POLICY "Farmers can access their own farms" ON public.farms FOR ALL USING (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Farmers can access their own cultivations" ON public.cultivations;
CREATE POLICY "Farmers can access their own cultivations" ON public.cultivations FOR ALL USING (farmer_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Public can view active listings" ON public.listings;
CREATE POLICY "Public can view active listings" ON public.listings FOR SELECT USING (status = 'active' OR seller_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Sellers can manage their listings" ON public.listings;
CREATE POLICY "Sellers can manage their listings" ON public.listings FOR ALL USING (seller_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Order participants can view orders" ON public.marketplace_orders;
CREATE POLICY "Order participants can view orders" ON public.marketplace_orders FOR SELECT USING (buyer_id = (SELECT auth.uid()) OR seller_id = (SELECT auth.uid()));

-- 4. SERVER-SIDE TRANSACTIONAL INVENTORY RESERVATION FUNCTION
CREATE OR REPLACE FUNCTION reserve_listing_inventory(
  p_listing_id UUID,
  p_buyer_id UUID,
  p_requested_quantity NUMERIC,
  p_unit_price NUMERIC,
  p_delivery_address TEXT
)
RETURNS TABLE (
  order_id UUID,
  status TEXT,
  remaining_quantity NUMERIC
) AS $$
DECLARE
  v_listing public.listings%ROWTYPE;
  v_lot public.produce_lots%ROWTYPE;
  v_order_id UUID := gen_random_uuid();
  v_available NUMERIC;
BEGIN
  -- Lock listing row for update
  SELECT * INTO v_listing FROM public.listings WHERE id = p_listing_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found.';
  END IF;

  IF v_listing.status != 'active' THEN
    RAISE EXCEPTION 'Listing is not active for ordering.';
  END IF;

  -- Lock produce lot for update
  SELECT * INTO v_lot FROM public.produce_lots WHERE id = v_listing.lot_id FOR UPDATE;
  
  v_available := COALESCE(v_lot.available_quantity, v_lot.quantity, 0);

  IF p_requested_quantity > v_available THEN
    RAISE EXCEPTION 'Requested quantity % exceeds available inventory %.', p_requested_quantity, v_available;
  END IF;

  -- Deduct inventory
  v_available := v_available - p_requested_quantity;
  
  UPDATE public.produce_lots 
  SET 
    available_quantity = v_available,
    status = CASE WHEN v_available = 0 THEN 'sold' ELSE 'available' END
  WHERE id = v_lot.id;

  -- Update listing status if sold out
  IF v_available = 0 THEN
    UPDATE public.listings SET status = 'sold_out' WHERE id = p_listing_id;
  END IF;

  -- Create Marketplace Order
  INSERT INTO public.marketplace_orders (
    id, listing_id, buyer_id, seller_id, quantity, unit_price, total_amount, status, delivery_address, created_at
  ) VALUES (
    v_order_id, p_listing_id, p_buyer_id, v_listing.seller_id, p_requested_quantity, p_unit_price, (p_requested_quantity * p_unit_price), 'pending', p_delivery_address, NOW()
  );

  RETURN QUERY SELECT v_order_id, 'pending'::TEXT, v_available;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
