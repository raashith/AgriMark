import { supabase as supabaseAdmin } from './supabase';

export interface IrrigationWorkflow {
  recommendation_id: string;
  field_id: string;
  controller_device_id: string;
  target_duration_sec: number;
  water_volume_liters: number;
  max_runtime_sec: number;
  status: 'RECOMMENDATION' | 'FARMER_APPROVAL' | 'SCHEDULED' | 'READY' | 'EXECUTION' | 'CONFIRMED' | 'FAILED';
  approval_id?: string;
  command_id?: string;
  execution_confirmed_at?: string;
}

export async function approveIrrigationRecommendation(
  recommendationId: string,
  farmerId: string,
  deviceId: string,
  params: { duration_sec: number; water_liters: number }
): Promise<IrrigationWorkflow> {
  // Hard safety limit server-side: Max 7200 sec (2 hours)
  const maxRuntime = 7200;
  const targetDuration = Math.min(params.duration_sec, maxRuntime);

  const approvalId = `appr_irr_${Math.random().toString(36).substring(2, 10)}`;
  const commandId = `cmd_irr_${Math.random().toString(36).substring(2, 10)}`;
  const nonce = `nonce_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 min command window

  if (supabaseAdmin) {
    // Record approval
    await supabaseAdmin.from('physical_approvals').insert({
      id: approvalId,
      recommendation_id: recommendationId,
      approved_by: farmerId,
      status: 'APPROVED',
      approved_at: new Date().toISOString(),
      remarks: `Farmer approved irrigation for ${targetDuration} seconds.`
    });

    // Record signed command
    await supabaseAdmin.from('physical_commands').insert({
      id: commandId,
      device_id: deviceId,
      field_id: 'field_salem_02',
      command_type: 'START_IRRIGATION',
      target_duration_sec: targetDuration,
      water_volume_liters: params.water_liters,
      max_runtime_sec: maxRuntime,
      nonce,
      issued_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      status: 'SENT'
    });
  }

  return {
    recommendation_id: recommendationId,
    field_id: 'field_salem_02',
    controller_device_id: deviceId,
    target_duration_sec: targetDuration,
    water_volume_liters: params.water_liters,
    max_runtime_sec: maxRuntime,
    status: 'READY',
    approval_id: approvalId,
    command_id: commandId
  };
}
