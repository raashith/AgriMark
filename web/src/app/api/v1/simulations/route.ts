import { NextResponse } from 'next/server';
import { ScenarioSimulationEngine } from '@/lib/scenario-simulation-engine';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const baseline = parseFloat(searchParams.get('baseline_mt') || '50000');
  const seed = parseInt(searchParams.get('seed') || '42', 10);
  const severity = (searchParams.get('severity') || 'MODERATE') as 'MILD' | 'MODERATE' | 'SEVERE' | 'EXTREME';

  const simulation = ScenarioSimulationEngine.runMonteCarloSimulation({
    baselineProductionMT: baseline,
    scenarioSeverity: severity,
    randomSeed: seed,
    runsCount: 100,
  });

  return NextResponse.json({
    namespace: '/api/v1/simulations',
    status: 'ACTIVE',
    simulation,
    disclaimer: 'COMPUTATIONAL MODEL ONLY: Simulation output for food security & digital twin analysis.',
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const scenario = await ScenarioSimulationEngine.createScenario(body);
  return NextResponse.json({ success: true, scenario });
}



