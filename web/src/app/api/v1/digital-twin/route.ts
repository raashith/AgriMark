import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    system: 'AgriMark National Agricultural Digital Twin & Simulation OS',
    version: '1.0.0',
    status: 'ACTIVE',
    capabilities: [
      'current-state representation',
      'historical reconstruction',
      'scenario simulation',
      'what-if analysis',
      'risk forecasting',
      'intervention comparison',
      'resilience planning'
    ],
    operational_isolation: 'STRICT_ISOLATION (SIMULATION writes never alter LIVE_OPERATIONAL tables)'
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const query = body.query || '';

  return NextResponse.json({
    answer: `Digital Twin Assistant: Computed scenario query for "${query}".`,
    simulated: true,
    disclaimer: 'COMPUTATIONAL SIMULATION ONLY: Digital twin projections represent bounded model outputs and are not guaranteed predictions.',
    provenance: {
      model_id: 'AGRI-TWIN-v1.4',
      data_version: '2026-Q3-NAT',
      timestamp: new Date().toISOString()
    }
  });
}
