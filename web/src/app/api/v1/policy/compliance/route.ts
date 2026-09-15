export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import {
  getComplianceRequirements,
  getFarmerComplianceChecklist,
  getFPOGovernanceRecord
} from '@/lib/compliance-intelligence-engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const farmerId = searchParams.get('farmer_id') || 'FARMER_DEMO_1';
  const fpoId = searchParams.get('fpo_id') || 'FPO_SALEM_01';

  const requirements = await getComplianceRequirements();
  const checklist = await getFarmerComplianceChecklist(farmerId);
  const fpoGov = await getFPOGovernanceRecord(fpoId);

  return NextResponse.json({
    success: true,
    data: {
      requirements,
      checklist,
      fpo_governance: fpoGov
    },
    meta: {
      disclaimer: 'Compliance checklist items serve decision-support purposes and do not constitute formal legal advice or government certification.'
    }
  });
}

