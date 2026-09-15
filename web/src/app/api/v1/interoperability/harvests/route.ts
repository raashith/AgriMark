import { Request } from 'next/dist/compiled/@edge-runtime/primitives';
import { parsePaginationParams, createInteroperabilityResponse } from '@/lib/interoperability-api-helpers';
import { InteroperabilityContractEngine } from '@/lib/interoperability-contracts';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestId = `req-${Date.now()}`;
  const pagination = parsePaginationParams(request.url);

  const sampleHarvestPayload = {
    harvest_identity_id: 'hrv_8812',
    crop_identity_id: 'crop_paddy_01',
    harvested_quantity_mt: 14.5,
    quality_grade: 'GRADE_A',
    moisture_content_percent: 13.2,
    harvest_date: '2026-09-10'
  };

  const contract = InteroperabilityContractEngine.createContract(
    'Harvest',
    sampleHarvestPayload,
    {
      source: 'AGRIMARK_HARVEST_LOG',
      producer: 'FARMER_RECORD',
      geography: 'THANJAVUR, TN',
      unit: 'METRIC_TON',
      provenance_id: 'prov-hrv-8812'
    }
  );

  return createInteroperabilityResponse([contract], pagination, requestId);
}



