# AgriMark Canonical Database Specification (PostgreSQL / Supabase)

## 1. Executive Summary
**PostgreSQL 14+ / Supabase** is the canonical production database infrastructure for AgriMark. All data models, relationship constraints, transactions, indexes, and Row Level Security (RLS) policies are designed for PostgreSQL / Supabase compliance.

---

## 2. Entity-Relationship (ER) & Schema Overview

```
+----------------+        +-----------------+        +------------------+
|     users      |<-------| farmer_profiles |<-------|      farms       |
| (Auth & Roles) |        |   (Farmer ID)   |        |  (Acreage/Soil)  |
+----------------+        +-----------------+        +------------------+
        |                          |                          |
        |                          v                          v
        |                 +-----------------+        +------------------+
        |                 |  produce_lots   |<-------|      crops       |
        |                 | (Qty/Reserved)  |        | (Planted/Status) |
        |                 +-----------------+        +------------------+
        v                          |
+----------------+                 v
| buyer_profiles |        +-----------------+
|  (Buyer ID)    |        |  mp_listings    |
+----------------+        | (Price/Status)  |
        |                 +-----------------+
        |                          |
        v                          v
+-------------------------------------------+
|             marketplace_orders            |
|       (Buyer ID, Listing ID, Quantity)    |
+-------------------------------------------+
```

---

## 3. Core Table Definitions & Constraints

### 3.1 `users` & Identity
- **Primary Key**: `id` (VARCHAR(36) / UUID)
- **Foreign Keys**: `role_id` -> `roles(id)`
- **Constraints**: `email UNIQUE`, `phone UNIQUE`, `status CHECK ('active', 'suspended', 'pending_verification')`

### 3.2 `produce_lots` & Atomic Inventory
- **Primary Key**: `id` (VARCHAR(36) / UUID)
- **Foreign Keys**: `farmer_id` -> `farmer_profiles(id)`, `farm_id` -> `farms(id)`
- **Constraints**: `quantity_kg >= 0`, `reserved_quantity_kg >= 0`, `CHECK (reserved_quantity_kg <= quantity_kg)`
- **Triggers**: `trg_validate_inventory_reservation` enforcing non-negative available stock at database level.

### 3.3 `marketplace_listings` & Commerce
- **Primary Key**: `id` (VARCHAR(36) / UUID)
- **Foreign Keys**: `lot_id` -> `produce_lots(id)`, `seller_id` -> `farmer_profiles(id)`
- **Constraints**: `price_per_kg > 0`, `available_quantity_kg >= 0`

### 3.4 `marketplace_orders` & Transactions
- **Primary Key**: `id` (VARCHAR(36) / UUID)
- **Foreign Keys**: `listing_id` -> `marketplace_listings(id)`, `buyer_id` -> `buyer_profiles(id)`
- **Constraints**: `quantity_kg > 0`, `total_amount > 0`, `order_status CHECK ('CREATED', 'CONFIRMED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED')`

---

## 4. Row Level Security (RLS) Policies

All public tables have RLS enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`).

### Policy Rules Matrix

| Table | Policy Name | Permitted Role | Access Rule (`USING` clause) |
|---|---|---|---|
| `roles` | `roles_select_policy` | Public / Anon | `USING (true)` |
| `users` | `users_self_policy` | Authenticated | `USING (auth.uid()::text = id OR auth.role() = 'service_role')` |
| `farmer_profiles` | `farmer_self_policy` | Authenticated | `USING (user_id = auth.uid()::text OR auth.role() = 'service_role')` |
| `farms` | `farms_owner_policy` | Farmer | `USING (farmer_id IN (SELECT id FROM farmer_profiles WHERE user_id = auth.uid()::text))` |
| `produce_lots` | `lots_owner_policy` | Farmer | `USING (farmer_id IN (SELECT id FROM farmer_profiles WHERE user_id = auth.uid()::text))` |
| `marketplace_listings` | `listings_read_policy` | Public / Buyer | `USING (status = 'PUBLISHED')` |
| `marketplace_listings` | `listings_owner_policy` | Farmer Seller | `USING (seller_id IN (SELECT id FROM farmer_profiles WHERE user_id = auth.uid()::text))` |
| `marketplace_orders` | `orders_party_policy` | Buyer / Seller | `USING (buyer_id IN (SELECT id FROM buyer_profiles WHERE user_id = auth.uid()::text))` |

---

## 5. Security Definer Functions & Auditing

All database trigger procedures and calculation routines are defined with explicit `SECURITY DEFINER` and `SET search_path = public` to prevent schema injection vulnerabilities:

```sql
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
```

---

## 6. Migration Strategy

- **Production Target**: Supabase Managed PostgreSQL Instance (`SUPABASE_URL`, `DATABASE_URL`)
- **DDL Baseline**: [`database/schema_postgresql.sql`](file:///d:/AgriMark/database/schema_postgresql.sql)
- **Alembic Migrations**: 21 migration scripts (`001_initial_schema.py` through `021_stage_30_supabase_canonical_schema.py`)
- **Development & CI Fallback**: SQLite in-memory engine when `DATABASE_URL` is omitted.
