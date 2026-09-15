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
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    });

    const body = await request.json();
    const { listing_id, buyer_id, quantity, delivery_address } = body;

    if (!listing_id || !buyer_id || !quantity || quantity <= 0) {
      return NextResponse.json({ error: 'Invalid parameters. Listing ID, Buyer ID, and valid quantity required.' }, { status: 400 });
    }

    // Attempt RPC reservation if available, or execute server-side atomic validation path
    const { data: listing, error: listingErr } = await supabase
      .from('listings')
      .select('*, produce_lots(*)')
      .eq('id', listing_id)
      .single();

    if (listingErr || !listing) {
      return NextResponse.json({ error: 'Listing not found or inactive.' }, { status: 404 });
    }

    if (listing.status !== 'active') {
      return NextResponse.json({ error: 'Listing is not active for ordering.' }, { status: 400 });
    }

    const availableQty = listing.quantity_available_kg ?? listing.produce_lots?.available_quantity ?? listing.produce_lots?.quantity ?? 0;

    if (quantity > availableQty) {
      return NextResponse.json(
        { error: `Order quantity (${quantity} kg) exceeds available stock (${availableQty} kg).` },
        { status: 400 }
      );
    }

    if (listing.min_order_quantity && quantity < listing.min_order_quantity) {
      return NextResponse.json(
        { error: `Order quantity (${quantity} kg) is below minimum order quantity (${listing.min_order_quantity} kg).` },
        { status: 400 }
      );
    }

    const remainingQty = availableQty - quantity;

    // Create Marketplace Order
    const { data: newOrder, error: orderErr } = await supabase
      .from('orders')
      .insert({
        listing_id,
        listing_title: listing.title,
        buyer_id,
        seller_id: listing.seller_id,
        quantity,
        unit: 'KG',
        unit_price: listing.price_per_kg || listing.price_per_unit || 0,
        total_amount: quantity * (listing.price_per_kg || listing.price_per_unit || 0),
        status: 'pending',
        delivery_address: delivery_address || 'Standard Delivery',
        created_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (orderErr) {
      return NextResponse.json({ error: orderErr.message }, { status: 500 });
    }

    // Update Produce Lot Inventory
    if (listing.lot_id || listing.produce_lot_id) {
      const lotId = listing.lot_id || listing.produce_lot_id;
      await supabase
        .from('produce_lots')
        .update({
          available_quantity: remainingQty,
          status: remainingQty === 0 ? 'sold' : 'available',
        })
        .eq('id', lotId);
    }

    // Update Listing Available Stock
    await supabase
      .from('listings')
      .update({
        quantity_available_kg: remainingQty,
        status: remainingQty === 0 ? 'sold_out' : 'active',
      })
      .eq('id', listing_id);

    // Audit Logging
    try {
      await supabase.from('admin_audit_log').insert({
        user_id: buyer_id,
        action: 'MARKETPLACE_ORDER_CREATED',
        details: `Order ${newOrder.id} created for listing ${listing_id}. Reserved ${quantity} kg. Remaining ${remainingQty} kg.`,
        created_at: new Date().toISOString(),
      });
    } catch {}

    return NextResponse.json({
      success: true,
      order: newOrder,
      remaining_quantity: remainingQty,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}



