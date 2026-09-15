/**
 * AgriMark Phase 13 - AI Supervisor Governance Engine
 * Validates AI agent tool invocations against strict permission classes (READ_ONLY, SAFE_MUTATION,
 * HUMAN_APPROVAL_REQUIRED, FORBIDDEN). Blocks unrestricted DB access and autonomous financial transfers.
 */

export type ToolClass = 
  | 'READ_ONLY' 
  | 'SAFE_MUTATION' 
  | 'HUMAN_APPROVAL_REQUIRED' 
  | 'FORBIDDEN';

export interface ToolPolicy {
  tool_name: string;
  tool_class: ToolClass;
  description: string;
}

export class AISupervisorGovernanceEngine {
  private static toolPolicies: Map<string, ToolPolicy> = new Map([
    ['get_mandi_prices', { tool_name: 'get_mandi_prices', tool_class: 'READ_ONLY', description: 'Look up market prices' }],
    ['get_weather_forecast', { tool_name: 'get_weather_forecast', tool_class: 'READ_ONLY', description: 'Look up weather observations' }],
    ['create_farmer_task', { tool_name: 'create_farmer_task', tool_class: 'SAFE_MUTATION', description: 'Create task item in farmer queue' }],
    ['submit_financial_payout', { tool_name: 'submit_financial_payout', tool_class: 'HUMAN_APPROVAL_REQUIRED', description: 'Request external money transfer' }],
    ['issue_organic_certificate', { tool_name: 'issue_organic_certificate', tool_class: 'HUMAN_APPROVAL_REQUIRED', description: 'Issue organic certification' }],
    ['raw_db_execute', { tool_name: 'raw_db_execute', tool_class: 'FORBIDDEN', description: 'Direct SQL execution' }],
    ['bypass_rls_policies', { tool_name: 'bypass_rls_policies', tool_class: 'FORBIDDEN', description: 'Bypass security policies' }],
    ['autonomous_money_transfer', { tool_name: 'autonomous_money_transfer', tool_class: 'FORBIDDEN', description: 'Autonomous money transfer' }]
  ]);

  /**
   * Evaluates an AI tool execution request
   */
  public static evaluateToolInvocation(toolName: string): { is_permitted: boolean; requires_human_approval: boolean; reason: string } {
    const policy = this.toolPolicies.get(toolName);
    if (!policy) {
      return {
        is_permitted: false,
        requires_human_approval: false,
        reason: `FORBIDDEN: Tool '${toolName}' is not in the allowlisted AI tool registry.`
      };
    }

    if (policy.tool_class === 'FORBIDDEN') {
      return {
        is_permitted: false,
        requires_human_approval: false,
        reason: `SECURITY VIOLATION: Tool '${toolName}' is classified as FORBIDDEN.`
      };
    }

    if (policy.tool_class === 'HUMAN_APPROVAL_REQUIRED') {
      return {
        is_permitted: true,
        requires_human_approval: true,
        reason: `APPROVAL REQUIRED: Tool '${toolName}' requires explicit human approval before execution.`
      };
    }

    return {
      is_permitted: true,
      requires_human_approval: false,
      reason: `PERMITTED: Tool '${toolName}' (${policy.tool_class}) executed.`
    };
  }
}
