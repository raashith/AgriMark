export const dynamic = 'force-dynamic';
import { Request } from 'next/dist/compiled/@edge-runtime/primitives';
import { parsePaginationParams, createInteroperabilityResponse } from '@/lib/interoperability-api-helpers';
import { InteroperabilityContractEngine } from '@/lib/interoperability-contracts';

export async function GET(request: Request) {
  const requestId = `req-${Date.now()}`;
  const pagination = parsePaginationParams(request.url);

  const sampleWxPayload = {
    district_code: 'THANJAVUR',
    state_code: 'TN',
    observation_date: new Date().toISOString().split('T')[0],
    rainfall_mm: 14.8,
    temp_avg_c: 29.35,
    soil_moisture_volumetric: 0.28
  };

  const contract = InteroperabilityContractEngine.createContract(
    'WeatherObservation',
    sampleWxPayload,
    {
      source: 'IMD_OFFICIAL',
      producer: 'METEOROLOGICAL_DEPT',
      geography: 'THANJAVUR, TN',
      unit: 'METRIC',
      provenance_id: 'prov-wx-thj-01'
    }
  );

  return createInteroperabilityResponse([contract], pagination, requestId);
}

