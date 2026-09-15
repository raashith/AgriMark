import { NextResponse } from 'next/server';
import { ScenarioSimulationEngine } from '@/lib/scenario-simulation-engine';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const baseline = parseFloat(searchParams.get('baseline_mt') || '50000');
  const seed = parseInt(searchParams.get('seed') || '42', 10);
  const severity = (searchParams.get('severity') || 'MODERATE') as 'MILD' | 'MODERATE' | 'SEVERE' | 'EXTREME';

  const mcResults = ScenarioSimulationEngine.runMonteCarloSimulation({
    baselineProductionMT: baseline,
    scenarioSeverity: severity,
    randomSeed: seed,
    runsCount: 100,
  });

  return NextResponse.json(mcResults);
}



