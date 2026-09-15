import { supabase as supabaseAdmin } from './supabase';

export type ReadinessStatus = 'READY' | 'PARTIAL' | 'BLOCKED' | 'UNKNOWN';

export interface DocumentStatusItem {
  document_type: string;
  is_required: boolean;
  is_available: boolean;
  is_verified: boolean;
  is_expired: boolean;
}

export interface SchemeApplicationReadiness {
  id: string;
  farmer_id: string;
  scheme_id: string;
  scheme_name: string;
  status: ReadinessStatus;
  readiness_pct: number;
  documents: DocumentStatusItem[];
  missing_documents: string[];
  eligibility_gaps: string[];
  deadline_date: string;
  official_application_channel: string;
  auto_submit_enabled: false; // Strictly non-automated submission
  evaluated_at: string;
}

export async function evaluateDocumentReadiness(
  farmerId: string,
  schemeId: string = 'TN_PM_KUSUM_SOLAR_2026'
): Promise<SchemeApplicationReadiness> {
  const docs: DocumentStatusItem[] = [
    { document_type: 'AADHAAR_CARD', is_required: true, is_available: true, is_verified: true, is_expired: false },
    { document_type: 'LAND_PATTA_CHITTA', is_required: true, is_available: true, is_verified: true, is_expired: false },
    { document_type: 'BANK_PASSBOOK_COPY', is_required: true, is_available: true, is_verified: true, is_expired: false },
    { document_type: 'CHITTA_VAO_CERTIFICATE', is_required: true, is_available: false, is_verified: false, is_expired: false }
  ];

  const availableCount = docs.filter((d) => d.is_available && d.is_verified).length;
  const totalRequired = docs.filter((d) => d.is_required).length;
  const readinessPct = Math.round((availableCount / totalRequired) * 100);

  const missingDocs = docs.filter((d) => !d.is_available).map((d) => d.document_type);

  let status: ReadinessStatus = 'PARTIAL';
  if (readinessPct === 100) {
    status = 'READY';
  } else if (readinessPct === 0) {
    status = 'BLOCKED';
  }

  const result: SchemeApplicationReadiness = {
    id: `readiness_${farmerId.toLowerCase()}_${schemeId.toLowerCase()}`,
    farmer_id: farmerId,
    scheme_id: schemeId,
    scheme_name: 'PM-KUSUM Component B Solar Off-Grid Pump Subsidy',
    status,
    readiness_pct: readinessPct,
    documents: docs,
    missing_documents: missingDocs,
    eligibility_gaps: missingDocs.length > 0 ? [`Missing mandatory VAO certificate: ${missingDocs.join(', ')}`] : [],
    deadline_date: '2026-10-31T23:59:59Z',
    official_application_channel: 'AED District Portal (tnaed.tn.gov.in) or Local e-Sevai Center',
    auto_submit_enabled: false,
    evaluated_at: new Date().toISOString()
  };

  if (supabaseAdmin) {
    await supabaseAdmin.from('scheme_readiness').upsert({
      id: result.id,
      farmer_id: result.farmer_id,
      scheme_id: result.scheme_id,
      status: result.status,
      readiness_pct: result.readiness_pct,
      missing_documents: result.missing_documents,
      evaluated_at: result.evaluated_at
    });
  }

  return result;
}
