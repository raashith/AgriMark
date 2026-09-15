export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { NationalAlertSystem } from '@/lib/national-alert-system';

export async function GET(request: Request) {
  const requestId = `req-${Date.now()}`;
  const { searchParams } = new URL(request.url);
  const recipientId = searchParams.get('recipient_id') || 'usr_f_tn_98231';

  const alert = NationalAlertSystem.dispatchAlert(
    recipientId,
    'WEATHER',
    'HIGH',
    'Rainfall Risk Warning',
    'IMD forecast indicates heavy rainfall (>50mm) within 24 hours in Thanjavur district.',
    'NATIONAL_WEATHER_ADAPTER',
    'Secure harvested paddy stored in open fields and move to dry covered warehouse.',
    0.95
  );

  return NextResponse.json({
    success: true,
    request_id: requestId,
    timestamp: new Date().toISOString(),
    data: [alert]
  }, {
    headers: { 'X-Request-ID': requestId }
  });
}

