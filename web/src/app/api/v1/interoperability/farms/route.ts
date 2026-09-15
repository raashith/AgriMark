export const dynamic = 'force-dynamic';
import { Request } from 'next/dist/compiled/@edge-runtime/primitives';
import { parsePaginationParams, createInteroperabilityResponse } from '@/lib/interoperability-api-helpers';
import { InteroperabilityContractEngine } from '@/lib/interoperability-contracts';

export async function GET(request: Request) {
  const requestId = `req-${Date.now()}`;
  const pagination = parsePaginationParams(request.url);

  const sampleFarmPayload = {
    farm_identity_id: 'farm_tn_0982',
    farmer_identity_id: 'usr_f_tn_98231',
    total_area_hectares: 1.85,
    irrigation_source: 'CANAL_WELL',
    soil_type: 'ALLUVIAL_CLAY',
    state_code: 'TN',
    district_code: 'THANJAVUR'
  };

  const contract = InteroperabilityContractEngine.createContract(
    'Farm',
    sampleFarmPayload,
    {
      source: 'AGRIMARK_REGISTRY',
      producer: 'AGRIMARK_SYSTEM',
      geography: 'THANJAVUR, TN',
      unit: 'HECTARE',
      provenance_id: 'prov-farm-0982'
    }
  );

  return createInteroperabilityResponse([contract], pagination, requestId);
}

