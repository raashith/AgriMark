-- Database Migration: 16_zepto_mobile_delivery_addresses.sql
-- Purpose: Add delivery_addresses table with Row Level Security (RLS) for Zepto-style mobile OTP + delivery location onboarding.

CREATE TABLE IF NOT EXISTS public.delivery_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    label VARCHAR(50) NOT NULL DEFAULT 'Home', -- 'Home', 'Farm', 'Other'
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    house_number VARCHAR(100) NOT NULL,
    street VARCHAR(255) NOT NULL,
    area VARCHAR(255) NOT NULL,
    landmark VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location_accuracy NUMERIC(10, 2),
    is_default BOOLEAN NOT NULL DEFAULT true,
    delivery_instructions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_delivery_addresses_user_id ON public.delivery_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_delivery_addresses_user_default ON public.delivery_addresses(user_id, is_default);

-- Enable Row Level Security
ALTER TABLE public.delivery_addresses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own delivery addresses" ON public.delivery_addresses;
CREATE POLICY "Users can view their own delivery addresses"
    ON public.delivery_addresses
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own delivery addresses" ON public.delivery_addresses;
CREATE POLICY "Users can insert their own delivery addresses"
    ON public.delivery_addresses
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own delivery addresses" ON public.delivery_addresses;
CREATE POLICY "Users can update their own delivery addresses"
    ON public.delivery_addresses
    FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own delivery addresses" ON public.delivery_addresses;
CREATE POLICY "Users can delete their own delivery addresses"
    ON public.delivery_addresses
    FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_delivery_addresses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_delivery_addresses_updated_at ON public.delivery_addresses;
CREATE TRIGGER set_delivery_addresses_updated_at
    BEFORE UPDATE ON public.delivery_addresses
    FOR EACH ROW
    EXECUTE FUNCTION update_delivery_addresses_updated_at();
