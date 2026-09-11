-- AgriMark Production PostgreSQL / Supabase Schema & Security Policy
-- Version 1.1.0
-- Standard for PostgreSQL 14+ and Supabase Engine

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE SCHEMA IF NOT EXISTS public;

-- ============================================================================
-- 1. UTILITY FUNCTIONS & TRIGGERS
-- ============================================================================

-- Utility function for automatic timestamp updates with explicit search_path
CREATE OR REPLACE FUNCTION public.fn_update_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Function for atomic inventory reservation validation
CREATE OR REPLACE FUNCTION public.fn_validate_inventory_reservation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.reserved_quantity_kg < 0 THEN
        RAISE EXCEPTION 'Reserved quantity cannot be negative';
    END IF;
    IF NEW.reserved_quantity_kg > NEW.quantity_kg THEN
        RAISE EXCEPTION 'Reserved quantity cannot exceed total lot quantity';
    END IF;
    RETURN NEW;
END;
$$;

-- ============================================================================
-- 2. CORE IDENTITY & USER SYSTEM
-- ============================================================================

-- 2.1 Roles
CREATE TABLE IF NOT EXISTS public.roles (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.2 Users
CREATE TABLE IF NOT EXISTS public.users (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role_id VARCHAR(36) NOT NULL REFERENCES public.roles(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending_verification')),
    preferred_language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON public.users(role_id);

-- 2.3 Farmer Profiles
CREATE TABLE IF NOT EXISTS public.farmer_profiles (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id VARCHAR(36) NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    fpo_member_id VARCHAR(100),
    experience_years INT DEFAULT 0 CHECK (experience_years >= 0),
    primary_crops TEXT,
    verification_status VARCHAR(20) DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'verified', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_farmer_profiles_user_id ON public.farmer_profiles(user_id);

-- 2.4 Buyer Profiles
CREATE TABLE IF NOT EXISTS public.buyer_profiles (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id VARCHAR(36) NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    business_name VARCHAR(150),
    buyer_type VARCHAR(50) DEFAULT 'individual' CHECK (buyer_type IN ('individual', 'wholesaler', 'retailer', 'restaurant', 'processor')),
    gstin VARCHAR(20),
    delivery_address TEXT,
    verification_status VARCHAR(20) DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'verified', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_buyer_profiles_user_id ON public.buyer_profiles(user_id);

-- ============================================================================
-- 3. FARM & AGRICULTURAL OPERATIONS
-- ============================================================================

-- 3.1 Farms
CREATE TABLE IF NOT EXISTS public.farms (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    farmer_id VARCHAR(36) NOT NULL REFERENCES public.farmer_profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    total_area_acres DECIMAL(8, 2) NOT NULL CHECK (total_area_acres > 0),
    soil_type VARCHAR(50),
    irrigation_source VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_farms_farmer_id ON public.farms(farmer_id);

-- 3.2 Crops & Cultivation
CREATE TABLE IF NOT EXISTS public.crops (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    farm_id VARCHAR(36) NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    sowing_date DATE NOT NULL,
    expected_harvest_date DATE,
    acreage DECIMAL(8, 2) NOT NULL CHECK (acreage > 0),
    status VARCHAR(30) DEFAULT 'PLANTED' CHECK (status IN ('PLANTED', 'GROWING', 'HARVESTED', 'FAILED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_crops_farm_id ON public.crops(farm_id);

-- 3.3 Produce Lots & Inventory
CREATE TABLE IF NOT EXISTS public.produce_lots (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    farmer_id VARCHAR(36) NOT NULL REFERENCES public.farmer_profiles(id),
    farm_id VARCHAR(36) NOT NULL REFERENCES public.farms(id),
    commodity_name VARCHAR(100) NOT NULL,
    quantity_kg DECIMAL(12, 2) NOT NULL CHECK (quantity_kg >= 0),
    reserved_quantity_kg DECIMAL(12, 2) DEFAULT 0.00 CHECK (reserved_quantity_kg >= 0),
    harvest_date DATE NOT NULL,
    quality_grade VARCHAR(20) DEFAULT 'STANDARD' CHECK (quality_grade IN ('PREMIUM', 'STANDARD', 'GRADE_B', 'REJECT')),
    status VARCHAR(30) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'RESERVED', 'SOLD', 'DISCARDED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_produce_lots_quantity CHECK (reserved_quantity_kg <= quantity_kg)
);

CREATE INDEX IF NOT EXISTS idx_produce_lots_farmer_id ON public.produce_lots(farmer_id);
CREATE INDEX IF NOT EXISTS idx_produce_lots_status ON public.produce_lots(status);

DROP TRIGGER IF EXISTS trg_validate_inventory_reservation ON public.produce_lots;
CREATE TRIGGER trg_validate_inventory_reservation
    BEFORE INSERT OR UPDATE ON public.produce_lots
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_validate_inventory_reservation();

-- ============================================================================
-- 4. MARKETPLACE, RFQ & COMMERCE
-- ============================================================================

-- 4.1 Marketplace Listings
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    lot_id VARCHAR(36) NOT NULL REFERENCES public.produce_lots(id),
    seller_id VARCHAR(36) NOT NULL REFERENCES public.farmer_profiles(id),
    title VARCHAR(150) NOT NULL,
    description TEXT,
    price_per_kg DECIMAL(10, 2) NOT NULL CHECK (price_per_kg > 0),
    available_quantity_kg DECIMAL(12, 2) NOT NULL CHECK (available_quantity_kg >= 0),
    status VARCHAR(30) DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT', 'PUBLISHED', 'SOLD_OUT', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller_id ON public.marketplace_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON public.marketplace_listings(status);

-- 4.2 Buyer RFQs
CREATE TABLE IF NOT EXISTS public.buyer_rfqs (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    buyer_id VARCHAR(36) NOT NULL REFERENCES public.buyer_profiles(id),
    commodity_name VARCHAR(100) NOT NULL,
    required_quantity_kg DECIMAL(12, 2) NOT NULL CHECK (required_quantity_kg > 0),
    target_price_per_kg DECIMAL(10, 2) CHECK (target_price_per_kg > 0),
    delivery_location VARCHAR(255) NOT NULL,
    required_date DATE NOT NULL,
    status VARCHAR(30) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'MATCHED', 'CLOSED', 'EXPIRED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_buyer_rfqs_buyer_id ON public.buyer_rfqs(buyer_id);
CREATE INDEX IF NOT EXISTS idx_buyer_rfqs_status ON public.buyer_rfqs(status);

-- 4.3 Marketplace Orders
CREATE TABLE IF NOT EXISTS public.marketplace_orders (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    listing_id VARCHAR(36) NOT NULL REFERENCES public.marketplace_listings(id),
    buyer_id VARCHAR(36) NOT NULL REFERENCES public.buyer_profiles(id),
    quantity_kg DECIMAL(12, 2) NOT NULL CHECK (quantity_kg > 0),
    total_amount DECIMAL(12, 2) NOT NULL CHECK (total_amount > 0),
    order_status VARCHAR(30) DEFAULT 'CREATED' CHECK (order_status IN ('CREATED', 'CONFIRMED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_marketplace_orders_buyer_id ON public.marketplace_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_listing_id ON public.marketplace_orders(listing_id);

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produce_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_orders ENABLE ROW LEVEL SECURITY;

-- 5.1 Public / Read-Only Policy for Roles
DROP POLICY IF EXISTS roles_select_policy ON public.roles;
CREATE POLICY roles_select_policy ON public.roles
    FOR SELECT USING (true);

-- 5.2 Users Policy (Self Read/Update)
DROP POLICY IF EXISTS users_self_policy ON public.users;
CREATE POLICY users_self_policy ON public.users
    FOR ALL USING (auth.uid()::text = id OR auth.role() = 'service_role');

-- 5.3 Farms Policy (Owner Farmer Access)
DROP POLICY IF EXISTS farms_owner_policy ON public.farms;
CREATE POLICY farms_owner_policy ON public.farms
    FOR ALL USING (
        farmer_id IN (SELECT id FROM public.farmer_profiles WHERE user_id = auth.uid()::text)
        OR auth.role() = 'service_role'
    );

-- 5.4 Marketplace Listings Policy (Public Read, Owner Modify)
DROP POLICY IF EXISTS listings_read_policy ON public.marketplace_listings;
CREATE POLICY listings_read_policy ON public.marketplace_listings
    FOR SELECT USING (status = 'PUBLISHED' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS listings_owner_policy ON public.marketplace_listings;
CREATE POLICY listings_owner_policy ON public.marketplace_listings
    FOR ALL USING (
        seller_id IN (SELECT id FROM public.farmer_profiles WHERE user_id = auth.uid()::text)
        OR auth.role() = 'service_role'
    );
