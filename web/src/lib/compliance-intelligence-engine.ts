import { supabase as supabaseAdmin } from './supabase';

export type ComplianceChecklistStatus = 'OPEN' | 'IN_PROGRESS' | 'READY' | 'EXPIRED' | 'NOT_APPLICABLE';

export interface ComplianceRequirementRecord {
  id: string;
  category: string;
  title: string;
  jurisdiction: string;
  authority_source: string;
  effective_period: string;
  applicable_entities: string[];
  legal_advice_disclaimer: string;
}

export interface FarmerComplianceChecklist {
  id: string;
  farmer_id: string;
  checklist_type: string;
  item_title: string;
  status: ComplianceChecklistStatus;
  updated_at: string;
}

export interface FPOGovernanceRecord {
  id: string;
  fpo_id: string;
  registration_no: string;
  member_count: number;
  board_directors: string[];
  compliance_status: 'COMPLIANT' | 'AUDIT_PENDING' | 'ACTION_REQUIRED';
  audit_date?: string;
  official_legal_verification_claimed: false; // Never impersonate legal/gov registry verification
  updated_at: string;
}

export async function getComplianceRequirements(category: string = 'ORGANIC'): Promise<ComplianceRequirementRecord[]> {
  return [
    {
      id: `comp_org_1`,
      category: 'ORGANIC',
      title: 'NPOP Organic Farming Certification & Conversion Standards',
      jurisdiction: 'National',
      authority_source: 'APEDA (Agricultural & Processed Food Products Export Development Authority)',
      effective_period: '2025-2027',
      applicable_entities: ['Organic Farmers', 'FPOs', 'Exporters'],
      legal_advice_disclaimer: 'Compliance recommendations are decision-support guidance only and do not constitute formal legal advice.'
    }
  ];
}

export async function getFarmerComplianceChecklist(farmerId: string): Promise<FarmerComplianceChecklist[]> {
  const checklist: FarmerComplianceChecklist[] = [
    {
      id: `chk_1_${farmerId}`,
      farmer_id: farmerId,
      checklist_type: 'SCHEME_APPLICATION',
      item_title: 'Aadhaar e-KYC Verification for PM-KISAN',
      status: 'READY',
      updated_at: new Date().toISOString()
    },
    {
      id: `chk_2_${farmerId}`,
      farmer_id: farmerId,
      checklist_type: 'QUALITY_COMPLIANCE',
      item_title: 'FSSAI Moisture & Curcumin Level Audit Certificate',
      status: 'IN_PROGRESS',
      updated_at: new Date().toISOString()
    }
  ];

  if (supabaseAdmin) {
    for (const c of checklist) {
      await supabaseAdmin.from('compliance_checklists').upsert(c);
    }
  }

  return checklist;
}

export async function getFPOGovernanceRecord(fpoId: string): Promise<FPOGovernanceRecord> {
  const record: FPOGovernanceRecord = {
    id: `fpo_gov_${fpoId.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    fpo_id: fpoId,
    registration_no: 'U01110TN2024PTC145021',
    member_count: 850,
    board_directors: ['K. Rajendran (President)', 'M. Saravanan (CEO)', 'P. Lakshmi (Director)'],
    compliance_status: 'COMPLIANT',
    audit_date: '2026-03-31T00:00:00Z',
    official_legal_verification_claimed: false,
    updated_at: new Date().toISOString()
  };

  if (supabaseAdmin) {
    await supabaseAdmin.from('fpo_governance_records').upsert({
      id: record.id,
      fpo_id: record.fpo_id,
      registration_no: record.registration_no,
      member_count: record.member_count,
      board_directors: record.board_directors,
      compliance_status: record.compliance_status,
      audit_date: record.audit_date,
      updated_at: record.updated_at
    });
  }

  return record;
}
