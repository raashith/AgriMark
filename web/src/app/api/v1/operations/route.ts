export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { ObservabilityEngine } from '@/lib/observability-engine';

export async function GET() {
  const report = await ObservabilityEngine.generateHealthReport();
  return NextResponse.json({
    system: 'AgriMark National Control Plane & System Observability',
    status: 'ACTIVE',
    report,
  });
}

