export const dynamic = 'force-dynamic';
import { Request } from 'next/dist/compiled/@edge-runtime/primitives';
import { parsePaginationParams, createInteroperabilityResponse } from '@/lib/interoperability-api-helpers';
import { InteroperabilityContractEngine } from '@/lib/interoperability-contracts';

export async function GET(request: Request) {
  const requestId = `req-${Date.now()}`;
  const pagination = parsePaginationParams(request.url);

  const sampleFarmerPayload = {
    farmer_identity_id: 'usr_f_tn_98231',
    farmer_category: 'SMALL',
    state_code: 'TN',
    district_code: 'THANJAVUR',
    crops_count: 2,
    is_verified: true
  };

  const contract = InteroperabilityContractEngine.createContract(
    'Farmer',
    sampleFarmerPayload,
    {
      source: 'AGRIMARK_REGISTRY',
      producer: 'AGRIMARK_SYSTEM',
      geography: 'THANJAVUR, TN',
      unit: 'ENTITY',
      provenance_id: 'prov-farmer-98231',
      consent_scope: 'PUBLIC'
    }
  );

  return createInteroperabilityResponse([contract], pagination, requestId);
}

