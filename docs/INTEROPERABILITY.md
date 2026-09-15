# AgriMark Phase 11 - National Agricultural DPI Interoperability Architecture

## Overview
AgriMark Phase 11 establishes open agricultural Digital Public Infrastructure (DPI) interoperability standards, versioned data contracts, consent management, developer platform capabilities, webhooks, and provider federation adapters.

## Core Capabilities
1. **Machine-Readable Data Contracts**: Schema-backed JSON wrappers for 16 core agricultural entities.
2. **Farmer Consent Lifecycle**: Explicit `grant`, `view`, and `revoke` endpoints with role-based and scope-based policy enforcement.
3. **Open APIs**: `/api/v1/interoperability/` providing stable, paginated, rate-limited JSON data access.
4. **Developer Sandbox**: AgriTech developer app registration, credential management, SHA-256 secret hashing, and synthetic dataset isolation.
5. **Webhook System**: HMAC SHA-256 event delivery with exponential retry backoff and dead-letter queueing.
