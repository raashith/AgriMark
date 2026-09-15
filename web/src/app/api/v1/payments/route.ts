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
    const { order_id, gross_amount, buyer_id, seller_id, idempotency_key } = body;

    if (!order_id || !gross_amount || !idempotency_key) {
      return NextResponse.json({ error: 'Order ID, gross_amount, and idempotency_key required.' }, { status: 400 });
    }

    // Check existing payment intent for idempotency
    const { data: existing } = await supabase
      .from('payment_intents')
      .select('*')
      .eq('idempotency_key', idempotency_key)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: true, isDuplicateRequest: true, paymentIntent: existing });
    }

    // Server-side fee & tax calculations (Never trust client-calculated totals)
    const platformFeePct = 0.02; // 2%
    const logisticsFeePct = 0.03; // 3%
    const taxPct = 0.01;          // 1%

    const platformFee = Math.round(gross_amount * platformFeePct * 100) / 100;
    const logisticsFee = Math.round(gross_amount * logisticsFeePct * 100) / 100;
    const taxAmount = Math.round(gross_amount * taxPct * 100) / 100;
    const sellerPayable = Math.round((gross_amount - platformFee - logisticsFee) * 100) / 100;

    const { data: paymentIntent, error } = await supabase
      .from('payment_intents')
      .insert({
        order_id,
        buyer_id,
        seller_id,
        gross_amount,
        platform_fee: platformFee,
        logistics_fee: logisticsFee,
        tax_amount: taxAmount,
        seller_payable: sellerPayable,
        status: 'escrowed',
        idempotency_key,
        created_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, paymentIntent });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
