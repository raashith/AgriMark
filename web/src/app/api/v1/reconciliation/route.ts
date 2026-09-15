import { NextResponse } from 'next/server';
import { ReconciliationEngine } from '@/lib/reconciliation-engine';

export async function GET(request: Request) {
  const requestId = `req-${Date.now()}`;

  const transactions = [
    { id: 'tx_01', order_id: 'ord_4410', amount_inr: 117500, status: 'CAPTURED' },
    { id: 'tx_02', order_id: 'ord_4411', amount_inr: 85000, status: 'CAPTURED' }
  ];

  const settlements = [
    { id: 'settle_01', order_id: 'ord_4410', gross_amount_inr: 117500, net_payout_inr: 116325, status: 'PAID' },
    { id: 'settle_02', order_id: 'ord_4411', gross_amount_inr: 85000, net_payout_inr: 84150, status: 'PAID' }
  ];

  const reconciliation = ReconciliationEngine.runReconciliation(transactions, settlements);

  return NextResponse.json({
    success: true,
    request_id: requestId,
    timestamp: new Date().toISOString(),
    data: {
      run_code: `REC-${Date.now()}`,
      reconciliation
    }
  }, {
    headers: { 'X-Request-ID': requestId }
  });
}
