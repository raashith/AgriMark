export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { ScenarioSimulationEngine } from '@/lib/scenario-simulation-engine';

export async function GET() {
  return NextResponse.json({
    scenarios: [
      { id: 'SCN-DROUGHT-01', title: 'Severe Summer Drought', scenario_type: 'drought', severity: 'SEVERE', duration_days: 90 },
      { id: 'SCN-FLOOD-01', title: 'Monsoon Flash Flood', scenario_type: 'flood', severity: 'MODERATE', duration_days: 14 },
      { id: 'SCN-PEST-01', title: 'BPH Pest Outbreak', scenario_type: 'pest_outbreak', severity: 'HIGH', duration_days: 30 }
    ]
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const scenario = await ScenarioSimulationEngine.createScenario(body);
  return NextResponse.json({ success: true, scenario });
}

