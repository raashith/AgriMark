export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { QualityDisputeEngine } from '@/lib/quality-dispute-engine';

export async function GET(request: Request) {
  const requestId = `req-${Date.now()}`;
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('order_id') || 'ord_4410';

  const dispute = QualityDisputeEngine.openDispute(
    orderId,
    'usr_buyer_992',
    'usr_f_tn_98231',
    'QUANTITY_MISMATCH',
    12500,
    'Received 4.8 MT instead of 5.0 MT stated in consignment note.'
  );

  const events = QualityDisputeEngine.getDisputeEvents(dispute.id);

  return NextResponse.json({
    success: true,
    request_id: requestId,
    timestamp: new Date().toISOString(),
    data: {
      dispute,
      audit_events: events
    }
  }, {
    headers: { 'X-Request-ID': requestId }
  });
}

