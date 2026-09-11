-- AgriMark Normalized MySQL Database Schema
-- Version 1.0.0
-- Built for MySQL 8.0+

CREATE DATABASE IF NOT EXISTS agrimark_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE agrimark_db;

-- 1. Roles
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role_id VARCHAR(36) NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- active, suspended, pending_verification
    preferred_language VARCHAR(10) DEFAULT 'en',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    INDEX idx_users_phone (phone),
    INDEX idx_users_email (email)
);

-- 3. Farmer Profiles
CREATE TABLE IF NOT EXISTS farmer_profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    fpo_member_id VARCHAR(100),
    experience_years INT DEFAULT 0,
    primary_crops TEXT,
    verification_status VARCHAR(20) DEFAULT 'unverified', -- unverified, verified, rejected
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Buyer Profiles
CREATE TABLE IF NOT EXISTS buyer_profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    business_name VARCHAR(150),
    buyer_type VARCHAR(50) DEFAULT 'individual', -- individual, wholesaler, retailer, restaurant, processor
    gstin VARCHAR(20),
    delivery_address TEXT,
    verification_status VARCHAR(20) DEFAULT 'unverified',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Farms
CREATE TABLE IF NOT EXISTS farms (
    id VARCHAR(36) PRIMARY KEY,
    farmer_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    total_area_acres DECIMAL(10, 2) NOT NULL,
    soil_type VARCHAR(50),
    irrigation_source VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES farmer_profiles(id) ON DELETE CASCADE,
    INDEX idx_farms_farmer (farmer_id)
);

-- 6. Farm Locations
CREATE TABLE IF NOT EXISTS farm_locations (
    id VARCHAR(36) PRIMARY KEY,
    farm_id VARCHAR(36) NOT NULL UNIQUE,
    address_line TEXT,
    village VARCHAR(100),
    taluka VARCHAR(100),
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
    INDEX idx_locations_district_state (district, state)
);

-- 7. Crops
CREATE TABLE IF NOT EXISTS crops (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    botanical_name VARCHAR(100),
    category VARCHAR(50) NOT NULL, -- cereal, pulse, vegetable, fruit, spice, oilseed
    variety VARCHAR(100),
    typical_season VARCHAR(50),
    shelf_life_days INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_crops_name_variety (name, variety)
);

-- 8. Farm Crops
CREATE TABLE IF NOT EXISTS farm_crops (
    id VARCHAR(36) PRIMARY KEY,
    farm_id VARCHAR(36) NOT NULL,
    crop_id VARCHAR(36) NOT NULL,
    allocated_acres DECIMAL(10, 2) NOT NULL,
    season VARCHAR(50),
    status VARCHAR(20) DEFAULT 'planned', -- planned, active, harvested
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
    FOREIGN KEY (crop_id) REFERENCES crops(id)
);

-- 9. Cultivation Cycles
CREATE TABLE IF NOT EXISTS cultivation_cycles (
    id VARCHAR(36) PRIMARY KEY,
    farm_crop_id VARCHAR(36) NOT NULL,
    sowing_date DATE NOT NULL,
    expected_harvest_date DATE,
    actual_harvest_date DATE,
    input_costs_inr DECIMAL(12, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'in_progress', -- in_progress, completed, failed
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (farm_crop_id) REFERENCES farm_crops(id) ON DELETE CASCADE
);

-- 10. Production Records
CREATE TABLE IF NOT EXISTS production_records (
    id VARCHAR(36) PRIMARY KEY,
    cultivation_cycle_id VARCHAR(36) NOT NULL,
    harvest_date DATE NOT NULL,
    quantity_kg DECIMAL(12, 2) NOT NULL,
    grade VARCHAR(10), -- A, B, C
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cultivation_cycle_id) REFERENCES cultivation_cycles(id) ON DELETE CASCADE
);

-- 11. Market Prices
CREATE TABLE IF NOT EXISTS market_prices (
    id VARCHAR(36) PRIMARY KEY,
    commodity VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    market VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    price_date DATE NOT NULL,
    min_price_per_kg DECIMAL(10, 2) NOT NULL,
    max_price_per_kg DECIMAL(10, 2) NOT NULL,
    modal_price_per_kg DECIMAL(10, 2) NOT NULL,
    units VARCHAR(20) DEFAULT 'INR/kg',
    data_source VARCHAR(100) NOT NULL, -- e.g., Agmarknet, Gov_Ingestion
    ingestion_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_market_prices_lookup (commodity, district, state, price_date)
);

