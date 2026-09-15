export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  return NextResponse.json({
    district_code: 'TN-SLM',
    infrastructure: [
      { facility_id: 'WH-SLM-01', facility_type: 'warehouse', total_capacity: 10000, utilization_pct: 65.4, status: 'ACTIVE' },
      { facility_id: 'CS-SLM-01', facility_type: 'cold_storage', total_capacity: 2500, utilization_pct: 82.1, status: 'ACTIVE' },
      { facility_id: 'PR-SLM-01', facility_type: 'processing', total_capacity: 5000, utilization_pct: 45.0, status: 'ACTIVE' }
    ]
  });
}

