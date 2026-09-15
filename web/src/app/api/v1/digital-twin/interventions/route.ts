export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { InterventionCounterfactualEngine, InterventionType } from '@/lib/intervention-counterfactual-engine';

export async function POST(req: Request) {
  const body = await req.json();
  const runId = body.run_id || 'RUN-1001';
  const interventionType = (body.intervention_type || 'additional_irrigation') as InterventionType;
  const investment = body.investment_amount_inr || 5000000;

  const comparison = InterventionCounterfactualEngine.simulateIntervention({
    run_id: runId,
    intervention_type: interventionType,
    investment_amount_inr: investment,
  });

  return NextResponse.json({ success: true, comparison });
}

