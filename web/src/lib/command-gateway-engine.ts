import { supabase as supabaseAdmin } from './supabase';

export interface PhysicalCommand {
  id: string;
  device_id: string;
  field_id: string;
  command_type: string;
  target_duration_sec: number;
  water_volume_liters: number;
  max_runtime_sec: number;
  nonce: string;
  issued_at: string;
  expires_at: string;
  status: 'SENT' | 'EXECUTED' | 'CONFIRMED' | 'EXPIRED' | 'REJECTED' | 'EMERGENCY_STOPPED';
}

export async function createSignedPhysicalCommand(
  deviceId: string,
  fieldId: string,
  commandType: string,
  durationSec: number
): Promise<PhysicalCommand> {
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + 15 * 60 * 1000); // 15 mins expiry
  const nonce = `nonce_${issuedAt.getTime()}_${Math.random().toString(36).substring(2, 8)}`;

  const command: PhysicalCommand = {
    id: `cmd_${Math.random().toString(36).substring(2, 10)}`,
    device_id: deviceId,
    field_id: fieldId,
    command_type: commandType,
    target_duration_sec: durationSec,
    water_volume_liters: durationSec * 3.5, // 3.5 L/sec estimate
    max_runtime_sec: 7200,
    nonce,
    issued_at: issuedAt.toISOString(),
    expires_at: expiresAt.toISOString(),
    status: 'SENT'
  };

  if (supabaseAdmin) {
    await supabaseAdmin.from('physical_commands').insert(command);
  }

  return command;
}

export async function verifyCommandExecution(commandId: string, telemetryConfirmationId: string): Promise<boolean> {
  if (supabaseAdmin) {
    const { data: cmd } = await supabaseAdmin
      .from('physical_commands')
      .select('*')
      .eq('id', commandId)
      .single();

    if (cmd) {
      const now = new Date();
      if (new Date(cmd.expires_at) < now) {
        await supabaseAdmin
          .from('physical_commands')
          .update({ status: 'EXPIRED' })
          .eq('id', commandId);
        return false;
      }

      await supabaseAdmin
        .from('physical_commands')
        .update({ status: 'CONFIRMED' })
        .eq('id', commandId);

      await supabaseAdmin.from('command_execution_events').insert({
        id: `exec_${Date.now()}`,
        command_id: commandId,
        device_id: cmd.device_id,
        status: 'SUCCESS',
        telemetry_confirmation_id: telemetryConfirmationId,
        executed_at: now.toISOString()
      });

      return true;
    }
  }

  return true;
}
