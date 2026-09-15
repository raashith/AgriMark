export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { OutcomeEconomicsEngine } from '@/lib/outcome-economics-engine';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const farmerId = searchParams.get('farmer_id') || 'FMR-TN-001';

  const outcome = OutcomeEconomicsEngine.calculateFarmerOutcome(farmerId);
  return NextResponse.json(outcome);
}

