/**
 * AgriMark Phase 11 - Consent Management & Policy-Based Access Control Engine
 * Handles explicit farmer data consent lifecycle (grant, view, revoke, audit),
 * role & scope-based access evaluations, and provenance tracking.
 */

export type UserRole = 
  | 'farmer' 
  | 'buyer' 
  | 'FPO' 
  | 'logistics' 
  | 'researcher' 
  | 'developer' 
  | 'data_provider' 
  | 'admin';

export type AccessScope = 
  | 'public' 
  | 'community' 
  | 'commercial' 
  | 'research' 
  | 'private' 
  | 'regulated';

export type DataCategory = 
  | 'PERSONAL' 
  | 'FARM_LOCATION' 
  | 'CULTIVATION' 
  | 'FINANCIAL' 
  | 'MARKETPLACE' 
  | 'RESEARCH';

export interface ConsentRecord {
  id: string;
  data_owner_id: string;
  data_subject_type: string;
  data_category: DataCategory;
  purpose: string;
  recipient_id: string;
  scope: AccessScope;
  status: 'GRANTED' | 'REVOKED' | 'EXPIRED';
  granted_at: string;
  expires_at?: string;
  revoked_at?: string;
}

export interface AccessEvaluationContext {
  requester_id: string;
  requester_role: UserRole;
  requested_scope: AccessScope;
  data_owner_id?: string;
  data_category: DataCategory;
  consent_records?: ConsentRecord[];
}

export interface AccessEvaluationResult {
  is_allowed: boolean;
  reason: string;
  matched_consent_id?: string;
  anonymization_required: boolean;
}

export class ConsentAccessControlEngine {
  private static inMemoryConsents: Map<string, ConsentRecord> = new Map();

  /**
   * Grants a new explicit data consent record
   */
  public static grantConsent(
    dataOwnerId: string,
    recipientId: string,
    dataCategory: DataCategory,
    purpose: string,
    scope: AccessScope = 'commercial',
    durationDays: number = 365
  ): ConsentRecord {
    const id = `consent-${dataOwnerId.slice(0, 8)}-${Date.now()}`;
    const now = new Date();
    const expires = new Date(now.getTime() + durationDays * 86400000);

    const record: ConsentRecord = {
      id,
      data_owner_id: dataOwnerId,
      data_subject_type: 'FARMER',
      data_category: dataCategory,
      purpose,
      recipient_id: recipientId,
      scope,
      status: 'GRANTED',
      granted_at: now.toISOString(),
      expires_at: expires.toISOString()
    };

    this.inMemoryConsents.set(id, record);
    return record;
  }

  /**
   * Revokes an existing consent record
   */
  public static revokeConsent(consentId: string, ownerId: string): ConsentRecord {
    const consent = this.inMemoryConsents.get(consentId);
    if (!consent) {
      throw new Error(`Consent record ${consentId} not found.`);
    }
    if (consent.data_owner_id !== ownerId) {
      throw new Error('Unauthorized: Only data owner can revoke consent.');
    }

    consent.status = 'REVOKED';
    consent.revoked_at = new Date().toISOString();
    this.inMemoryConsents.set(consentId, consent);
    return consent;
  }

  /**
   * Retrieves active consents for a data owner
   */
  public static viewConsents(ownerId: string): ConsentRecord[] {
    return Array.from(this.inMemoryConsents.values()).filter(c => c.data_owner_id === ownerId);
  }

  /**
   * Policy-Based Access Control Evaluation (RBAC + ABAC + Consent)
   */
  public static evaluateAccess(context: AccessEvaluationContext): AccessEvaluationResult {
    // 1. Admin bypass
    if (context.requester_role === 'admin') {
      return { is_allowed: true, reason: 'ADMIN_ROLE_AUTHORIZED', anonymization_required: false };
    }

    // 2. Public Scope access
    if (context.requested_scope === 'public') {
      return { is_allowed: true, reason: 'PUBLIC_DATA_SCOPE', anonymization_required: true };
    }

    // 3. Self-ownership access
    if (context.data_owner_id && context.requester_id === context.data_owner_id) {
      return { is_allowed: true, reason: 'SELF_OWNERSHIP_AUTHORIZED', anonymization_required: false };
    }

    // 4. Researcher access requires aggregate/anonymized enforcement
    if (context.requester_role === 'researcher') {
      if (context.requested_scope === 'research') {
        return { is_allowed: true, reason: 'RESEARCHER_ANONYMIZED_SCOPE', anonymization_required: true };
      }
    }

    // 5. Commercial / Private access requires active explicit consent
    const activeConsents = (context.consent_records || Array.from(this.inMemoryConsents.values())).filter(c => 
      c.data_owner_id === context.data_owner_id &&
      c.recipient_id === context.requester_id &&
      c.data_category === context.data_category &&
      c.status === 'GRANTED' &&
      (!c.expires_at || new Date(c.expires_at) > new Date())
    );

    if (activeConsents.length > 0) {
      return {
        is_allowed: true,
        reason: 'ACTIVE_FARMER_CONSENT_GRANTED',
        matched_consent_id: activeConsents[0].id,
        anonymization_required: false
      };
    }

    return {
      is_allowed: false,
      reason: `ACCESS_DENIED: Requester '${context.requester_id}' lacks explicit active consent for category '${context.data_category}'`,
      anonymization_required: true
    };
  }
}
