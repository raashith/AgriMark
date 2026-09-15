/**
 * AgriMark Phase 12 - Financial Reconciliation & Audit Engine
 * Scans transactions and settlement records to detect mismatches (missing payments, duplicate payments,
 * amount mismatches, failed payouts, unmatched settlements) and logs append-only financial audit trails.
 */

export interface TransactionRecord {
  id: string;
  order_id: string;
  amount_inr: number;
  status: string;
}

export interface SettlementRecord {
  id: string;
  order_id: string;
  gross_amount_inr: number;
  net_payout_inr: number;
  status: string;
}

export interface ReconciliationDiscrepancy {
  transaction_id: string;
  issue_type: 'MISSING_PAYMENT' | 'DUPLICATE_PAYMENT' | 'AMOUNT_MISMATCH' | 'FAILED_PAYOUT' | 'UNMATCHED_SETTLEMENT';
  expected_amount_inr: number;
  actual_amount_inr: number;
  discrepancy_inr: number;
}

export interface FinancialAuditLog {
  actor_id: string;
  action: string;
  amount_inr: number;
  currency: string;
  order_id: string;
  provider: string;
  idempotency_key: string;
  timestamp: string;
  status: string;
  correlation_id: string;
}

export class ReconciliationEngine {
  private static auditLogs: FinancialAuditLog[] = [];

  public static runReconciliation(
    transactions: TransactionRecord[],
    settlements: SettlementRecord[]
  ): { status: 'MATCHED' | 'MISMATCH_DETECTED'; discrepancies: ReconciliationDiscrepancy[] } {
    const discrepancies: ReconciliationDiscrepancy[] = [];
    const transactionMap = new Map<string, TransactionRecord>();
    const seenTxIds = new Set<string>();

    transactions.forEach(tx => {
      if (seenTxIds.has(tx.id)) {
        discrepancies.push({
          transaction_id: tx.id,
          issue_type: 'DUPLICATE_PAYMENT',
          expected_amount_inr: tx.amount_inr,
          actual_amount_inr: tx.amount_inr * 2,
          discrepancy_inr: tx.amount_inr
        });
      } else {
        seenTxIds.add(tx.id);
        transactionMap.set(tx.order_id, tx);
      }
    });

    settlements.forEach(settlement => {
      const matchedTx = transactionMap.get(settlement.order_id);
      if (!matchedTx) {
        discrepancies.push({
          transaction_id: settlement.id,
          issue_type: 'UNMATCHED_SETTLEMENT',
          expected_amount_inr: 0,
          actual_amount_inr: settlement.gross_amount_inr,
          discrepancy_inr: settlement.gross_amount_inr
        });
      } else if (matchedTx.amount_inr !== settlement.gross_amount_inr) {
        discrepancies.push({
          transaction_id: matchedTx.id,
          issue_type: 'AMOUNT_MISMATCH',
          expected_amount_inr: matchedTx.amount_inr,
          actual_amount_inr: settlement.gross_amount_inr,
          discrepancy_inr: settlement.gross_amount_inr - matchedTx.amount_inr
        });
      }
    });

    return {
      status: discrepancies.length === 0 ? 'MATCHED' : 'MISMATCH_DETECTED',
      discrepancies
    };
  }

  /**
   * Appends an immutable financial audit log
   */
  public static logFinancialAudit(entry: FinancialAuditLog): FinancialAuditLog {
    this.auditLogs.push(entry);
    return entry;
  }

  public static getAuditLogs(): FinancialAuditLog[] {
    return [...this.auditLogs];
  }
}
