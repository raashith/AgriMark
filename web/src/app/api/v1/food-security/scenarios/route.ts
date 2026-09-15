import { NextResponse } from 'next/server';
import { runScenarioSimulation, SimulationScenarioType } from '@/lib/scenario-simulation-engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scenarioType = (searchParams.get('scenario') || 'PROD_DECLINE_25') as SimulationScenarioType;
  const commodity = searchParams.get('commodity') || 'Turmeric';
  const region = searchParams.get('region') || 'Tamil Nadu';

  const simulation = await runScenarioSimulation(scenarioType, commodity, region);
  return NextResponse.json({
    success: true,
    data: simulation,
    meta: {
      data_origin: 'SIMULATION',
      notice: 'Non-production simulation tool. Results are synthetic models, not empirical facts or forecasts.'
    }
  });
}
