-- Delivery address management table used by the AgriMark location selector.
-- Apply this migration to Supabase before using edit/delete/select actions.

CREATE TABLE IF NOT EXISTS public.delivery_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label varchar(50) NOT NULL DEFAULT 'Home',
  full_name varchar(255) NOT NULL,
  phone varchar(20) NOT NULL,
  house_number varchar(100) NOT NULL,
  street varchar(255) NOT NULL,
  area varchar(255) NOT NULL,
  landmark varchar(255),
  city varchar(100) NOT NULL,
  state varchar(100) NOT NULL,
  postal_code varchar(20) NOT NULL,
  latitude double precision,
  longitude double precision,
  location_accuracy numeric(10,2),
  is_default boolean NOT NULL DEFAULT false,
  delivery_instructions text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_delivery_addresses_user_id
  ON public.delivery_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_delivery_addresses_user_default
  ON public.delivery_addresses(user_id, is_default);

ALTER TABLE public.delivery_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own delivery addresses" ON public.delivery_addresses;
CREATE POLICY "Users can view their own delivery addresses"
  ON public.delivery_addresses FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own delivery addresses" ON public.delivery_addresses;
CREATE POLICY "Users can insert their own delivery addresses"
  ON public.delivery_addresses FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own delivery addresses" ON public.delivery_addresses;
CREATE POLICY "Users can update their own delivery addresses"
  ON public.delivery_addresses FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own delivery addresses" ON public.delivery_addresses;
CREATE POLICY "Users can delete their own delivery addresses"
  ON public.delivery_addresses FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_delivery_addresses_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_delivery_addresses_updated_at ON public.delivery_addresses;
CREATE TRIGGER set_delivery_addresses_updated_at
  BEFORE UPDATE ON public.delivery_addresses
  FOR EACH ROW EXECUTE FUNCTION public.update_delivery_addresses_updated_at();
