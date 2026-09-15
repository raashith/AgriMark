import { NextResponse } from 'next/server';
import { DataGovernanceEngine } from '@/lib/data-governance';

export async function GET() {
  return NextResponse.json({
    governance_status: 'ACTIVE',
    retention_policy: '365_DAYS_AUDIT_TRAIL',
    data_classifications: ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'],
    rls_enabled: true,
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const log = await DataGovernanceEngine.logAccess(
    body.user_id || 'anonymous',
    body.classification || 'INTERNAL',
    body.resource || 'general',
    body.action || 'READ'
  );
  return NextResponse.json({ success: true, log });
}