-- 12. Market Arrivals
CREATE TABLE IF NOT EXISTS market_arrivals (
    id VARCHAR(36) PRIMARY KEY,
    commodity VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    market VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    arrival_date DATE NOT NULL,
    arrival_quantity_tonnes DECIMAL(12, 2) NOT NULL,
    data_source VARCHAR(100) NOT NULL,
    ingestion_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_arrivals_lookup (commodity, district, arrival_date)
);

-- 13. Price Predictions
CREATE TABLE IF NOT EXISTS price_predictions (
    id VARCHAR(36) PRIMARY KEY,
    crop_name VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    target_date DATE NOT NULL,
    predicted_price_per_kg DECIMAL(10, 2) NOT NULL,
    lower_range DECIMAL(10, 2) NOT NULL,
    upper_range DECIMAL(10, 2) NOT NULL,
    confidence_score DECIMAL(5, 4) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    prediction_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_price_pred_lookup (crop_name, district, target_date)
);

-- 14. Demand History
CREATE TABLE IF NOT EXISTS demand_history (
    id VARCHAR(36) PRIMARY KEY,
    crop_name VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    record_date DATE NOT NULL,
    total_sales_volume_kg DECIMAL(12, 2) NOT NULL,
    unmet_request_volume_kg DECIMAL(12, 2) DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_demand_history_lookup (crop_name, district, record_date)
);

