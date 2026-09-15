# AgriMark Settlement & Ledger Abstraction Specification

## Server-Side Fee Breakdown Model
- **Gross Order Amount**: Total order value.
- **Platform Fee (2%)**: Automated platform operational fee.
- **Logistics Fee (3%)**: Transport & handling allocation.
- **Tax Amount (1%)**: Applicable statutory tax.
- **Seller Payable**: `Gross - Platform Fee - Logistics Fee`.

API Endpoint: `/api/v1/payments` with mandatory `idempotency_key` header/body to prevent double billing.
