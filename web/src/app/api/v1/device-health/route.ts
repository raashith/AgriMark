import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
  const health = {
    total_devices: 1250,
    online: 1180,
    offline: 45,
    quarantined: 15,
    degraded: 10,
    active_gateways: 100,
    emergency_events_24h: 0,
    uptime_pct: 99.8
  };

  return NextResponse.json({ success: true, data: health });
}



