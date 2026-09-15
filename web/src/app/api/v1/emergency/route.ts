import { NextResponse } from 'next/server';
import { triggerEmergencyStop } from '@/lib/emergency-stop-system';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { triggered_by, target_device_ids, reason } = body;

    const estop = await triggerEmergencyStop(
      triggered_by || 'usr_f_sample',
      target_device_ids || ['dev_irr_ctrl_01'],
      reason || 'Emergency physical stop triggered by operator'
    );

    return NextResponse.json({ success: true, data: estop });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}
