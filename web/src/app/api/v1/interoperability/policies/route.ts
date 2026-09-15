import { Request } from 'next/dist/compiled/@edge-runtime/primitives';
import { parsePaginationParams, createInteroperabilityResponse } from '@/lib/interoperability-api-helpers';
import { InteroperabilityContractEngine } from '@/lib/interoperability-contracts';

export async function GET(request: Request) {
  const requestId = `req-${Date.now()}`;
  const pagination = parsePaginationParams(request.url);

  const samplePolicyPayload = {
    scheme_code: 'PM_KISAN_DBT',
    scheme_name: 'Pradhan Mantri Kisan Samman Nidhi',
    jurisdiction: 'NATIONAL',
    benefit_inr: 6000,
    max_land_hectares: 2.0
  };

  const contract = InteroperabilityContractEngine.createContract(
    'PolicyScheme',
    samplePolicyPayload,
    {
      source: 'MINISTRY_OF_AGRICULTURE_GOI',
      producer: 'POLICY_REGISTRY',
      geography: 'INDIA_NATIONAL',
      unit: 'SCHEME',
      provenance_id: 'prov-pol-pmkisan'
    }
  );

  return createInteroperabilityResponse([contract], pagination, requestId);
}
