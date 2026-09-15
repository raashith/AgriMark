export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { AISupervisorEngine } from '@/lib/ai-supervisor';

export async function POST(req: Request) {
  const body = await req.json();
  const actionName = body.action || 'general_query';
  const financialVal = body.financial_value_inr;
  const isPhysical = body.is_physical_command || false;

  const safetyEvaluation = AISupervisorEngine.evaluateActionSafety({
    actionType: actionName,
    financialValueInr: financialVal,
    isPhysicalCommand: isPhysical,
  });

  return NextResponse.json({
    status: 'ACTIVE',
    safety_evaluation: safetyEvaluation,
    message: safetyEvaluation.human_approval_required
      ? 'ACTION BLOCKED: Requires human approval prior to execution.'
      : 'ACTION APPROVED: Safe to proceed.',
  });
}

