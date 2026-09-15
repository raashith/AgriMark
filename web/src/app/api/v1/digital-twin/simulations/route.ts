import { NextResponse } from 'next/server';
import { SimulationGovernanceAsync } from '@/lib/simulation-governance-async';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return NextResponse.json({
    active_runs: [
      { id: 'RUN-1001', scenario_id: 'SCN-DROUGHT-01', status: 'COMPLETED', risk_level: 'MEDIUM', geographic_scope: 'Salem District' },
      { id: 'RUN-1002', scenario_id: 'SCN-FLOOD-01', status: 'RUNNING', risk_level: 'HIGH', geographic_scope: 'Kaveri Delta' }
    ]
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const run = await SimulationGovernanceAsync.submitAsyncSimulationJob(body);
  return NextResponse.json({ success: true, run });
}
