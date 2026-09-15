import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xrcqzpnstdbbtafhcwbb.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'ey...';

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: { get(name: string) { return cookieStore.get(name)?.value; } },
    });

    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district');
    const state = searchParams.get('state');

    // Run server-side aggregations across tables
    const [profilesRes, farmsRes, listingsRes, ordersRes] = await Promise.all([
      supabase.from('profiles').select('id, role', { count: 'exact' }).eq('role', 'farmer'),
      supabase.from('farms').select('id, area_acres', { count: 'exact' }),
      supabase.from('listings').select('id, price_per_kg, quantity_available_kg', { count: 'exact' }).eq('status', 'active'),
      supabase.from('orders').select('id, total_amount, status', { count: 'exact' }),
    ]);

    const activeFarmersCount = profilesRes.count || 0;
    const totalFarmsCount = farmsRes.count || 0;
    const totalFarmAcres = (farmsRes.data || []).reduce((acc: number, f: any) => acc + (f.area_acres || 0), 0);

    const activeListingsCount = listingsRes.count || 0;
    const totalAvailableProduceKg = (listingsRes.data || []).reduce((acc: number, l: any) => acc + (l.quantity_available_kg || 0), 0);
    const avgAskingPriceKg = (listingsRes.data || []).length > 0
      ? (listingsRes.data || []).reduce((acc: number, l: any) => acc + (l.price_per_kg || 0), 0) / listingsRes.data!.length
      : 0;

    const totalOrdersCount = ordersRes.count || 0;
    const completedOrdersCount = (ordersRes.data || []).filter((o: any) => o.status === 'completed' || o.status === 'delivered').length;
    const grossOrderVolumeInr = (ordersRes.data || []).reduce((acc: number, o: any) => acc + (o.total_amount || 0), 0);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      filter: { district: district || 'All', state: state || 'All' },
      networkMetrics: {
        activeFarmers: activeFarmersCount,
        totalFarms: totalFarmsCount,
        totalCultivatedAcres: Math.round(totalFarmAcres * 10) / 10,
        activeListings: activeListingsCount,
        totalAvailableStockKg: totalAvailableProduceKg,
        avgAskingPricePerKg: Math.round(avgAskingPriceKg * 100) / 100,
        totalOrders: totalOrdersCount,
        completedOrders: completedOrdersCount,
        fulfillmentRatePct: totalOrdersCount > 0 ? Math.round((completedOrdersCount / totalOrdersCount) * 100) : 100,
        grossOrderVolumeInr: Math.round(grossOrderVolumeInr * 100) / 100,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}



