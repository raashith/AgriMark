export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const runId = searchParams.get('run_id') || 'RUN-1001';

  return NextResponse.json({
    run_id: runId,
    baseline_metrics: { production_mt: 50000, water_deficit_mcm: 0, avg_farmer_income_inr: 45000 },
    simulated_metrics: { production_mt: 32500, water_deficit_mcm: 180, avg_farmer_income_inr: 31000 },
    variance_metrics: { production_loss_pct: -35.0, income_loss_pct: -31.1 },
    confidence_score: 0.92,
    uncertainty_bound: { p10: 29000, p50: 32500, p90: 36000 },
    disclaimer: 'COMPUTATIONAL MODEL RESULT ONLY: Does not represent a guaranteed physical outcome.'
  });
}

