import { Request } from 'next/dist/compiled/@edge-runtime/primitives';
import { parsePaginationParams, createInteroperabilityResponse } from '@/lib/interoperability-api-helpers';
import { InteroperabilityContractEngine } from '@/lib/interoperability-contracts';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestId = `req-${Date.now()}`;
  const pagination = parsePaginationParams(request.url);

  const sampleFcPayload = {
    commodity_code: 'RICE_PADDY',
    target_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    predicted_modal_price_inr: 2345.50,
    lower_bound_95: 2260.00,
    upper_bound_95: 2431.00,
    model_name: 'AgriMark-Hybrid-XGB-LSTM'
  };

  const contract = InteroperabilityContractEngine.createContract(
    'Forecast',
    sampleFcPayload,
    {
      source: 'AGRIMARK_MLOPS',
      producer: 'FORECAST_ENGINE',
      geography: 'THANJAVUR, TN',
      unit: 'INR_PER_QUINTAL',
      provenance_id: 'prov-fc-thj-01'
    }
  );

  return createInteroperabilityResponse([contract], pagination, requestId);
}



