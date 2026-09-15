export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { QualityDisputeEngine } from '@/lib/quality-dispute-engine';

export async function GET(request: Request) {
  const requestId = `req-${Date.now()}`;
  const { searchParams } = new URL(request.url);
  const lotId = searchParams.get('lot_id') || 'lot_paddy_7741';

  const inspection = QualityDisputeEngine.createQualityInspection({
    lot_id: lotId,
    inspector_id: 'insp_gov_tn_04',
    inspector_name: 'Dr. R. Sundaram (Quality Officer)',
    inspection_method: 'DIGITAL_NIR_SCANNER',
    moisture_percent: 13.2,
    purity_percent: 98.5,
    grade: 'GRADE_A_PREMIUM',
    size_mm: 6.8,
    color_grade: 'GOLDEN_UNIFORM',
    contaminants_ppm: 0.0,
    damage_percent: 0.5,
    storage_condition: 'DRY_COLD_SILO',
    certificate_reference_id: 'CERT-TN-2026-9921',
    evidence_urls: ['https://agrimark-storage.internal/certs/CERT-TN-2026-9921.pdf']
  });

  return NextResponse.json({
    success: true,
    request_id: requestId,
    timestamp: new Date().toISOString(),
    data: inspection
  }, {
    headers: { 'X-Request-ID': requestId }
  });
}

