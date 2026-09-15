# AgriMark Payment Provider Abstraction

## Interfaces
- `PaymentProvider`: Creates and captures payment intents.
- `PayoutProvider`: Executes merchant payouts.
- `RefundProvider`: Processes transaction refunds.

Idempotency keys are enforced on all payment requests. Provider credentials remain strictly server-side.
