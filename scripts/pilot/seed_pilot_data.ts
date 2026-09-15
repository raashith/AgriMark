/**
 * AgriMark Staging/Development Pilot Seed Dataset Script
 * 
 * Safety: Uses strictly synthetic identity prefixes (`pilot_farmer_*`, `pilot_buyer_*`, `pilot_farm_*`)
 * Environment Guard: Refuses to seed if NODE_ENV is 'production' unless explicitly forced with FORCE_PILOT_SEED=true.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xrcqzpnstdbbtafhcwbb.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (process.env.NODE_ENV === 'production' && !process.env.FORCE_PILOT_SEED) {
  console.error('[SAFETY BLOCK] Refusing to seed pilot dataset into production environment without FORCE_PILOT_SEED=true.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const PILOT_DATASET = {
  farmers: [
    {
      id: '00000000-0000-4000-a000-000000000001',
      email: 'pilot_farmer_selvam@agrimark.internal',
      full_name: 'Pilot Farmer Selvam (Synthetic)',
      phone: '+919876543210',
      role: 'farmer',
      village: 'Kallakurichi',
      district: 'Kallakurichi',
      state: 'Tamil Nadu',
      kyc_status: 'verified',
    },
    {
      id: '00000000-0000-4000-a000-000000000002',
      email: 'pilot_farmer_ramesh@agrimark.internal',
      full_name: 'Pilot Farmer Ramesh (Synthetic)',
      phone: '+919876543211',
      role: 'farmer',
      village: 'Erode',
      district: 'Erode',
      state: 'Tamil Nadu',
      kyc_status: 'verified',
    },
  ],
  buyers: [
    {
      id: '00000000-0000-4000-a000-000000000101',
      email: 'pilot_buyer_freshgro@agrimark.internal',
      full_name: 'Pilot Buyer FreshGro Wholesalers (Synthetic)',
      phone: '+919876543220',
      role: 'buyer',
      village: 'Koyambedu Market',
      district: 'Chennai',
      state: 'Tamil Nadu',
      kyc_status: 'verified',
    },
  ],
  farms: [
    {
      id: 'f0000000-0000-4000-a000-000000000001',
      owner_id: '00000000-0000-4000-a000-000000000001',
      name: 'Selvam Greenacres Organic Farm (Pilot)',
      village: 'Kallakurichi',
      district: 'Kallakurichi',
      state: 'Tamil Nadu',
      area_acres: 4.5,
      soil_type: 'Red Loam',
      irrigation_source: 'Borewell & Drip',
      water_source: 'Underground Aquifer',
      tenancy_type: 'owned',
    },
  ],
  cultivations: [
    {
      id: 'c0000000-0000-4000-a000-000000000001',
      farm_id: 'f0000000-0000-4000-a000-000000000001',
      farmer_id: '00000000-0000-4000-a000-000000000001',
      crop_id: 'crop-turmeric',
      crop_name: 'Erode Salem Turmeric',
      variety: 'PTS-10',
      season: 'Perennial',
      sowing_date: '2026-01-15',
      expected_harvest_date: '2026-08-30',
      area_acres: 2.0,
      expected_yield_kg: 5000,
      status: 'active',
      organic_practice: true,
    },
  ],
  harvests: [
    {
      id: 'h0000000-0000-4000-a000-000000000001',
      cultivation_id: 'c0000000-0000-4000-a000-000000000001',
      harvest_date: '2026-09-01',
      total_quantity_kg: 2500,
      quality_grade: 'Grade A',
      moisture_pct: 11.2,
      packaging_type: 'Jute Bags 50kg',
      trace_code: 'TRC-TURMERIC-2026-001',
    },
  ],
  produceLots: [
    {
      id: 'p0000000-0000-4000-a000-000000000001',
      owner_id: '00000000-0000-4000-a000-000000000001',
      harvest_batch_id: 'h0000000-0000-4000-a000-000000000001',
      cultivation_id: 'c0000000-0000-4000-a000-000000000001',
      crop_id: 'crop-turmeric',
      crop_name: 'Erode Salem Turmeric',
      quantity: 2500,
      quantity_kg: 2500,
      available_quantity: 2500,
      unit: 'KG',
      quality_grade: 'Grade A',
      harvested_at: '2026-09-01',
      trace_code: 'TRC-TURMERIC-2026-001',
      is_listed: true,
      status: 'available',
    },
  ],
  listings: [
    {
      id: 'l0000000-0000-4000-a000-000000000001',
      seller_id: '00000000-0000-4000-a000-000000000001',
      lot_id: 'p0000000-0000-4000-a000-000000000001',
      title: 'Organic Salem Turmeric Lot (High Curcumin)',
      price_per_unit: 145.0,
      price_per_kg: 145.0,
      currency: 'INR',
      min_order_quantity: 100,
      min_order_quantity_kg: 100,
      quantity_available_kg: 2500,
      crop_name: 'Turmeric',
      crop_category: 'Spices',
      quality_grade: 'Grade A',
      location: 'Kallakurichi',
      district: 'Kallakurichi',
      state: 'Tamil Nadu',
      seller_name: 'Pilot Farmer Selvam (Synthetic)',
      status: 'active',
    },
  ],
  rfqs: [
    {
      id: 'r0000000-0000-4000-a000-000000000001',
      buyer_id: '00000000-0000-4000-a000-000000000101',
      buyer_name: 'Pilot Buyer FreshGro Wholesalers (Synthetic)',
      crop_name: 'Organic Turmeric',
      required_quantity_kg: 1000,
      target_price_per_kg: 140.0,
      quality_grade: 'Grade A',
      location: 'Chennai Market Hub',
      needed_by_date: '2026-09-25',
      status: 'open',
    },
  ],
};

export async function seedPilotData() {
  console.log('🌱 Starting AgriMark Pilot Dataset Seed...');
  
  try {
    const { error: pErr } = await supabase.from('profiles').upsert([...PILOT_DATASET.farmers, ...PILOT_DATASET.buyers]);
    if (pErr) console.warn('Profiles seed warning:', pErr.message);

    const { error: fErr } = await supabase.from('farms').upsert(PILOT_DATASET.farms);
    if (fErr) console.warn('Farms seed warning:', fErr.message);

    const { error: cErr } = await supabase.from('cultivations').upsert(PILOT_DATASET.cultivations);
    if (cErr) console.warn('Cultivations seed warning:', cErr.message);

    const { error: hErr } = await supabase.from('harvest_batches').upsert(PILOT_DATASET.harvests);
    if (hErr) console.warn('Harvests seed warning:', hErr.message);

    const { error: lErr } = await supabase.from('produce_lots').upsert(PILOT_DATASET.produceLots);
    if (lErr) console.warn('Produce Lots seed warning:', lErr.message);

    const { error: listErr } = await supabase.from('listings').upsert(PILOT_DATASET.listings);
    if (listErr) console.warn('Listings seed warning:', listErr.message);

    const { error: rfqErr } = await supabase.from('buyer_rfqs').upsert(PILOT_DATASET.rfqs);
    if (rfqErr) console.warn('RFQs seed warning:', rfqErr.message);

    console.log('✅ AgriMark Pilot Dataset Seed Complete!');
  } catch (err) {
    console.error('❌ Pilot dataset seed failed:', err);
  }
}

if (require.main === module) {
  seedPilotData();
}
