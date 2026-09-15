import { supabase as supabaseAdmin } from './supabase';

export type SafetyEvaluationResult = 'ALLOWED' | 'BLOCKED' | 'REQUIRES_APPROVAL' | 'UNSAFE';

export interface PhysicalSafetyEvaluation {
  command_id?: string;
  device_id: string;
  evaluation_result: SafetyEvaluationResult;
  block_reason?: string;
  evaluated_at: string;
}

export async function evaluatePhysicalSafety(
  deviceId: string,
  commandType: string,
  durationSec: number,
  operatorRole: string = 'CERTIFIED_OPERATOR'
): Promise<PhysicalSafetyEvaluation> {
  const maxDuration = 7200; // 2 hours max
  let result: SafetyEvaluationResult = 'ALLOWED';
  let reason: string | undefined = undefined;

  // 1. Duration Policy
  if (durationSec > maxDuration) {
    result = 'BLOCKED';
    reason = `Command duration (${durationSec}s) exceeds maximum safe limit (${maxDuration}s).`;
  }

  // 2. Operator Authorization
  if (operatorRole !== 'CERTIFIED_OPERATOR' && operatorRole !== 'FARM_OWNER') {
    result = 'REQUIRES_APPROVAL';
    reason = 'Operator lacks physical equipment certification.';
  }

  // 3. Dangerous command types
  if (commandType === 'OVERRIDE_SAFETY_CUTOFF' || commandType === 'UNLIMITED_RUNTIME') {
    result = 'UNSAFE';
    reason = 'Dangerous physical control override requested.';
  }

  const evalRecord: PhysicalSafetyEvaluation = {
    device_id: deviceId,
    evaluation_result: result,
    block_reason: reason,
    evaluated_at: new Date().toISOString()
  };

  if (supabaseAdmin) {
    await supabaseAdmin.from('safety_events').insert({
      id: `safe_evt_${Date.now()}`,
      ...evalRecord
    });
  }

  return evalRecord;
}
