import { Request } from 'next/dist/compiled/@edge-runtime/primitives';
import { parsePaginationParams, createInteroperabilityResponse } from '@/lib/interoperability-api-helpers';
import { InteroperabilityContractEngine } from '@/lib/interoperability-contracts';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestId = `req-${Date.now()}`;
  const pagination = parsePaginationParams(request.url);

  const sampleMarketPayload = {
    mandi_code: 'TN_THJ_01',
    mandi_name: 'Thanjavur Main Mandi',
    commodity_code: 'RICE_PADDY',
    modal_price_inr: 2240,
    arrival_quantity_mt: 450,
    observation_date: new Date().toISOString().split('T')[0]
  };

  const contract = InteroperabilityContractEngine.createContract(
    'MarketObservation',
    sampleMarketPayload,
    {
      source: 'AGMARKNET_OFFICIAL',
      producer: 'MANDI_BOARD',
      geography: 'THANJAVUR, TN',
      unit: 'INR_PER_QUINTAL',
      provenance_id: 'prov-mkt-thj-01'
    }
  );

  return createInteroperabilityResponse([contract], pagination, requestId);
}



