export const dynamic = 'force-dynamic';
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
    const { order_id, event_type, location_notes, latitude, longitude } = body;

    if (!order_id || !event_type) {
      return NextResponse.json({ error: 'Order ID and event_type required.' }, { status: 400 });
    }

    // Insert immutable shipment event
    const { data: shipmentEvent, error: eventErr } = await supabase
      .from('logistics_shipment_events')
      .insert({
        order_id,
        event_type,
        location_notes: location_notes || `Shipment milestone: ${event_type}`,
        latitude: latitude || null,
        longitude: longitude || null,
        event_timestamp: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (eventErr) {
      return NextResponse.json({ error: eventErr.message }, { status: 500 });
    }

    // Update Marketplace Order status if milestone corresponds to order state machine
    const statusMap: Record<string, string> = {
      pickup_assigned: 'processing',
      picked_up: 'ready_for_pickup',
      in_transit: 'in_transit',
      delivered: 'delivered',
    };

    if (statusMap[event_type]) {
      await supabase.from('orders').update({ status: statusMap[event_type] }).eq('id', order_id);
    }

    return NextResponse.json({ success: true, shipmentEvent });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

