import { NextResponse } from 'next/server';
import { IncidentSLOEngine } from '@/lib/incident-slo-engine';

export async function GET() {
  const requestId = `req-${Date.now()}`;

  const incident = IncidentSLOEngine.raiseIncident(
    'Marketplace API latency threshold exceeded',
    'P2',
    'MARKETPLACE_SERVICE',
    'deploy_release_v12.4.0'
  );

  return NextResponse.json({
    success: true,
    request_id: requestId,
    timestamp: new Date().toISOString(),
    data: [incident]
  }, {
    headers: { 'X-Request-ID': requestId }
  });
}
