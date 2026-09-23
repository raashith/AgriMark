-- AgriMark first-party OTP challenge storage.
-- OTP values are never stored here; only a keyed HMAC representation is persisted.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.agrimark_otp_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_e164 TEXT NOT NULL,
    purpose TEXT NOT NULL DEFAULT 'login',
    otp_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
    max_attempts INTEGER NOT NULL DEFAULT 5 CHECK (max_attempts > 0),
    consumed_at TIMESTAMPTZ,
    locked_until TIMESTAMPTZ,
    request_ip_hash TEXT,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS agrimark_otp_phone_purpose_created_idx
  ON public.agrimark_otp_challenges (phone_e164, purpose, created_at DESC);

CREATE INDEX IF NOT EXISTS agrimark_otp_expires_idx
  ON public.agrimark_otp_challenges (expires_at);

CREATE UNIQUE INDEX IF NOT EXISTS agrimark_otp_active_challenge_idx
  ON public.agrimark_otp_challenges (phone_e164, purpose, consumed_at)
  WHERE consumed_at IS NULL;

ALTER TABLE public.agrimark_otp_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "otp_no_direct_select" ON public.agrimark_otp_challenges;
DROP POLICY IF EXISTS "otp_no_direct_insert" ON public.agrimark_otp_challenges;
DROP POLICY IF EXISTS "otp_no_direct_update" ON public.agrimark_otp_challenges;
DROP POLICY IF EXISTS "otp_no_direct_delete" ON public.agrimark_otp_challenges;

CREATE OR REPLACE FUNCTION public.agrimark_otp_consume_challenge(
    p_challenge_id UUID,
    p_phone_e164 TEXT,
    p_otp_hash TEXT
)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE public.agrimark_otp_challenges
    SET consumed_at = NOW()
    WHERE id = p_challenge_id
      AND phone_e164 = p_phone_e164
      AND consumed_at IS NULL
      AND expires_at > NOW()
      AND attempt_count < max_attempts
      AND (locked_until IS NULL OR locked_until <= NOW())
      AND otp_hash = p_otp_hash;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count = 1;
END;
$$;

REVOKE ALL ON FUNCTION public.agrimark_otp_consume_challenge(UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.agrimark_otp_consume_challenge(UUID, TEXT, TEXT) TO service_role;

CREATE OR REPLACE FUNCTION public.agrimark_otp_cleanup_expired()
RETURNS INTEGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.agrimark_otp_challenges
    WHERE expires_at < NOW() - INTERVAL '1 day';

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

REVOKE ALL ON FUNCTION public.agrimark_otp_cleanup_expired() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.agrimark_otp_cleanup_expired() TO service_role;
