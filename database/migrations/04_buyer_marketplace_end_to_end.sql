-- Buyer marketplace foundation: orders, transactional stock reservation, RFQs and offers.
-- Idempotent migration. No existing listings or inventory are seeded or modified by this migration.

CREATE TABLE IF NOT EXISTS public.buyer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_name text,
  buyer_type text NOT NULL DEFAULT 'individual'
    CHECK (buyer_type IN ('individual','retailer','processor','wholesaler','fpo','institution','other')),
  procurement_regions text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.marketplace_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE RESTRICT,
  buyer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  seller_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  quantity_kg numeric NOT NULL CHECK (quantity_kg > 0),
  total_price numeric NOT NULL CHECK (total_price >= 0),
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'placed'
    CHECK (status IN ('placed','accepted','processing','ready_for_dispatch','dispatched','in_transit','delivered','cancelled','rejected')),
  delivery_address jsonb,
  buyer_note text,
  seller_note text,
  cancellation_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_orders_buyer_created ON public.marketplace_orders(buyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_seller_created ON public.marketplace_orders(seller_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_listing ON public.marketplace_orders(listing_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_status ON public.marketplace_orders(status);

ALTER TABLE public.buyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Buyers read own buyer profile" ON public.buyer_profiles;
CREATE POLICY "Buyers read own buyer profile" ON public.buyer_profiles
  FOR SELECT USING (user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS "Buyers update own buyer profile" ON public.buyer_profiles;
CREATE POLICY "Buyers update own buyer profile" ON public.buyer_profiles
  FOR UPDATE USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS "Order participants read orders" ON public.marketplace_orders;
CREATE POLICY "Order participants read orders" ON public.marketplace_orders
  FOR SELECT USING (buyer_id = (SELECT auth.uid()) OR seller_id = (SELECT auth.uid()));

CREATE TABLE IF NOT EXISTS public.buyer_rfqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL REFERENCES public.buyer_profiles(id) ON DELETE CASCADE,
  crop_id uuid REFERENCES public.crops(id) ON DELETE SET NULL,
  quantity numeric NOT NULL CHECK (quantity > 0),
  unit text NOT NULL DEFAULT 'kg',
  target_price numeric CHECK (target_price IS NULL OR target_price >= 0),
  delivery_district text,
  delivery_state text,
  deadline timestamptz,
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','matched','closed','cancelled','expired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.marketplace_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id uuid NOT NULL REFERENCES public.buyer_rfqs(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quantity numeric NOT NULL CHECK (quantity > 0),
  unit_price numeric NOT NULL CHECK (unit_price >= 0),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','rejected','withdrawn','expired')),
  seller_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_buyer_rfqs_status_created ON public.buyer_rfqs(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_buyer_rfqs_buyer ON public.buyer_rfqs(buyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_offers_rfq_created ON public.marketplace_offers(rfq_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_offers_seller_created ON public.marketplace_offers(seller_id, created_at DESC);

ALTER TABLE public.buyer_rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Buyer can read own RFQs" ON public.buyer_rfqs;
CREATE POLICY "Buyer can read own RFQs" ON public.buyer_rfqs FOR SELECT
  USING (buyer_id IN (SELECT id FROM public.buyer_profiles WHERE user_id = (SELECT auth.uid())));
DROP POLICY IF EXISTS "Sellers can read open RFQs" ON public.buyer_rfqs;
CREATE POLICY "Sellers can read open RFQs" ON public.buyer_rfqs FOR SELECT USING (status = 'open');
DROP POLICY IF EXISTS "Buyer can create own RFQs" ON public.buyer_rfqs;
CREATE POLICY "Buyer can create own RFQs" ON public.buyer_rfqs FOR INSERT
  WITH CHECK (buyer_id IN (SELECT id FROM public.buyer_profiles WHERE user_id = (SELECT auth.uid())));
DROP POLICY IF EXISTS "Buyer can update own RFQs" ON public.buyer_rfqs;
CREATE POLICY "Buyer can update own RFQs" ON public.buyer_rfqs FOR UPDATE
  USING (buyer_id IN (SELECT id FROM public.buyer_profiles WHERE user_id = (SELECT auth.uid())))
  WITH CHECK (buyer_id IN (SELECT id FROM public.buyer_profiles WHERE user_id = (SELECT auth.uid())));
DROP POLICY IF EXISTS "Sellers read own offers" ON public.marketplace_offers;
CREATE POLICY "Sellers read own offers" ON public.marketplace_offers FOR SELECT
  USING (seller_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS "RFQ buyers read offers" ON public.marketplace_offers;
CREATE POLICY "RFQ buyers read offers" ON public.marketplace_offers FOR SELECT
  USING (rfq_id IN (
    SELECT r.id FROM public.buyer_rfqs r
    JOIN public.buyer_profiles b ON b.id = r.buyer_id
    WHERE b.user_id = (SELECT auth.uid())
  ));

GRANT SELECT ON public.marketplace_orders TO authenticated;
GRANT SELECT, UPDATE ON public.buyer_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.buyer_rfqs TO authenticated;
GRANT SELECT ON public.marketplace_offers TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.marketplace_orders TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.buyer_profiles TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.buyer_rfqs TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.marketplace_offers TO service_role;

CREATE OR REPLACE FUNCTION public.create_marketplace_order_atomic(
  p_listing_id uuid,
  p_buyer_id uuid,
  p_quantity numeric
) RETURNS SETOF public.marketplace_orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  v_listing public.listings%ROWTYPE;
  v_lot public.produce_lots%ROWTYPE;
  v_available numeric;
  v_total numeric;
  v_order public.marketplace_orders%ROWTYPE;
BEGIN
  IF p_quantity IS NULL OR p_quantity <= 0 THEN
    RAISE EXCEPTION 'Order quantity must be greater than zero.';
  END IF;

  SELECT * INTO v_listing FROM public.listings WHERE id = p_listing_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Listing not found.'; END IF;
  IF v_listing.status <> 'active' THEN RAISE EXCEPTION 'Listing is not active.'; END IF;
  IF v_listing.seller_id = p_buyer_id THEN RAISE EXCEPTION 'Seller cannot buy their own listing.'; END IF;
  IF p_quantity < v_listing.min_order_quantity THEN
    RAISE EXCEPTION 'Quantity is below the listing minimum of % kg.', v_listing.min_order_quantity;
  END IF;

  SELECT * INTO v_lot FROM public.produce_lots WHERE id = v_listing.lot_id FOR UPDATE;
  IF NOT FOUND OR v_lot.status NOT IN ('available','listed','active') THEN
    RAISE EXCEPTION 'Produce lot is not available.';
  END IF;

  v_available := COALESCE(v_lot.available_quantity, v_lot.quantity, 0);
  IF p_quantity > v_available THEN
    RAISE EXCEPTION 'Insufficient stock. Available quantity: % kg.', v_available;
  END IF;

  v_total := round(p_quantity * v_listing.price_per_unit, 2);

  UPDATE public.produce_lots
  SET available_quantity = v_available - p_quantity,
      status = CASE WHEN v_available - p_quantity <= 0 THEN 'sold' ELSE status END,
      is_listed = CASE WHEN v_available - p_quantity <= 0 THEN false ELSE is_listed END
  WHERE id = v_lot.id;

  IF v_available - p_quantity <= 0 THEN
    UPDATE public.listings SET status = 'sold', updated_at = now() WHERE id = v_listing.id;
  END IF;

  INSERT INTO public.marketplace_orders
    (listing_id, buyer_id, seller_id, quantity_kg, total_price, currency, status)
  VALUES
    (v_listing.id, p_buyer_id, v_listing.seller_id, p_quantity, v_total, COALESCE(v_listing.currency, 'INR'), 'placed')
  RETURNING * INTO v_order;

  RETURN NEXT v_order;
END;
$function$;

REVOKE ALL ON FUNCTION public.create_marketplace_order_atomic(uuid, uuid, numeric) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_marketplace_order_atomic(uuid, uuid, numeric) TO service_role;
