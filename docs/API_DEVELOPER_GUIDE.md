# AgriMark API Developer Guide

## Authentication & Credentials
API access requires client credentials (`client_id` and `client_secret`).
- Secrets are hashed using SHA-256 before database storage. Plaintext secrets are displayed once upon generation.
- Credentials can be rotated or revoked at any time.

## Endpoint Base URL
`https://agrimark-six.vercel.app/api/v1/interoperability/`

## Rate Limits & Headers
- Default Rate Limit: `1,000 requests / hour`
- Headers: `X-Request-ID`, `X-API-Version`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`
