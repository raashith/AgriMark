export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { evaluatePhysicalSafety } from '@/lib/physical-safety-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { device_id, command_type, duration_sec, operator_role } = body;

    const evaluation = await evaluatePhysicalSafety(
      device_id || 'dev_irr_ctrl_01',
      command_type || 'START_IRRIGATION',
      duration_sec || 3600,
      operator_role || 'CERTIFIED_OPERATOR'
    );

    return NextResponse.json({ success: true, data: evaluation });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}

