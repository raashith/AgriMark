import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xrcqzpnstdbbtafhcwbb.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'ey...';

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: { get(name: string) { return cookieStore.get(name)?.value; } },
    });

    const body = await request.json();
    const { source, source_url, license, raw_records } = body;

    if (!source || !Array.isArray(raw_records)) {
      return NextResponse.json({ error: 'Source name and raw_records array required.' }, { status: 400 });
    }

    let ingestedCount = 0;
    let quarantinedCount = 0;

    for (const record of raw_records) {
      // Data validation layer
      const isValid = record.commodity && (record.modal_price || record.price || record.min_price) && record.district;
      
      const checksum = `${source}-${record.commodity}-${record.district}-${record.observation_date || new Date().toISOString().split('T')[0]}`;

      if (!isValid) {
        quarantinedCount++;
        await supabase.from('ingestion_quarantine').insert({
          source,
          quarantine_reason: 'Missing mandatory fields (commodity, price, district)',
          quarantined_at: new Date().toISOString(),
          raw_payload: record,
        });
        continue;
      }

      // Canonical insertion
      const { error: insertErr } = await supabase.from('raw_data_ingestion').upsert({
        source,
        source_url: source_url || 'https://agmarknet.gov.in',
        license: license || 'Open Government Data License (OGDL)',
        retrieved_at: new Date().toISOString(),
        published_at: record.observation_date || new Date().toISOString(),
        checksum,
        schema_version: 'v1',
        quality_score: 0.98,
        validation_status: 'canonical',
        raw_payload: record,
      }, { onConflict: 'checksum' });

      if (!insertErr) {
        ingestedCount++;
        // Sync to public market_prices canonical view
        await supabase.from('market_prices').upsert({
          mandi_name: record.mandi_name || record.market || `${record.district} Mandi`,
          district: record.district,
          state: record.state || 'Tamil Nadu',
          commodity: record.commodity,
          observation_date: record.observation_date || new Date().toISOString().split('T')[0],
          min_price: record.min_price || record.price,
          modal_price: record.modal_price || record.price,
          max_price: record.max_price || record.price,
          unit: record.unit || 'QUINTAL',
          source_name: source,
        });
      }
    }

    return NextResponse.json({
      success: true,
      source,
      ingestedCount,
      quarantinedCount,
      totalProcessed: raw_records.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}



