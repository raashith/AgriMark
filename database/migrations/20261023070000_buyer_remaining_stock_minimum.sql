-- Permit a buyer to purchase the remaining stock when it is below the listing's
-- normal minimum order quantity. The effective minimum becomes LEAST(minimum, available).
CREATE OR REPLACE FUNCTION public.create_marketplace_order_atomic(p_listing_id uuid, p_buyer_id uuid, p_quantity numeric)
RETURNS SETOF public.marketplace_orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_listing public.listings%ROWTYPE;
  v_lot public.produce_lots%ROWTYPE;
  v_available numeric;
  v_total numeric;
  v_order public.marketplace_orders%ROWTYPE;
  v_effective_min numeric;
BEGIN
  IF p_quantity IS NULL OR p_quantity <= 0 THEN
    RAISE EXCEPTION 'Order quantity must be greater than zero.';
  END IF;

  SELECT * INTO v_listing FROM public.listings WHERE id = p_listing_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Listing not found.'; END IF;
  IF v_listing.status <> 'active' THEN RAISE EXCEPTION 'Listing is not active.'; END IF;
  IF v_listing.seller_id = p_buyer_id THEN RAISE EXCEPTION 'Seller cannot buy their own listing.'; END IF;

  SELECT * INTO v_lot FROM public.produce_lots WHERE id = v_listing.lot_id FOR UPDATE;
  IF NOT FOUND OR v_lot.status NOT IN ('available','listed','active') THEN
    RAISE EXCEPTION 'Produce lot is not available.';
  END IF;

  v_available := COALESCE(v_lot.available_quantity, v_lot.quantity, 0);
  IF v_available <= 0 THEN
    RAISE EXCEPTION 'Insufficient stock. Available quantity: % kg.', v_available;
  END IF;

  v_effective_min := LEAST(COALESCE(v_listing.min_order_quantity, 1), v_available);
  IF p_quantity < v_effective_min THEN
    RAISE EXCEPTION 'Quantity must be at least % kg (remaining stock: % kg).', v_effective_min, v_available;
  END IF;
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
