export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { InterventionCounterfactualEngine } from '@/lib/intervention-counterfactual-engine';

export async function POST(req: Request) {
  const body = await req.json();
  const runId = body.run_id || 'RUN-1001';
  const variable = body.hypothetical_variable || 'rainfall_mm';
  const baseline = body.observed_baseline || { yield_mt: 1000, rainfall_mm: 450 };
  const val = body.hypothetical_value || 850;

  const counterfactual = InterventionCounterfactualEngine.runCounterfactual({
    run_id: runId,
    hypothetical_variable: variable,
    observed_baseline: baseline,
    hypothetical_value: val,
  });

  return NextResponse.json({ success: true, counterfactual });
}

