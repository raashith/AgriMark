/**
 * AgriMark Phase 13 - Long-Running Workflow Orchestration Engine & Offline Sync
 * Orchestrates multi-step agricultural workflows (e.g. HARVEST_TO_SALE), tracking current/next steps,
 * failure retries, human approval gates, optimistic concurrency control, and mobile offline sync states.
 */

export type WorkflowStatus = 
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'WAITING_HUMAN_APPROVAL'
  | 'COMPLETED'
  | 'FAILED'
  | 'RETRYING';

export type OfflineSyncState = 
  | 'DRAFT'
  | 'QUEUED'
  | 'SYNCING'
  | 'SYNCED'
  | 'FAILED'
  | 'CONFLICT';

export interface WorkflowInstance {
  workflow_id: string;
  workflow_name: string;
  entity_id: string;
  current_step: string;
  previous_step?: string;
  next_step?: string;
  status: WorkflowStatus;
  state_version: number;
  failure_reason?: string;
  retry_count: number;
  max_retries: number;
  requires_human_approval: boolean;
  created_at: string;
  updated_at: string;
}

export interface MobileOfflinePayload {
  client_id: string;
  sync_state: OfflineSyncState;
  payload: Record<string, any>;
  client_timestamp: string;
  server_timestamp?: string;
}

export class WorkflowOrchestrator {
  private static HARVEST_TO_SALE_STEPS = [
    'HARVEST_RECORDED',
    'LOT_CREATED',
    'QUALITY_INSPECTED',
    'LISTING_CREATED',
    'BUYER_MATCHED',
    'ORDER_CREATED',
    'INVENTORY_RESERVED',
    'LOGISTICS_DISPATCHED',
    'DELIVERY_CONFIRMED',
    'SETTLEMENT_COMPLETED',
    'OUTCOME_MEASURED'
  ];

  private static workflows: Map<string, WorkflowInstance> = new Map();

  /**
   * Starts a long-running Harvest-to-Sale workflow
   */
  public static startHarvestToSaleWorkflow(lotEntityId: string): WorkflowInstance {
    const workflowId = `wf_h2s_${Date.now()}`;
    const now = new Date().toISOString();

    const instance: WorkflowInstance = {
      workflow_id: workflowId,
      workflow_name: 'HARVEST_TO_SALE',
      entity_id: lotEntityId,
      current_step: 'HARVEST_RECORDED',
      next_step: 'LOT_CREATED',
      status: 'IN_PROGRESS',
      state_version: 1,
      retry_count: 0,
      max_retries: 3,
      requires_human_approval: false,
      created_at: now,
      updated_at: now
    };

    this.workflows.set(workflowId, instance);
    return instance;
  }

  /**
   * Advances workflow step with optimistic concurrency check
   */
  public static advanceWorkflow(
    workflowId: string,
    expectedVersion: number,
    requiresApproval: boolean = false
  ): WorkflowInstance {
    const wf = this.workflows.get(workflowId);
    if (!wf) {
      throw new Error(`Workflow '${workflowId}' not found.`);
    }

    if (wf.state_version !== expectedVersion) {
      throw new Error(`CONCURRENCY CONFLICT: Expected version ${expectedVersion}, but found version ${wf.state_version}.`);
    }

    const currentIndex = this.HARVEST_TO_SALE_STEPS.indexOf(wf.current_step);
    if (currentIndex === -1 || currentIndex === this.HARVEST_TO_SALE_STEPS.length - 1) {
      wf.status = 'COMPLETED';
      wf.next_step = undefined;
    } else {
      wf.previous_step = wf.current_step;
      wf.current_step = this.HARVEST_TO_SALE_STEPS[currentIndex + 1];
      wf.next_step = currentIndex + 2 < this.HARVEST_TO_SALE_STEPS.length 
        ? this.HARVEST_TO_SALE_STEPS[currentIndex + 2] 
        : undefined;

      if (requiresApproval) {
        wf.status = 'WAITING_HUMAN_APPROVAL';
        wf.requires_human_approval = true;
      } else {
        wf.status = 'IN_PROGRESS';
        wf.requires_human_approval = false;
      }
    }

    wf.state_version += 1;
    wf.updated_at = new Date().toISOString();
    this.workflows.set(workflowId, wf);
    return wf;
  }

  /**
   * Evaluates offline mobile sync payloads and resolves conflicts
   */
  public static syncOfflinePayload(offline: MobileOfflinePayload): MobileOfflinePayload {
    if (offline.sync_state === 'DRAFT' || offline.sync_state === 'QUEUED') {
      offline.sync_state = 'SYNCING';
      offline.server_timestamp = new Date().toISOString();

      // Check for timestamp conflict (> 24 hours drift)
      const clientTime = new Date(offline.client_timestamp).getTime();
      const serverTime = new Date(offline.server_timestamp).getTime();
      if (Math.abs(serverTime - clientTime) > 86400000) {
        offline.sync_state = 'CONFLICT';
      } else {
        offline.sync_state = 'SYNCED';
      }
    }

    return offline;
  }
}
