import { Request } from 'next/dist/compiled/@edge-runtime/primitives';
import { parsePaginationParams, createInteroperabilityResponse } from '@/lib/interoperability-api-helpers';
import { InteroperabilityContractEngine } from '@/lib/interoperability-contracts';

export async function GET(request: Request) {
  const requestId = `req-${Date.now()}`;
  const pagination = parsePaginationParams(request.url);

  const sampleCropPayload = {
    crop_identity_id: 'crop_paddy_01',
    commodity_code: 'RICE_PADDY',
    crop_name: 'Paddy CR-1009 Sub1',
    season: 'KHARIF',
    expected_harvest_date: '2026-10-15'
  };

  const contract = InteroperabilityContractEngine.createContract(
    'Crop',
    sampleCropPayload,
    {
      source: 'AGRIMARK_CROP_REGISTRY',
      producer: 'FARMER_RECORD',
      geography: 'THANJAVUR, TN',
      unit: 'CROP',
      provenance_id: 'prov-crop-01'
    }
  );

  return createInteroperabilityResponse([contract], pagination, requestId);
}
