export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { AgriculturalTrustEngine } from '@/lib/agricultural-trust-engine';

export async function GET(request: Request) {
  const requestId = `req-${Date.now()}`;
  const { searchParams } = new URL(request.url);
  const entityId = searchParams.get('entity_id') || 'usr_f_tn_98231';
  const entityType = (searchParams.get('entity_type') || 'FARMER') as any;

  const trustResult = AgriculturalTrustEngine.calculateTrustScore({
    entity_id: entityId,
    entity_type: entityType,
    identity_verified: true,
    farm_verified: true,
    total_orders_attempted: 12,
    orders_fulfilled: 12,
    quality_inspections_passed: 4,
    total_quality_inspections: 4,
    disputes_opened_against: 0
  });

  return NextResponse.json({
    success: true,
    request_id: requestId,
    timestamp: new Date().toISOString(),
    data: trustResult
  }, {
    headers: { 'X-Request-ID': requestId }
  });
}

