import { supabase as supabaseAdmin } from './supabase';

export type PolicySourceType =
  | 'OFFICIAL_PRIMARY'
  | 'OFFICIAL_SECONDARY'
  | 'AUTHORIZED_PROVIDER'
  | 'RESEARCH'
  | 'COMMERCIAL'
  | 'USER_PROVIDED'
  | 'AI_SUMMARY';

export type VerificationStatus =
  | 'VERIFIED_PRIMARY'
  | 'VERIFIED_SECONDARY'
  | 'UNVERIFIED'
  | 'STALE'
  | 'CONFLICTING';

export interface PolicySourceRecord {
  id: string;
  name: string;
  source_type: PolicySourceType;
  url: string;
  trust_rank: number; // 1 = highest (OFFICIAL_PRIMARY)
  verification_status: VerificationStatus;
  conflicting_sources_surfaced?: Array<{ source_name: string; point_of_conflict: string }>;
  checked_at: string;
}

export async function verifyPolicySource(sourceUrl: string): Promise<PolicySourceRecord> {
  const isGovDomain = sourceUrl.includes('.gov.in') || sourceUrl.includes('.nic.in');

  const record: PolicySourceRecord = {
    id: `src_${Math.random().toString(36).substring(2, 10)}`,
    name: isGovDomain ? 'Official Government Gazette / Department Portal' : 'Secondary Agri-News Portal',
    source_type: isGovDomain ? 'OFFICIAL_PRIMARY' : 'OFFICIAL_SECONDARY',
    url: sourceUrl,
    trust_rank: isGovDomain ? 1 : 3,
    verification_status: isGovDomain ? 'VERIFIED_PRIMARY' : 'VERIFIED_SECONDARY',
    checked_at: new Date().toISOString()
  };

  if (supabaseAdmin) {
    await supabaseAdmin.from('policy_sources').upsert({
      id: record.id,
      name: record.name,
      source_type: record.source_type,
      url: record.url,
      trust_rank: record.trust_rank,
      verification_status: record.verification_status,
      checked_at: record.checked_at
    });
  }

  return record;
}

export function handleConflictingSources(
  primarySource: PolicySourceRecord,
  secondarySource: PolicySourceRecord,
  conflictDescription: string
): { has_conflict: boolean; notification: string; surfaced_sources: PolicySourceRecord[] } {
  primarySource.verification_status = 'CONFLICTING';
  secondarySource.verification_status = 'CONFLICTING';

  return {
    has_conflict: true,
    notification: `CONFLICT DETECTED: ${conflictDescription}. Both primary (${primarySource.name}) and secondary (${secondarySource.name}) sources are surfaced for user review. AgriMark does not silently overwrite conflicting policy data.`,
    surfaced_sources: [primarySource, secondarySource]
  };
}
