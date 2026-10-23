-- Buyer-safe marketplace order cancellation.
-- Cancellation is transactional: the buyer order is locked, only its owner may cancel it,
-- only unaccepted orders may be cancelled, and reserved stock is returned exactly once.

CREATE OR REPLACE FUNCTION public.cancel_marketplace_order_atomic(
  p_order_id uuid,
  p_buyer_id uuid,
  p_reason text DEFAULT 'Cancelled by buyer'
)
RETURNS SETOF public.marketplace_orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_order public.marketplace_orders%ROWTYPE;
  v_listing public.listings%ROWTYPE;
  v_lot public.produce_lots%ROWTYPE;
  v_available numeric;
BEGIN
  SELECT * INTO v_order
  FROM public.marketplace_orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found.';
  END IF;

  IF v_order.buyer_id <> p_buyer_id THEN
    RAISE EXCEPTION 'Buyer does not own this order.';
  END IF;

  IF v_order.status <> 'placed' THEN
    RAISE EXCEPTION 'Only unaccepted orders can be cancelled.';
  END IF;

  SELECT * INTO v_listing
  FROM public.listings
  WHERE id = v_order.listing_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found for this order.';
  END IF;

  SELECT * INTO v_lot
  FROM public.produce_lots
  WHERE id = v_listing.lot_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Produce lot not found for this order.';
  END IF;

  v_available := COALESCE(v_lot.available_quantity, v_lot.quantity, 0) + v_order.quantity_kg;

  UPDATE public.produce_lots
  SET available_quantity = v_available,
      status = CASE WHEN status = 'sold' THEN 'available' ELSE status END,
      is_listed = CASE WHEN status = 'sold' THEN true ELSE is_listed END
  WHERE id = v_lot.id;

  UPDATE public.listings
  SET status = CASE WHEN status = 'sold' THEN 'active' ELSE status END,
      updated_at = now()
  WHERE id = v_listing.id;

  UPDATE public.marketplace_orders
  SET status = 'cancelled',
      cancellation_reason = left(COALESCE(NULLIF(trim(p_reason), ''), 'Cancelled by buyer'), 300),
      updated_at = now()
  WHERE id = p_order_id;

  RETURN QUERY SELECT * FROM public.marketplace_orders WHERE id = p_order_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.cancel_marketplace_order_atomic(uuid, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cancel_marketplace_order_atomic(uuid, uuid, text) TO service_role;
