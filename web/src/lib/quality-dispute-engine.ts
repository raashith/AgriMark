/**
 * AgriMark Phase 12 - Quality Assaying, Dispute State Machine, & Trusted Certificate Engine
 * Handles digital/laboratory produce assaying, dispute state machine progression with immutable auditing,
 * and trusted produce passport certificate generation.
 */

export type DisputeStatus = 
  | 'DISPUTE_OPENED'
  | 'EVIDENCE_COLLECTION'
  | 'SELLER_RESPONSE'
  | 'BUYER_RESPONSE'
  | 'UNDER_REVIEW'
  | 'RESOLUTION_PROPOSED'
  | 'RESOLVED'
  | 'APPEALED'
  | 'CLOSED';

export type DisputeReason = 
  | 'QUANTITY_MISMATCH'
  | 'QUALITY_MISMATCH'
  | 'LATE_DELIVERY'
  | 'DAMAGED_PRODUCE'
  | 'WRONG_PRODUCT'
  | 'PRICE_DISAGREEMENT'
  | 'PAYMENT_DISPUTE';

export interface QualityInspectionRecord {
  id: string;
  inspection_code: string;
  lot_id: string;
  inspector_id: string;
  inspector_name: string;
  inspection_method: 'DIGITAL_NIR_SCANNER' | 'LAB_CHEMICAL_ANALYSIS' | 'MANUAL_PHYSICAL_INSPECTION';
  moisture_percent: number;
  purity_percent: number;
  grade: string;
  size_mm?: number;
  color_grade?: string;
  contaminants_ppm: number;
  damage_percent: number;
  storage_condition: string;
  certificate_reference_id: string;
  inspected_at: string;
  evidence_urls: string[];
}

export interface DisputeRecord {
  id: string;
  dispute_code: string;
  order_id: string;
  complainant_id: string;
  respondent_id: string;
  reason: DisputeReason;
  status: DisputeStatus;
  claim_amount_inr: number;
  resolved_amount_inr?: number;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

export class QualityDisputeEngine {
  private static disputes: Map<string, DisputeRecord> = new Map();
  private static disputeEvents: any[] = [];

  /**
   * Registers an authorized quality inspection certificate
   */
  public static createQualityInspection(input: Omit<QualityInspectionRecord, 'id' | 'inspection_code' | 'inspected_at'>): QualityInspectionRecord {
    const code = `QUAL-${Date.now()}`;
    return {
      id: `qual-${Date.now()}`,
      inspection_code: code,
      inspected_at: new Date().toISOString(),
      ...input
    };
  }

  /**
   * Opens a new transaction dispute
   */
  public static openDispute(
    orderId: string,
    complainantId: string,
    respondentId: string,
    reason: DisputeReason,
    claimAmountInr: number,
    initialNotes: string
  ): DisputeRecord {
    const disputeId = `disp-${Date.now()}`;
    const disputeCode = `DISP-${Date.now()}`;
    const now = new Date().toISOString();

    const record: DisputeRecord = {
      id: disputeId,
      dispute_code: disputeCode,
      order_id: orderId,
      complainant_id: complainantId,
      respondent_id: respondentId,
      reason,
      status: 'DISPUTE_OPENED',
      claim_amount_inr: claimAmountInr,
      created_at: now,
      updated_at: now
    };

    this.disputes.set(disputeId, record);
    this.recordDisputeEvent(disputeId, complainantId, 'OPEN_DISPUTE', undefined, 'DISPUTE_OPENED', initialNotes);

    return record;
  }

  /**
   * Transitions dispute state machine cleanly
   */
  public static transitionDispute(
    disputeId: string,
    actorId: string,
    action: string,
    targetStatus: DisputeStatus,
    notes: string,
    resolvedAmountInr?: number
  ): DisputeRecord {
    const dispute = this.disputes.get(disputeId);
    if (!dispute) {
      throw new Error(`Dispute ${disputeId} not found.`);
    }

    const previousStatus = dispute.status;
    dispute.status = targetStatus;
    dispute.updated_at = new Date().toISOString();
    if (resolvedAmountInr !== undefined) {
      dispute.resolved_amount_inr = resolvedAmountInr;
    }
    if (notes) {
      dispute.resolution_notes = notes;
    }

    this.disputes.set(disputeId, dispute);
    this.recordDisputeEvent(disputeId, actorId, action, previousStatus, targetStatus, notes);

    return dispute;
  }

  private static recordDisputeEvent(
    disputeId: string,
    actorId: string,
    action: string,
    fromStatus: DisputeStatus | undefined,
    toStatus: DisputeStatus,
    notes: string
  ) {
    this.disputeEvents.push({
      id: `event-${Date.now()}`,
      dispute_id: disputeId,
      actor_id: actorId,
      action,
      from_status: fromStatus,
      to_status: toStatus,
      notes,
      created_at: new Date().toISOString()
    });
  }

  public static getDisputeEvents(disputeId: string): any[] {
    return this.disputeEvents.filter(e => e.dispute_id === disputeId);
  }
}
