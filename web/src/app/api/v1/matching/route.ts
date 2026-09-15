import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xrcqzpnstdbbtafhcwbb.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'ey...';

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: { get(name: string) { return cookieStore.get(name)?.value; } },
    });

    const body = await request.json();
    const { buyer_id, crop_name, required_quantity_kg, target_price_per_kg, district } = body;

    if (!crop_name || !required_quantity_kg) {
      return NextResponse.json({ error: 'Crop name and required quantity required.' }, { status: 400 });
    }

    // Fetch active produce listings
    const { data: listings } = await supabase
      .from('listings')
      .select('*')
      .eq('status', 'active');

    const matches = (listings || []).map((listing) => {
      let score = 0;
      const matchedFactors: string[] = [];

      // Crop name match
      if (listing.crop_name?.toLowerCase().includes(crop_name.toLowerCase()) || crop_name.toLowerCase().includes(listing.crop_name?.toLowerCase() || '')) {
        score += 35;
        matchedFactors.push('Crop Commodity Match');
      }

      // Quantity compatibility
      const available = listing.quantity_available_kg || 0;
      if (available >= required_quantity_kg) {
        score += 25;
        matchedFactors.push('Sufficient Quantity Available');
      } else if (available > 0) {
        score += Math.round((available / required_quantity_kg) * 20);
        matchedFactors.push('Partial Quantity Match');
      }

      // District / Geographic compatibility
      if (district && listing.district?.toLowerCase() === district.toLowerCase()) {
        score += 20;
        matchedFactors.push('Same District Proximity');
      }

      // Price compatibility
      if (target_price_per_kg && listing.price_per_kg) {
        if (listing.price_per_kg <= target_price_per_kg) {
          score += 20;
          matchedFactors.push('Price Target Satisfied');
        } else {
          const diffPct = ((listing.price_per_kg - target_price_per_kg) / target_price_per_kg) * 100;
          if (diffPct <= 10) score += 10;
        }
      }

      return {
        listing,
        matchScorePct: Math.min(100, score),
        matchedFactors,
        priceDifference: listing.price_per_kg && target_price_per_kg ? listing.price_per_kg - target_price_per_kg : 0,
      };
    })
    .filter((m) => m.matchScorePct >= 30)
    .sort((a, b) => b.matchScorePct - a.matchScorePct);

    return NextResponse.json({
      success: true,
      query: { crop_name, required_quantity_kg, target_price_per_kg, district },
      totalMatches: matches.length,
      matches,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
