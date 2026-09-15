import { supabase as supabaseAdmin } from './supabase';

export type AutonomyLevel =
  | 'L0_INFORMATIONAL'
  | 'L1_RECOMMENDATION'
  | 'L2_ASSISTED_ACTION'
  | 'L3_CONDITIONAL_LIMITS'
  | 'L4_RESTRICTED_AUTONOMOUS'
  | 'L5_RESEARCH_ONLY';

export interface AutonomyPolicy {
  id: string;
  subsystem: string;
  level: AutonomyLevel;
  allowed_tools: string[];
  forbidden_tools: string[];
  risk_limits: Record<string, number>;
  requires_approval: boolean;
  updated_at?: string;
}

export const DEFAULT_AUTONOMY_POLICIES: Record<string, AutonomyPolicy> = {
  matching: {
    id: 'pol_matching',
    subsystem: 'matching',
    level: 'L1_RECOMMENDATION',
    allowed_tools: ['rank_buyers', 'calculate_scores'],
    forbidden_tools: ['auto_confirm_order'],
    risk_limits: { max_recommendations_per_day: 50 },
    requires_approval: true
  },
  logistics: {
    id: 'pol_logistics',
    subsystem: 'logistics',
    level: 'L2_ASSISTED_ACTION',
    allowed_tools: ['recommend_routes', 'batch_pickups'],
    forbidden_tools: ['dispatch_autonomous_vehicle', 'override_driver_route'],
    risk_limits: { max_distance_km: 500 },
    requires_approval: true
  },
  finance: {
    id: 'pol_finance',
    subsystem: 'finance',
    level: 'L1_RECOMMENDATION',
    allowed_tools: ['score_credit', 'assess_risk'],
    forbidden_tools: ['execute_payout', 'approve_loan'],
    risk_limits: { max_auto_credit_inr: 0 },
    requires_approval: true
  }
};

export async function checkAutonomyExecution(
  subsystem: string,
  proposedLevel: AutonomyLevel,
  toolName: string
): Promise<{ allowed: boolean; reason?: string; policy: AutonomyPolicy }> {
  const policy = DEFAULT_AUTONOMY_POLICIES[subsystem] || {
    id: `pol_${subsystem}`,
    subsystem,
    level: 'L1_RECOMMENDATION',
    allowed_tools: [],
    forbidden_tools: ['all_mutations'],
    risk_limits: {},
    requires_approval: true
  };

  // Block Level 4 & Level 5 real-world autonomous executions
  if (proposedLevel === 'L4_RESTRICTED_AUTONOMOUS' || proposedLevel === 'L5_RESEARCH_ONLY') {
    return {
      allowed: false,
      reason: `Autonomy Level ${proposedLevel} is strictly restricted from real-world execution. Safe limit is L0-L2.`,
      policy
    };
  }

  // Check forbidden tools
  if (policy.forbidden_tools.includes(toolName)) {
    return {
      allowed: false,
      reason: `Tool '${toolName}' is explicitly forbidden under subsystem '${subsystem}' policy.`,
      policy
    };
  }

  return {
    allowed: true,
    policy
  };
}
