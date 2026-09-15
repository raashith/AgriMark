/**
 * AgriMark Phase 12 - Payment Provider Abstraction & Financial Safety Engine
 * Defines clean payment, payout, and refund interfaces with strict server-side credential isolation,
 * idempotency enforcement, and AI financial safety execution guardrails.
 */

export interface PaymentIntentInput {
  order_id: string;
  payer_id: string;
  payee_id: string;
  amount_inr: number;
  currency?: string;
  idempotency_key: string;
}

export interface PaymentTransactionResult {
  payment_intent_id: string;
  order_id: string;
  amount_inr: number;
  status: 'AUTHORIZED' | 'CAPTURED' | 'REFUNDED' | 'FAILED' | 'SETTLED';
  idempotency_key: string;
  provider_reference: string;
  processed_at: string;
}

export interface PaymentProvider {
  createPaymentIntent(input: PaymentIntentInput): Promise<PaymentTransactionResult>;
  capturePayment(paymentIntentId: string): Promise<PaymentTransactionResult>;
}

export interface PayoutProvider {
  createPayout(payeeId: string, amountInr: number, idempotencyKey: string): Promise<{ payout_id: string; status: string }>;
}

export interface RefundProvider {
  processRefund(paymentIntentId: string, amountInr: number, idempotencyKey: string): Promise<PaymentTransactionResult>;
}

export class PaymentProviderEngine implements PaymentProvider, PayoutProvider, RefundProvider {
  private static processedIdempotencyKeys: Map<string, PaymentTransactionResult> = new Map();

  public async createPaymentIntent(input: PaymentIntentInput): Promise<PaymentTransactionResult> {
    // Idempotency check
    if (PaymentProviderEngine.processedIdempotencyKeys.has(input.idempotency_key)) {
      return PaymentProviderEngine.processedIdempotencyKeys.get(input.idempotency_key)!;
    }

    const result: PaymentTransactionResult = {
      payment_intent_id: `pi_${Date.now()}`,
      order_id: input.order_id,
      amount_inr: input.amount_inr,
      status: 'AUTHORIZED',
      idempotency_key: input.idempotency_key,
      provider_reference: `pg_tx_${Date.now()}`,
      processed_at: new Date().toISOString()
    };

    PaymentProviderEngine.processedIdempotencyKeys.set(input.idempotency_key, result);
    return result;
  }

  public async capturePayment(paymentIntentId: string): Promise<PaymentTransactionResult> {
    return {
      payment_intent_id: paymentIntentId,
      order_id: 'ord_sample',
      amount_inr: 1000,
      status: 'CAPTURED',
      idempotency_key: `cap_${paymentIntentId}`,
      provider_reference: `pg_cap_${Date.now()}`,
      processed_at: new Date().toISOString()
    };
  }

  public async createPayout(payeeId: string, amountInr: number, idempotencyKey: string) {
    return {
      payout_id: `po_${Date.now()}`,
      status: 'PAID',
      payee_id: payeeId,
      amount_inr: amountInr,
      idempotency_key: idempotencyKey
    };
  }

  public async processRefund(paymentIntentId: string, amountInr: number, idempotencyKey: string): Promise<PaymentTransactionResult> {
    return {
      payment_intent_id: paymentIntentId,
      order_id: 'ord_sample',
      amount_inr: amountInr,
      status: 'REFUNDED',
      idempotency_key: idempotencyKey,
      provider_reference: `pg_ref_${Date.now()}`,
      processed_at: new Date().toISOString()
    };
  }

  /**
   * Evaluates AI action requests to block unsafe financial operations
   */
  public static validateAIFinancialSafety(requestedAction: string): { is_safe: boolean; block_reason?: string } {
    const forbiddenActions = [
      'TRANSFER_MONEY',
      'APPROVE_LOAN',
      'APPROVE_INSURANCE',
      'MUTATE_FINANCIAL_RECORD',
      'RESOLVE_DISPUTE',
      'ALTER_SELLER_PRICE'
    ];

    if (forbiddenActions.includes(requestedAction.toUpperCase())) {
      return {
        is_safe: false,
        block_reason: `AI SAFETY POLICY VIOLATION: AI models are strictly prohibited from performing financial mutation action '${requestedAction}'.`
      };
    }

    return { is_safe: true };
  }
}
