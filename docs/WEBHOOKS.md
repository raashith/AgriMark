# AgriMark Webhook System & Event Guide

## Event Types
- `farm.updated`
- `crop.created`
- `harvest.recorded`
- `lot.created`
- `listing.created`
- `order.created`
- `order.updated`
- `shipment.updated`
- `market.price_updated`
- `forecast.updated`
- `fpo.membership_updated`

## HMAC Signature Verification
Every webhook delivery includes an `X-AgriMark-Signature` header containing an HMAC SHA-256 digest of the request payload signed with the developer secret.

## Retry Policy
Failed deliveries are retried up to 5 times using exponential backoff ($2^{\text{attempt}} \times 5\text{s}$). Deliveries exceeding max attempts transition to `DEAD_LETTER` state for inspection and replay.
