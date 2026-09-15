import { supabase as supabaseAdmin } from './supabase';

export interface EmergencyStopRecord {
  id: string;
  triggered_by: string;
  target_device_ids: string[];
  shutdown_type: 'HARD_STOP' | 'CONTROLLED_SHUTDOWN';
  reason: string;
  status: 'EXECUTED';
  triggered_at: string;
}

export async function triggerEmergencyStop(
  triggeredBy: string,
  targetDeviceIds: string[],
  reason: string
): Promise<EmergencyStopRecord> {
  const record: EmergencyStopRecord = {
    id: `estop_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    triggered_by: triggeredBy,
    target_device_ids: targetDeviceIds,
    shutdown_type: 'HARD_STOP',
    reason,
    status: 'EXECUTED',
    triggered_at: new Date().toISOString()
  };

  if (supabaseAdmin) {
    // 1. Audit record
    await supabaseAdmin.from('emergency_events').insert(record);

    // 2. Mark active commands as EMERGENCY_STOPPED
    if (targetDeviceIds.length > 0) {
      await supabaseAdmin
        .from('physical_commands')
        .update({ status: 'EMERGENCY_STOPPED' })
        .in('device_id', targetDeviceIds)
        .eq('status', 'SENT');

      // 3. Mark devices as DEGRADED / OFFLINE
      await supabaseAdmin
        .from('devices')
        .update({ connectivity_status: 'DEGRADED' })
        .in('id', targetDeviceIds);
    }
  }

  return record;
}
