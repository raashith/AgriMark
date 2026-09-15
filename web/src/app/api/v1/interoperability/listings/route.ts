import { Request } from 'next/dist/compiled/@edge-runtime/primitives';
import { parsePaginationParams, createInteroperabilityResponse } from '@/lib/interoperability-api-helpers';
import { InteroperabilityContractEngine } from '@/lib/interoperability-contracts';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestId = `req-${Date.now()}`;
  const pagination = parsePaginationParams(request.url);

  const sampleListingPayload = {
    listing_identity_id: 'list_9901',
    lot_identity_id: 'lot_paddy_7741',
    title: 'Premium Samba Paddy Rice',
    quantity_available_mt: 10.0,
    asking_price_inr_per_quintal: 2350,
    status: 'ACTIVE'
  };

  const contract = InteroperabilityContractEngine.createContract(
    'Listing',
    sampleListingPayload,
    {
      source: 'AGRIMARK_MARKETPLACE',
      producer: 'SELLER',
      geography: 'THANJAVUR, TN',
      unit: 'METRIC_TON',
      provenance_id: 'prov-list-9901'
    }
  );

  return createInteroperabilityResponse([contract], pagination, requestId);
}



