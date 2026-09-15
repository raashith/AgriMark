# AgriMark Human Approval Framework

## Overview

The **Human Approval Framework** (`web/src/lib/human-approval-framework.ts`, `/api/v1/approvals`) enforces explicit human signoff for high-impact financial, legal, regulatory, and commercial actions.

---

## 7-State Approval State Machine

All approval requests follow a deterministic 7-state lifecycle:

```
                  ┌───────────────┐
                  │  RECOMMENDED  │
                  └───────┬───────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │ PENDING_APPROVAL │
                 └────────┬─────────┘
                          │
         ┌────────────────┼────────────────┐
         ▼                ▼                ▼
   ┌──────────┐     ┌──────────┐     ┌───────────┐
   │ APPROVED │     │ REJECTED │     │  EXPIRED  │
   └────┬─────┘     └──────────┘     └───────────┘
        │
        ▼
   ┌──────────┐
   │ EXECUTED │
   └────┬─────┘
        │ (if failure occurs during execution)
        ▼
   ┌──────────┐
   │  FAILED  │
   └──────────┘
```

---

## High-Impact Action Mandate

Human signoff is mandatory for actions falling under the following categories:

1. **Financial Operations**: Payout approvals, loan originations, escrow releases, credit line adjustments.
2. **Insurance Operations**: Claim settlements, policy underwriting approvals, loss assessments.
3. **Certification & Regulatory**: Organic farming certification issuance, export compliance verification.
4. **Dispute Resolution**: Binding buyer-seller arbitration agreements and refund approvals.
5. **External Communication**: Automated broadcast notifications sent to regional farmer networks.
6. **Physical Equipment Control**: IoT irrigation gate triggering, automated warehouse dispatch instructions.

---

## Auditability & Non-Repudiation

Each state transition records:
- `approval_id`: Prefix `appr_*`.
- `requested_by`: User or AI agent ID requesting approval.
- `approved_by`: Verified Human User ID approving or rejecting.
- `action_type`: Targeted operation identifier.
- `payload`: Immutable JSON payload of proposed action.
- `reason`: Justification text provided by approver/rejecter.
- `timestamp`: ISO-8601 timestamp of signoff.