-- 15. Demand Predictions
CREATE TABLE IF NOT EXISTS demand_predictions (
    id VARCHAR(36) PRIMARY KEY,
    crop_name VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    forecast_horizon_days INT NOT NULL,
    forecast_date DATE NOT NULL,
    forecasted_demand_kg DECIMAL(12, 2) NOT NULL,
    demand_level VARCHAR(20) NOT NULL, -- Low, Medium, High, Critical
    confidence_score DECIMAL(5, 4) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    prediction_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 16. Produce Batches
CREATE TABLE IF NOT EXISTS produce_batches (
    id VARCHAR(36) PRIMARY KEY,
    batch_code VARCHAR(50) NOT NULL UNIQUE,
    farmer_id VARCHAR(36) NOT NULL,
    farm_id VARCHAR(36) NOT NULL,
    crop_id VARCHAR(36) NOT NULL,
    harvest_date DATE NOT NULL,
    initial_quantity_kg DECIMAL(12, 2) NOT NULL,
    remaining_quantity_kg DECIMAL(12, 2) NOT NULL,
    quality_grade VARCHAR(10) DEFAULT 'A',
    image_urls JSON,
    status VARCHAR(20) DEFAULT 'available', -- available, reserved, sold_out, expired
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES farmer_profiles(id),
    FOREIGN KEY (farm_id) REFERENCES farms(id),
    FOREIGN KEY (crop_id) REFERENCES crops(id),
    INDEX idx_batches_farmer (farmer_id)
);

-- 17. Inventory
CREATE TABLE IF NOT EXISTS inventory (
    id VARCHAR(36) PRIMARY KEY,
    produce_batch_id VARCHAR(36) NOT NULL UNIQUE,
    storage_location TEXT,
    storage_type VARCHAR(50) DEFAULT 'ambient', -- ambient, cold_storage, warehouse
    temperature_celsius DECIMAL(4, 1),
    expiry_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (produce_batch_id) REFERENCES produce_batches(id) ON DELETE CASCADE
);

-- 18. Quality Records
CREATE TABLE IF NOT EXISTS quality_records (
    id VARCHAR(36) PRIMARY KEY,
    produce_batch_id VARCHAR(36) NOT NULL,
    inspector_type VARCHAR(50) DEFAULT 'self', -- self, third_party, agrimark_agent
    moisture_content_pct DECIMAL(5, 2),
    grade VARCHAR(10) NOT NULL,
    comments TEXT,
    inspection_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (produce_batch_id) REFERENCES produce_batches(id) ON DELETE CASCADE
);

-- 19. Listings
CREATE TABLE IF NOT EXISTS listings (
    id VARCHAR(36) PRIMARY KEY,
    farmer_id VARCHAR(36) NOT NULL,
    produce_batch_id VARCHAR(36) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    listing_type VARCHAR(20) NOT NULL, -- fixed_price, negotiable, bulk
    price_per_kg DECIMAL(10, 2) NOT NULL,
    min_order_quantity_kg DECIMAL(10, 2) DEFAULT 1.00,
    available_quantity_kg DECIMAL(12, 2) NOT NULL,
    location_district VARCHAR(100) NOT NULL,
    location_state VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- active, paused, sold_out, cancelled
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES farmer_profiles(id),
    FOREIGN KEY (produce_batch_id) REFERENCES produce_batches(id),
    INDEX idx_listings_search (location_district, status, listing_type)
);

-- 20. Buyer Requests
CREATE TABLE IF NOT EXISTS buyer_requests (
    id VARCHAR(36) PRIMARY KEY,
    buyer_id VARCHAR(36) NOT NULL,
    crop_name VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    required_quantity_kg DECIMAL(12, 2) NOT NULL,
    max_price_per_kg DECIMAL(10, 2) NOT NULL,
    target_district VARCHAR(100) NOT NULL,
    target_state VARCHAR(100) NOT NULL,
    required_by_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'open', -- open, matched, fulfilled, cancelled
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES buyer_profiles(id),
    INDEX idx_requests_crop_loc (crop_name, target_district, status)
);

-- 21. Offers
CREATE TABLE IF NOT EXISTS offers (
    id VARCHAR(36) PRIMARY KEY,
    listing_id VARCHAR(36),
    buyer_request_id VARCHAR(36),
    offered_by_user_id VARCHAR(36) NOT NULL,
    quantity_kg DECIMAL(12, 2) NOT NULL,
    price_per_kg DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, rejected, counter_offered, expired
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES listings(id),
    FOREIGN KEY (buyer_request_id) REFERENCES buyer_requests(id),
    FOREIGN KEY (offered_by_user_id) REFERENCES users(id)
);

-- 22. Matches
CREATE TABLE IF NOT EXISTS matches (
    id VARCHAR(36) PRIMARY KEY,
    buyer_request_id VARCHAR(36) NOT NULL,
    listing_id VARCHAR(36) NOT NULL,
    match_score DECIMAL(5, 4) NOT NULL,
    distance_km DECIMAL(8, 2),
    status VARCHAR(20) DEFAULT 'suggested', -- suggested, accepted, dismissed
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_request_id) REFERENCES buyer_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

-- 23. Carts
CREATE TABLE IF NOT EXISTS carts (
    id VARCHAR(36) PRIMARY KEY,
    buyer_id VARCHAR(36) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES buyer_profiles(id) ON DELETE CASCADE
);

-- 24. Cart Items
CREATE TABLE IF NOT EXISTS cart_items (
    id VARCHAR(36) PRIMARY KEY,
    cart_id VARCHAR(36) NOT NULL,
    listing_id VARCHAR(36) NOT NULL,
    quantity_kg DECIMAL(12, 2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

-- 25. Orders
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    buyer_id VARCHAR(36) NOT NULL,
    farmer_id VARCHAR(36) NOT NULL,
    total_amount_inr DECIMAL(12, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'placed', -- placed, confirmed, processing, dispatched, delivered, cancelled
    delivery_address TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES buyer_profiles(id),
    FOREIGN KEY (farmer_id) REFERENCES farmer_profiles(id),
    INDEX idx_orders_buyer (buyer_id),
    INDEX idx_orders_farmer (farmer_id)
);

-- 26. Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    listing_id VARCHAR(36) NOT NULL,
    produce_batch_id VARCHAR(36) NOT NULL,
    quantity_kg DECIMAL(12, 2) NOT NULL,
    unit_price_per_kg DECIMAL(10, 2) NOT NULL,
    total_price_inr DECIMAL(12, 2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (listing_id) REFERENCES listings(id),
    FOREIGN KEY (produce_batch_id) REFERENCES produce_batches(id)
);

-- 27. Transporters
CREATE TABLE IF NOT EXISTS transporters (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    vehicle_number VARCHAR(36),
    service_regions TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 28. Delivery Orders
CREATE TABLE IF NOT EXISTS delivery_orders (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL UNIQUE,
    transporter_id VARCHAR(36),
    pickup_address TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    estimated_delivery_date DATE,
    actual_delivery_date DATE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, assigned, in_transit, delivered, failed
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (transporter_id) REFERENCES transporters(id)
);

-- 29. Tracking Events
CREATE TABLE IF NOT EXISTS tracking_events (
    id VARCHAR(36) PRIMARY KEY,
    delivery_order_id VARCHAR(36) NOT NULL,
    status VARCHAR(50) NOT NULL,
    location VARCHAR(150),
    description TEXT,
    event_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (delivery_order_id) REFERENCES delivery_orders(id) ON DELETE CASCADE
);

-- 30. Payments
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    transaction_reference VARCHAR(100) UNIQUE,
    amount_inr DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'upi', -- upi, netbanking, card, cod, escrow
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, refunded
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- 31. Settlements
CREATE TABLE IF NOT EXISTS settlements (
    id VARCHAR(36) PRIMARY KEY,
    farmer_id VARCHAR(36) NOT NULL,
    order_id VARCHAR(36) NOT NULL,
    amount_inr DECIMAL(12, 2) NOT NULL,
    platform_fee_inr DECIMAL(10, 2) DEFAULT 0.00,
    net_payout_inr DECIMAL(12, 2) NOT NULL,
    payout_status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed
    payout_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES farmer_profiles(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- 32. Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    reviewer_user_id VARCHAR(36) NOT NULL,
    reviewee_user_id VARCHAR(36) NOT NULL,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (reviewer_user_id) REFERENCES users(id),
    FOREIGN KEY (reviewee_user_id) REFERENCES users(id)
);

-- 33. Ratings
CREATE TABLE IF NOT EXISTS ratings (
    id VARCHAR(36) PRIMARY KEY,
    review_id VARCHAR(36) NOT NULL UNIQUE,
    score INT NOT NULL CHECK (score BETWEEN 1 AND 5),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
);

-- 34. Verification Records
CREATE TABLE IF NOT EXISTS verification_records (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    document_type VARCHAR(50) NOT NULL, -- aadhaar, gstin, land_record, fpo_id
    document_number VARCHAR(100),
    verification_status VARCHAR(20) DEFAULT 'pending',
    verified_by_user_id VARCHAR(36),
    verification_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 35. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'system', -- order, price_alert, match, system
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notifications_user (user_id, is_read)
);

-- 36. AI Conversations
CREATE TABLE IF NOT EXISTS ai_conversations (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    agent_type VARCHAR(50) NOT NULL, -- farmer_assistant, marketplace_assistant, admin
    title VARCHAR(150),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 37. AI Agent Runs
CREATE TABLE IF NOT EXISTS ai_agent_runs (
    id VARCHAR(36) PRIMARY KEY,
    conversation_id VARCHAR(36) NOT NULL,
    agent_name VARCHAR(50) NOT NULL,
    prompt_text TEXT NOT NULL,
    response_text TEXT,
    tool_calls JSON,
    execution_time_ms INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE
);

-- 38. AI Recommendations
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    recommendation_type VARCHAR(50) NOT NULL, -- crop_planning, pricing, buyer_match
    content JSON NOT NULL,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 39. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(50) NOT NULL,
    entity_id VARCHAR(36),
    changes JSON,
    ip_address VARCHAR(45),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_logs_user_action (user_id, action)
);

-- Seed Initial System Roles
INSERT IGNORE INTO roles (id, name, description) VALUES
('role-admin-001', 'admin', 'System Administrator with elevated system access'),
('role-farmer-002', 'farmer', 'Registered agricultural produce producer'),
('role-buyer-003', 'buyer', 'Consumer or commercial produce purchaser'),
('role-fpo-004', 'fpo', 'Farmer Producer Organization administrator');

-- 40. STAGE 26: Bio-Agriculture, Seed & Genetic Intelligence OS
CREATE TABLE IF NOT EXISTS seed_varieties (
    id VARCHAR(36) PRIMARY KEY,
    variety_code VARCHAR(100) NOT NULL UNIQUE,
    crop_name VARCHAR(100) NOT NULL,
    species VARCHAR(100) NOT NULL,
    variety_name VARCHAR(150) NOT NULL,
    producer_name VARCHAR(150) NOT NULL,
    maturity_duration_days INT NOT NULL,
    season VARCHAR(50) NOT NULL,
    planting_window VARCHAR(100),
    min_yield_kg_per_acre DECIMAL(10, 2),
    max_yield_kg_per_acre DECIMAL(10, 2),
    quality_traits JSON,
    disease_resistance JSON,
    pest_resistance JSON,
    drought_tolerance VARCHAR(50) DEFAULT 'MODERATE',
    heat_tolerance VARCHAR(50) DEFAULT 'MODERATE',
    salinity_tolerance VARCHAR(50) DEFAULT 'LOW',
    water_requirement_mm DECIMAL(8, 2),
    soil_suitability JSON,
    geographical_suitability JSON,
    evidence_level VARCHAR(30) DEFAULT 'VERIFIED',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS seed_producers (
    id VARCHAR(36) PRIMARY KEY,
    producer_code VARCHAR(100) NOT NULL UNIQUE,
    company_name VARCHAR(150) NOT NULL,
    license_number VARCHAR(100) NOT NULL,
    verification_status VARCHAR(30) DEFAULT 'VERIFIED',
    contact_email VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS seed_batches (
    id VARCHAR(36) PRIMARY KEY,
    batch_number VARCHAR(100) NOT NULL UNIQUE,
    variety_code VARCHAR(100) NOT NULL,
    producer_code VARCHAR(100) NOT NULL,
    production_year INT NOT NULL,
    quantity_kg DECIMAL(12, 2) NOT NULL,
    qr_code_hash VARCHAR(128) UNIQUE,
    certification_status VARCHAR(50) DEFAULT 'TESTED',
    certification_ref VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS seed_tests (
    id VARCHAR(36) PRIMARY KEY,
    test_code VARCHAR(100) NOT NULL UNIQUE,
    batch_number VARCHAR(100) NOT NULL,
    testing_lab VARCHAR(150) NOT NULL,
    test_date DATE NOT NULL,
    germination_pct DECIMAL(5, 2) NOT NULL,
    purity_pct DECIMAL(5, 2) NOT NULL,
    moisture_pct DECIMAL(5, 2) NOT NULL,
    vigor_index DECIMAL(8, 2),
    disease_contamination_pct DECIMAL(5, 2) DEFAULT 0.00,
    certificate_reference VARCHAR(100),
    passed BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS germplasm_accessions (
    id VARCHAR(36) PRIMARY KEY,
    accession_number VARCHAR(100) NOT NULL UNIQUE,
    species VARCHAR(100) NOT NULL,
    source_origin VARCHAR(100) NOT NULL,
    population_type VARCHAR(50),
    conservation_status VARCHAR(50) DEFAULT 'ACTIVE',
    utilization_history TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trait_ontology (
    id VARCHAR(36) PRIMARY KEY,
    trait_code VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    trait_name VARCHAR(150) NOT NULL,
    parent_trait_code VARCHAR(100),
    synonyms JSON,
    tamil_aliases JSON,
    regional_terms JSON,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gxe_analyses (
    id VARCHAR(36) PRIMARY KEY,
    analysis_code VARCHAR(100) NOT NULL UNIQUE,
    variety_code VARCHAR(100) NOT NULL,
    environment_code VARCHAR(100) NOT NULL,
    season VARCHAR(50) NOT NULL,
    soil_type VARCHAR(50),
    stability_score DECIMAL(5, 4) NOT NULL,
    adaptation_score DECIMAL(5, 4) NOT NULL,
    risk_index DECIMAL(5, 4) NOT NULL,
    performance_distribution JSON,
    evidence_level VARCHAR(30) DEFAULT 'TRIAL',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bio_products (
    id VARCHAR(36) PRIMARY KEY,
    product_code VARCHAR(100) NOT NULL UNIQUE,
    product_name VARCHAR(150) NOT NULL,
    product_type VARCHAR(50) NOT NULL,
    manufacturer VARCHAR(150) NOT NULL,
    composition_metadata JSON,
    storage_instructions TEXT,
    application_method VARCHAR(100),
    compatibility_notes JSON,
    approval_status VARCHAR(30) DEFAULT 'RESEARCH_ONLY',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bio_product_evidence (
    id VARCHAR(36) PRIMARY KEY,
    id_code VARCHAR(100) NOT NULL UNIQUE,
    product_code VARCHAR(100) NOT NULL,
    trial_ref VARCHAR(100),
    baseline_yield DECIMAL(10, 2),
    control_yield DECIMAL(10, 2),
    treatment_yield DECIMAL(10, 2),
    yield_delta_pct DECIMAL(5, 2),
    disease_reduction_pct DECIMAL(5, 2),
    soil_biological_activity_delta DECIMAL(5, 2),
    evidence_level VARCHAR(30) DEFAULT 'TRIAL',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS seed_authenticity_flags (
    id VARCHAR(36) PRIMARY KEY,
    batch_number VARCHAR(100) NOT NULL,
    risk_level VARCHAR(20) DEFAULT 'RISK_FLAG',
    flag_reason VARCHAR(150) NOT NULL,
    details JSON,
    flagged_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS biological_reviews (
    id VARCHAR(36) PRIMARY KEY,
    review_id VARCHAR(100) NOT NULL UNIQUE,
    target_type VARCHAR(50) NOT NULL,
    target_code VARCHAR(100) NOT NULL,
    reviewer_role VARCHAR(50) NOT NULL,
    reviewer_name VARCHAR(100) NOT NULL,
    action VARCHAR(30) NOT NULL,
    comments TEXT,
    reviewed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

