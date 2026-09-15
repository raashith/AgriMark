export const dynamic = 'force-dynamic';
import { Request } from 'next/dist/compiled/@edge-runtime/primitives';
import { parsePaginationParams, createInteroperabilityResponse } from '@/lib/interoperability-api-helpers';
import { InteroperabilityContractEngine } from '@/lib/interoperability-contracts';

export async function GET(request: Request) {
  const requestId = `req-${Date.now()}`;
  const pagination = parsePaginationParams(request.url);

  const sampleOrderPayload = {
    order_identity_id: 'ord_4410',
    listing_identity_id: 'list_9901',
    quantity_mt: 5.0,
    total_value_inr: 117500,
    payment_status: 'ESCROW_HELD',
    order_status: 'CONFIRMED'
  };

  const contract = InteroperabilityContractEngine.createContract(
    'Order',
    sampleOrderPayload,
    {
      source: 'AGRIMARK_TRADE_ENGINE',
      producer: 'BUYER',
      geography: 'THANJAVUR, TN',
      unit: 'METRIC_TON',
      provenance_id: 'prov-ord-4410'
    }
  );

  return createInteroperabilityResponse([contract], pagination, requestId);
}

