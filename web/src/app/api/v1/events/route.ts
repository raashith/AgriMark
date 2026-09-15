import { NextResponse } from 'next/server';
import { DomainEventBus } from '@/lib/domain-event-bus';
export const dynamic = 'force-dynamic';

export async function GET() {
  const requestId = `req-${Date.now()}`;

  const event = DomainEventBus.publishEvent(
    'harvest.recorded',
    'HARVEST',
    'hrv_8812',
    'usr_f_tn_98231',
    { harvested_quantity_mt: 14.5, crop_code: 'RICE_PADDY' }
  );

  return NextResponse.json({
    success: true,
    request_id: requestId,
    timestamp: new Date().toISOString(),
    data: event
  }, {
    headers: { 'X-Request-ID': requestId }
  });
}



