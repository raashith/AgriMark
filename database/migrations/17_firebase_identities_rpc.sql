-- Database Migration: 17_firebase_identities_rpc.sql
-- Purpose: Schema table and RPC function ensure_firebase_identity for Firebase Auth integration.

CREATE TABLE IF NOT EXISTS public.firebase_identities (
    firebase_uid VARCHAR(128) PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    email VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_firebase_identities_profile_id ON public.firebase_identities(profile_id);

ALTER TABLE public.firebase_identities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to firebase_identities" ON public.firebase_identities;
CREATE POLICY "Service role full access to firebase_identities"
    ON public.firebase_identities
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- RPC Function for Atomic Profile & Identity Synchronization
CREATE OR REPLACE FUNCTION ensure_firebase_identity(
  p_firebase_uid TEXT,
  p_email TEXT DEFAULT NULL,
  p_full_name TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_requested_role TEXT DEFAULT 'farmer'
)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  phone TEXT,
  role TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
DECLARE
  v_profile_id UUID;
  v_role TEXT;
  v_allowed_roles TEXT[] := ARRAY['farmer', 'buyer', 'fpo', 'logistics', 'service_provider'];
BEGIN
  IF p_requested_role = 'admin' THEN
    RAISE EXCEPTION 'Self-registration as admin is prohibited.';
  END IF;

  IF NOT (p_requested_role = ANY(v_allowed_roles)) THEN
    v_role := 'farmer';
  ELSE
    v_role := p_requested_role;
  END IF;

  SELECT profile_id INTO v_profile_id
  FROM public.firebase_identities
  WHERE firebase_uid = p_firebase_uid;

  IF v_profile_id IS NULL THEN
    v_profile_id := gen_random_uuid();

    INSERT INTO public.profiles (id, full_name, phone, role)
    VALUES (
      v_profile_id,
      COALESCE(NULLIF(TRIM(p_full_name), ''), CASE WHEN p_email LIKE '%@%' THEN split_part(p_email, '@', 1) ELSE 'AgriMark User' END),
      p_phone,
      v_role
    )
    ON CONFLICT (id) DO UPDATE
    SET
      full_name = COALESCE(profiles.full_name, EXCLUDED.full_name),
      phone = COALESCE(profiles.phone, EXCLUDED.phone);

    INSERT INTO public.firebase_identities (firebase_uid, profile_id, email)
    VALUES (p_firebase_uid, v_profile_id, p_email)
    ON CONFLICT (firebase_uid) DO UPDATE
    SET email = COALESCE(EXCLUDED.email, firebase_identities.email);
  ELSE
    UPDATE public.profiles
    SET
      full_name = COALESCE(profiles.full_name, NULLIF(TRIM(p_full_name), '')),
      phone = COALESCE(profiles.phone, p_phone)
    WHERE public.profiles.id = v_profile_id;

    UPDATE public.firebase_identities
    SET email = COALESCE(p_email, firebase_identities.email)
    WHERE firebase_uid = p_firebase_uid;
  END IF;

  RETURN QUERY
  SELECT p.id, p.full_name, p.phone, p.role, p.created_at, p.updated_at
  FROM public.profiles p
  WHERE p.id = v_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
