import { NextResponse } from 'next/server';
import { PaymentProviderEngine } from '@/lib/payment-provider-engine';

export async function POST(request: Request) {
  const requestId = `req-${Date.now()}`;
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const engine = new PaymentProviderEngine();
  const idempotencyKey = request.headers.get('Idempotency-Key') || `idemp_${Date.now()}`;

  const intent = await engine.createPaymentIntent({
    order_id: body.order_id || 'ord_4410',
    payer_id: body.payer_id || 'usr_buyer_992',
    payee_id: body.payee_id || 'usr_f_tn_98231',
    amount_inr: body.amount_inr || 117500,
    idempotency_key: idempotencyKey
  });

  return NextResponse.json({
    success: true,
    request_id: requestId,
    timestamp: new Date().toISOString(),
    data: intent
  }, {
    headers: { 'X-Request-ID': requestId }
  });
}
