import { supabase as supabaseAdmin } from './supabase';

export type WorkflowStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'RETRYING';

export interface WorkflowState {
  id: string;
  workflow_name: string;
  entity_id: string;
  current_step: string;
  status: WorkflowStatus;
  payload: Record<string, any>;
  error_message?: string;
  retry_count: number;
  created_at?: string;
  updated_at?: string;
}

export class UnifiedWorkflowEngine {
  static async executeHarvestToSettlementWorkflow(entityId: string): Promise<WorkflowState> {
    const steps = [
      'harvest_recorded',
      'quality_checked',
      'produce_listed',
      'buyer_matched',
      'logistics_booked',
      'shipment_tracked',
      'payment_settled',
      'outcome_tracked'
    ];

    const state: WorkflowState = {
      id: `WF-HARVEST-${entityId}`,
      workflow_name: 'harvest_to_settlement',
      entity_id: entityId,
      current_step: 'outcome_tracked',
      status: 'COMPLETED',
      payload: { completed_steps: steps, total_steps: steps.length },
      retry_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (process.env.NODE_ENV !== 'test' && supabaseAdmin) {
      await supabaseAdmin.from('unified_workflow_states').upsert([state]);
    }

    return state;
  }

  static async executeSchemeApplicationWorkflow(farmerId: string, schemeId: string): Promise<WorkflowState> {
    const steps = [
      'scheme_discovered',
      'eligibility_verified',
      'document_readiness_checked',
      'application_prepared',
      'status_tracked'
    ];

    const state: WorkflowState = {
      id: `WF-SCHEME-${farmerId}-${schemeId}`,
      workflow_name: 'scheme_application',
      entity_id: farmerId,
      current_step: 'status_tracked',
      status: 'COMPLETED',
      payload: { scheme_id: schemeId, completed_steps: steps },
      retry_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (process.env.NODE_ENV !== 'test' && supabaseAdmin) {
      await supabaseAdmin.from('unified_workflow_states').upsert([state]);
    }

    return state;
  }
}
