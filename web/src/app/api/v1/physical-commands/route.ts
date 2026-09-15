import { NextResponse } from 'next/server';
import { createSignedPhysicalCommand, verifyCommandExecution } from '@/lib/command-gateway-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, device_id, field_id, command_type, duration_sec, command_id, telemetry_confirmation_id } = body;

    if (action === 'verify_execution') {
      const ok = await verifyCommandExecution(command_id, telemetry_confirmation_id);
      return NextResponse.json({ success: ok, command_id });
    }

    const cmd = await createSignedPhysicalCommand(
      device_id || 'dev_irr_ctrl_01',
      field_id || 'field_salem_02',
      command_type || 'START_IRRIGATION',
      duration_sec || 3600
    );

    return NextResponse.json({ success: true, data: cmd });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}
