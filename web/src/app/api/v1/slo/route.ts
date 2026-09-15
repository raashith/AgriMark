export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { IncidentSLOEngine } from '@/lib/incident-slo-engine';

export async function GET() {
  const requestId = `req-${Date.now()}`;
  const metrics = IncidentSLOEngine.getSLOMetrics();

  return NextResponse.json({
    success: true,
    request_id: requestId,
    timestamp: new Date().toISOString(),
    data: metrics
  }, {
    headers: { 'X-Request-ID': requestId }
  });
}

