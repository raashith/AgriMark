import { NextResponse } from 'next/server';
import { AISupervisorGovernanceEngine } from '@/lib/ai-supervisor-governance';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const requestId = `req-${Date.now()}`;
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const toolName = body.tool_name || 'get_mandi_prices';
  const evaluation = AISupervisorGovernanceEngine.evaluateToolInvocation(toolName);

  return NextResponse.json({
    success: true,
    request_id: requestId,
    timestamp: new Date().toISOString(),
    data: {
      tool_name: toolName,
      evaluation
    }
  }, {
    headers: { 'X-Request-ID': requestId }
  });
}



