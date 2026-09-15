export type PhysicalAutonomyLevel =
  | 'L0_INFORMATIONAL'
  | 'L1_RECOMMENDATION'
  | 'L2_HUMAN_ASSISTED'
  | 'L3_CONDITIONAL_LIMITS'
  | 'L4_RESTRICTED_RESEARCH'
  | 'L5_RESEARCH_ONLY';

export interface PhysicalAutonomyPolicy {
  subsystem: string;
  autonomy_level: PhysicalAutonomyLevel;
  max_allowed_autonomy_level: PhysicalAutonomyLevel;
  requires_operator_approval: boolean;
  is_automated_promotion_allowed: false;
}

export async function checkPhysicalAutonomyPolicy(
  subsystem: string,
  requestedLevel: PhysicalAutonomyLevel
): Promise<{ allowed: boolean; reason?: string }> {
  // L4 and L5 physical autonomy are research-only and strictly forbidden from production field execution
  if (requestedLevel === 'L4_RESTRICTED_RESEARCH' || requestedLevel === 'L5_RESEARCH_ONLY') {
    return {
      allowed: false,
      reason: `Physical Autonomy Level '${requestedLevel}' is restricted to research environments and cannot execute physical actions in production.`
    };
  }

  return { allowed: true };
}
