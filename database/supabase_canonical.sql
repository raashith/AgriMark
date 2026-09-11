-- AgriMark canonical Supabase/PostgreSQL schema
-- This file documents and reproduces the production schema applied to Supabase.

create extension if not exists pgcrypto;

-- Canonical application tables are created by migrations in Supabase.
-- Keep this file aligned with the migrations and do not introduce a second production database.

comment on schema public is 'AgriMark canonical PostgreSQL/Supabase application schema';
