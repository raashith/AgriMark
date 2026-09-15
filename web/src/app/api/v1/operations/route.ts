import { NextResponse } from 'next/server';

export async function GET() {
  const requestId = `req-${Date.now()}`;

  return NextResponse.json({
    success: true,
    request_id: requestId,
    timestamp: new Date().toISOString(),
    data: {
      active_workflows_count: 142,
      stuck_workflows_count: 0,
      failed_workflows_count: 1,
      event_throughput_per_sec: 24.5,
      pending_approvals_count: 3,
      open_high_priority_alerts: 2,
      active_farmers: 1250,
      active_farms: 1420
    }
  }, {
    headers: { 'X-Request-ID': requestId }
  });
}
