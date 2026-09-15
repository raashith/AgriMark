import { NextResponse } from 'next/server';
import { WorkflowOrchestrator } from '@/lib/workflow-orchestrator';

export async function GET(request: Request) {
  const requestId = `req-${Date.now()}`;
  const { searchParams } = new URL(request.url);
  const lotId = searchParams.get('lot_id') || 'lot_paddy_7741';

  const wf = WorkflowOrchestrator.startHarvestToSaleWorkflow(lotId);

  return NextResponse.json({
    success: true,
    request_id: requestId,
    timestamp: new Date().toISOString(),
    data: wf
  }, {
    headers: { 'X-Request-ID': requestId }
  });
}
