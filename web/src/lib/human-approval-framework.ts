/**
 * AgriMark Phase 13 - Human Approval Framework Engine
 * Enforces explicit human approval workflow gates (RECOMMENDED -> PENDING_APPROVAL -> APPROVED -> EXECUTED)
 * for all high-impact actions (financial mutations, insurance underwriting, organic certification, external payouts).
 */

export type ApprovalStatus = 
  | 'RECOMMENDED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXECUTED'
  | 'FAILED'
  | 'EXPIRED';

export interface HumanApprovalRequest {
  request_id: string;
  requester_id: string;
  action_type: string;
  payload: Record<string, any>;
  status: ApprovalStatus;
  approver_id?: string;
  approval_notes?: string;
  created_at: string;
  decided_at?: string;
}

export class HumanApprovalFrameworkEngine {
  private static requests: Map<string, HumanApprovalRequest> = new Map();

  /**
   * Creates a human approval request for high-impact actions
   */
  public static createApprovalRequest(
    requesterId: string,
    actionType: string,
    payload: Record<string, any>
  ): HumanApprovalRequest {
    const requestId = `appr_${Date.now()}`;
    const now = new Date().toISOString();

    const request: HumanApprovalRequest = {
      request_id: requestId,
      requester_id: requesterId,
      action_type: actionType,
      payload,
      status: 'PENDING_APPROVAL',
      created_at: now
    };

    this.requests.set(requestId, request);
    return request;
  }

  /**
   * Decides approval request (Approve / Reject)
   */
  public static decideApproval(
    requestId: string,
    approverId: string,
    decision: 'APPROVED' | 'REJECTED',
    notes: string
  ): HumanApprovalRequest {
    const req = this.requests.get(requestId);
    if (!req) {
      throw new Error(`Approval request '${requestId}' not found.`);
    }

    req.status = decision;
    req.approver_id = approverId;
    req.approval_notes = notes;
    req.decided_at = new Date().toISOString();

    this.requests.set(requestId, req);
    return req;
  }

  /**
   * Executes approved action
   */
  public static executeApprovedAction(requestId: string): HumanApprovalRequest {
    const req = this.requests.get(requestId);
    if (!req) {
      throw new Error(`Approval request '${requestId}' not found.`);
    }

    if (req.status !== 'APPROVED') {
      throw new Error(`Action cannot be executed: Approval status is '${req.status}', required 'APPROVED'.`);
    }

    req.status = 'EXECUTED';
    this.requests.set(requestId, req);
    return req;
  }
}
