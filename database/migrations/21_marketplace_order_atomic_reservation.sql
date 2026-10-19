-- AgriMark controlled-pilot marketplace schema reconciliation.
-- Apply only after confirming this is the intended production Supabase project.
-- The backend calls create_marketplace_order_atomic; the function below is the
-- canonical transaction boundary for listing lock, stock reservation and order insert.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.marketplace_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE RESTRICT,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  quantity NUMERIC(14,3) NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL DEFAULT 'kg',
  unit_price NUMERIC(14,2) NOT NULL CHECK (unit_price >= 0),
  total_amount NUMERIC(16,2) NOT NULL CHECK (total_amount >= 0),
  status TEXT NOT NULL DEFAULT 'pending',
  delivery_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.marketplace_orders
  ADD COLUMN IF NOT EXISTS unit TEXT NOT NULL DEFAULT 'kg';
ALTER TABLE public.marketplace_orders
  ADD COLUMN IF NOT EXISTS delivery_address TEXT;
ALTER TABLE public.marketplace_orders
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_marketplace_orders_listing_id ON public.marketplace_orders(listing_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_buyer_created ON public.marketplace_orders(buyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_seller_created ON public.marketplace_orders(seller_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_status_created ON public.marketplace_orders(status, created_at DESC);

CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON public.admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_user_id ON public.admin_audit_log(user_id);

ALTER TABLE public.marketplace_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS marketplace_orders_participant_read ON public.marketplace_orders;
CREATE POLICY marketplace_orders_participant_read
  ON public.marketplace_orders FOR SELECT TO authenticated
  USING (
    buyer_id = (SELECT auth.uid())
    OR seller_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (SELECT auth.uid()) AND p.role = 'admin'
    )
  );

DROP POLICY IF EXISTS admin_audit_log_admin_read ON public.admin_audit_log;
CREATE POLICY admin_audit_log_admin_read
  ON public.admin_audit_log FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (SELECT auth.uid()) AND p.role = 'admin'
    )
  );

GRANT SELECT ON public.marketplace_orders TO authenticated;
GRANT ALL ON public.marketplace_orders TO service_role;
GRANT SELECT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;

CREATE OR REPLACE FUNCTION public.create_marketplace_order_atomic(
  p_listing_id UUID,
  p_buyer_id UUID,
  p_quantity NUMERIC
)
RETURNS SETOF public.marketplace_orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_listing public.listings%ROWTYPE;
  v_lot public.produce_lots%ROWTYPE;
  v_available NUMERIC;
  v_order public.marketplace_orders%ROWTYPE;
BEGIN
  IF p_buyer_id IS NULL OR p_quantity IS NULL OR p_quantity <= 0 THEN
    RAISE EXCEPTION 'Buyer and positive order quantity are required.';
  END IF;

  SELECT * INTO v_listing
  FROM public.listings
  WHERE id = p_listing_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found.';
  END IF;
  IF v_listing.status <> 'active' THEN
    RAISE EXCEPTION 'Listing is not active.';
  END IF;
  IF v_listing.seller_id = p_buyer_id THEN
    RAISE EXCEPTION 'Seller cannot buy their own listing.';
  END IF;
  IF p_quantity < COALESCE(v_listing.min_order_quantity, 0) THEN
    RAISE EXCEPTION 'Quantity is below the listing minimum.';
  END IF;

  SELECT * INTO v_lot
  FROM public.produce_lots
  WHERE id = v_listing.lot_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'The produce lot for this listing was not found.';
  END IF;
  IF v_lot.owner_id <> v_listing.seller_id THEN
    RAISE EXCEPTION 'Listing seller does not own the produce lot.';
  END IF;

  v_available := COALESCE(v_lot.available_quantity, v_lot.quantity, 0);
  IF p_quantity > v_available THEN
    RAISE EXCEPTION 'Insufficient inventory. Available quantity: %.', v_available;
  END IF;

  v_available := v_available - p_quantity;

  UPDATE public.produce_lots
  SET available_quantity = v_available,
      status = CASE WHEN v_available = 0 THEN 'sold' ELSE 'available' END,
      is_listed = CASE WHEN v_available = 0 THEN FALSE ELSE is_listed END
  WHERE id = v_lot.id;

  IF v_available = 0 THEN
    UPDATE public.listings SET status = 'sold', updated_at = NOW()
    WHERE id = v_listing.id;
  END IF;

  INSERT INTO public.marketplace_orders (
    listing_id, buyer_id, seller_id, quantity, unit, unit_price,
    total_amount, status, created_at, updated_at
  ) VALUES (
    v_listing.id, p_buyer_id, v_listing.seller_id, p_quantity, 'kg',
    v_listing.price_per_unit, ROUND(p_quantity * v_listing.price_per_unit, 2),
    'pending', NOW(), NOW()
  )
  RETURNING * INTO v_order;

  INSERT INTO public.admin_audit_log (user_id, action, details, created_at)
  VALUES (
    p_buyer_id,
    'MARKETPLACE_ORDER_CREATED',
    FORMAT('Order %s created for listing %s; quantity=%s kg.', v_order.id, v_listing.id, p_quantity),
    NOW()
  );

  RETURN NEXT v_order;
END;
$;

REVOKE ALL ON FUNCTION public.create_marketplace_order_atomic(UUID, UUID, NUMERIC) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_marketplace_order_atomic(UUID, UUID, NUMERIC) FROM anon;
REVOKE ALL ON FUNCTION public.create_marketplace_order_atomic(UUID, UUID, NUMERIC) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.create_marketplace_order_atomic(UUID, UUID, NUMERIC) TO service_role;
