import { NextResponse } from 'next/server';
import { HumanApprovalFrameworkEngine } from '@/lib/human-approval-framework';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestId = `req-${Date.now()}`;
  const { searchParams } = new URL(request.url);
  const requesterId = searchParams.get('requester_id') || 'usr_f_tn_98231';

  const approvalReq = HumanApprovalFrameworkEngine.createApprovalRequest(
    requesterId,
    'SUBMIT_ORGANIC_CERTIFICATION',
    { lot_id: 'lot_paddy_7741', cert_body: 'APEDA_NPOP' }
  );

  return NextResponse.json({
    success: true,
    request_id: requestId,
    timestamp: new Date().toISOString(),
    data: approvalReq
  }, {
    headers: { 'X-Request-ID': requestId }
  });
}



