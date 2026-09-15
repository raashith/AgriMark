import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    active_incidents: [],
    recent_resolved_incidents: [
      {
        id: 'INC-2026-001',
        title: 'Mandi API Rate Limit Exceeded',
        category: 'application',
        severity: 'LOW',
        owner: 'DevOps',
        status: 'RESOLVED',
        root_cause: 'Spike in concurrent price requests during morning auction window.',
        resolution: 'Increased redis cache TTL to 5 minutes.'
      }
    ]
  });
}



