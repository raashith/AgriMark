-- Database Migration: 17_agrimark_first_party_otp.sql
-- Purpose: Add public.auth_otp_challenges table with Row Level Security (RLS) for first-party OTP system.

CREATE TABLE IF NOT EXISTS public.auth_otp_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_e164 VARCHAR(20) NOT NULL,
    purpose VARCHAR(50) NOT NULL DEFAULT 'login',
    otp_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 5,
    resend_count INTEGER NOT NULL DEFAULT 0,
    consumed_at TIMESTAMPTZ,
    locked_until TIMESTAMPTZ,
    request_ip_hash VARCHAR(255),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Indexes for performance and rate limit checks
CREATE INDEX IF NOT EXISTS idx_auth_otp_phone_purpose ON public.auth_otp_challenges(phone_e164, purpose);
CREATE INDEX IF NOT EXISTS idx_auth_otp_active ON public.auth_otp_challenges(phone_e164, consumed_at, expires_at);
CREATE INDEX IF NOT EXISTS idx_auth_otp_ip_window ON public.auth_otp_challenges(request_ip_hash, created_at);
CREATE INDEX IF NOT EXISTS idx_auth_otp_user ON public.auth_otp_challenges(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.auth_otp_challenges ENABLE ROW LEVEL SECURITY;

-- Block anonymous/direct client access to OTP challenges table. Access must go through trusted server API or service role.
DROP POLICY IF EXISTS "Block ordinary client access to OTP challenges" ON public.auth_otp_challenges;
CREATE POLICY "Block ordinary client access to OTP challenges"
    ON public.auth_otp_challenges
    FOR ALL
    USING (false);
