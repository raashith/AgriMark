export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createKnowledgeClaim, translateResearchForFarmer } from '@/lib/evidence-engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const claimText = searchParams.get('claim') || 'Pulse drip irrigation reduces root zone water stress by 34%';

  const evidence = await createKnowledgeClaim(claimText);
  const farmerTranslation = translateResearchForFarmer('Pulse Drip Efficacy Study 2025', claimText);

  return NextResponse.json({
    success: true,
    data: {
      evidence,
      farmer_explanation: farmerTranslation
    },
    meta: {
      ai_validation_rule: 'AI_GENERATED evidence cannot independently validate a scientific claim.'
    }
  });
}

