# AgriMark First-Party OTP Architecture

## Purpose

AgriMark generates and verifies one-time authentication codes in server-side code. Supabase remains the canonical identity/session system.

## Flow

1. User enters a normalized E.164 phone number.
2. AgriMark server creates a unique challenge.
3. Server generates a 6-digit code using a cryptographically secure RNG.
4. The code is never returned to the browser and is never stored in plaintext.
5. AgriMark stores a keyed HMAC representation tied to phone + challenge ID + purpose.
6. The delivery adapter sends the code through the configured SMS provider.
7. User submits the code and challenge ID.
8. Server validates expiry, attempt limit, lock state, phone binding, and the HMAC.
9. Successful verification atomically consumes the challenge so it cannot be replayed.
10. Application then establishes/continues the canonical Supabase Auth session.

## Security rules

- 5 minute OTP lifetime.
- 5 verification attempts per challenge.
- 60 second resend cooldown.
- 5 sends/hour per phone.
- 10 sends/day per phone.
- 10 sends/hour per IP.
- Generic errors that avoid account enumeration.
- No OTP values in application logs, analytics, or error reports.
- Private OTP/signing secrets stay server-side only.
- SMS/WhatsApp delivery is provider-dependent; AgriMark does not claim provider availability until configured.

## Storage

Supabase stores `public.agrimark_otp_challenges`:

- challenge ID
- normalized phone
- purpose
- HMAC/hash representation
- creation/expiry timestamps
- attempt count
- lock/consumption state
- hashed requesting IP
- minimal non-secret metadata

The table has RLS enabled with no direct user policies; server-side trusted code performs challenge operations.

## Important implementation rule

The OTP engine must not create a fake access token. A successful OTP verification must end in a real Supabase Auth session/token flow.