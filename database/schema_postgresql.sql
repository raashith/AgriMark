-- AgriMark PostgreSQL / Supabase Production Database Schema
-- Version 1.0.0
-- Standard for PostgreSQL 14+ and Supabase

CREATE SCHEMA IF NOT EXISTS public;

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS public.roles (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role_id VARCHAR(36) NOT NULL REFERENCES public.roles(id),
    status VARCHAR(20) DEFAULT 'active',
    preferred_language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- 3. Farmer Profiles
CREATE TABLE IF NOT EXISTS public.farmer_profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    fpo_member_id VARCHAR(100),
    experience_years INT DEFAULT 0,
    primary_crops TEXT,
    verification_status VARCHAR(20) DEFAULT 'unverified',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Buyer Profiles
CREATE TABLE IF NOT EXISTS public.buyer_profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    business_name VARCHAR(150),
    buyer_type VARCHAR(50) DEFAULT 'individual',
    gstin VARCHAR(20),
    delivery_address TEXT,
    verification_status VARCHAR(20) DEFAULT 'unverified',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Farms
CREATE TABLE IF NOT EXISTS public.farms (
    id VARCHAR(36) PRIMARY KEY,
    farmer_id VARCHAR(36) NOT NULL REFERENCES public.farmer_profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    total_area_acres DECIMAL(8, 2) NOT NULL,
    soil_type VARCHAR(50),
    irrigation_source VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Produce Lots & Inventory
CREATE TABLE IF NOT EXISTS public.produce_lots (
    id VARCHAR(36) PRIMARY KEY,
    farmer_id VARCHAR(36) NOT NULL REFERENCES public.farmer_profiles(id),
    farm_id VARCHAR(36) NOT NULL REFERENCES public.farms(id),
    commodity_name VARCHAR(100) NOT NULL,
    quantity_kg DECIMAL(12, 2) NOT NULL,
    reserved_quantity_kg DECIMAL(12, 2) DEFAULT 0.00,
    harvest_date DATE NOT NULL,
    quality_grade VARCHAR(20) DEFAULT 'STANDARD',
    status VARCHAR(30) DEFAULT 'AVAILABLE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Marketplace Listings
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
    id VARCHAR(36) PRIMARY KEY,
    lot_id VARCHAR(36) NOT NULL REFERENCES public.produce_lots(id),
    seller_id VARCHAR(36) NOT NULL REFERENCES public.farmer_profiles(id),
    title VARCHAR(150) NOT NULL,
    description TEXT,
    price_per_kg DECIMAL(10, 2) NOT NULL,
    available_quantity_kg DECIMAL(12, 2) NOT NULL,
    status VARCHAR(30) DEFAULT 'PUBLISHED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Orders & Transactions
CREATE TABLE IF NOT EXISTS public.marketplace_orders (
    id VARCHAR(36) PRIMARY KEY,
    listing_id VARCHAR(36) NOT NULL REFERENCES public.marketplace_listings(id),
    buyer_id VARCHAR(36) NOT NULL REFERENCES public.buyer_profiles(id),
    quantity_kg DECIMAL(12, 2) NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    order_status VARCHAR(30) DEFAULT 'CREATED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Seed & Genetic Registry (Stage 26)
CREATE TABLE IF NOT EXISTS public.seed_varieties (
    id VARCHAR(36) PRIMARY KEY,
    crop_name VARCHAR(100) NOT NULL,
    variety_name VARCHAR(100) NOT NULL UNIQUE,
    breeder_institution VARCHAR(150),
    expected_yield_min DECIMAL(8, 2),
    expected_yield_max DECIMAL(8, 2),
    disclaimer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Data Commons & Contracts (Stage 23)
CREATE TABLE IF NOT EXISTS public.data_commons_contracts (
    id VARCHAR(36) PRIMARY KEY,
    contract_name VARCHAR(150) NOT NULL,
    provider_id VARCHAR(100) NOT NULL,
    consumer_id VARCHAR(100) NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    status VARCHAR(30) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
