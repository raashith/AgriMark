export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled', 'disputed'],
  processing: ['ready_for_pickup', 'cancelled', 'disputed'],
  ready_for_pickup: ['in_transit', 'cancelled', 'disputed'],
  in_transit: ['delivered', 'disputed'],
  delivered: ['completed', 'disputed'],
  completed: [],
  cancelled: [],
  disputed: ['resolved', 'cancelled'],
};

export async function PATCH(request: Request) {
  try {
    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xrcqzpnstdbbtafhcwbb.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'ey...';

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    });

    const body = await request.json();
    const { order_id, next_status, user_id } = body;

    if (!order_id || !next_status) {
      return NextResponse.json({ error: 'Order ID and next status required.' }, { status: 400 });
    }

    const { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('*, listings(*)')
      .eq('id', order_id)
      .single();

    if (fetchErr || !order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    const currentStatus = order.status || 'pending';
    const allowedNext = VALID_TRANSITIONS[currentStatus] || [];

    if (!allowedNext.includes(next_status)) {
      return NextResponse.json(
        { error: `Invalid order state transition from '${currentStatus}' to '${next_status}'. Allowed: [${allowedNext.join(', ')}].` },
        { status: 400 }
      );
    }

    // Update Order Status
    const { data: updatedOrder, error: updateErr } = await supabase
      .from('orders')
      .update({ status: next_status })
      .eq('id', order_id)
      .select('*')
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // If order is cancelled, restore reserved stock to listing and produce lot
    if (next_status === 'cancelled' && order.listing_id && order.quantity) {
      const listing = order.listings;
      if (listing) {
        const restoredQty = (listing.quantity_available_kg || 0) + order.quantity;
        await supabase
          .from('listings')
          .update({
            quantity_available_kg: restoredQty,
            status: 'active',
          })
          .eq('id', order.listing_id);

        if (listing.lot_id || listing.produce_lot_id) {
          const lotId = listing.lot_id || listing.produce_lot_id;
          await supabase
            .from('produce_lots')
            .update({
              available_quantity: restoredQty,
              status: 'available',
            })
            .eq('id', lotId);
        }
      }
    }

    // Audit Event
    try {
      await supabase.from('admin_audit_log').insert({
        user_id: user_id || order.buyer_id,
        action: 'MARKETPLACE_ORDER_STATUS_CHANGED',
        details: `Order ${order_id} state changed from ${currentStatus} to ${next_status}.`,
        created_at: new Date().toISOString(),
      });
    } catch {}

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

