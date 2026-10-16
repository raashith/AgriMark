import { createClient } from '@supabase/supabase-js';

// This client is intentionally separate from the app's existing auth/data client.
// Mandi observations are in the selected production AgriMark market-data project.
// Only a publishable key is used here; never place service-role keys in browser code.
const marketUrl =
  process.env.NEXT_PUBLIC_MARKET_SUPABASE_URL || 'https://tsdjtlmrvbspyzgwmccg.supabase.co';
const marketPublishableKey =
  process.env.NEXT_PUBLIC_MARKET_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_YvBVc_mQXS5606qGvJqZ1g_kg9ot7TF';

export const marketSupabase = createClient(marketUrl, marketPublishableKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
