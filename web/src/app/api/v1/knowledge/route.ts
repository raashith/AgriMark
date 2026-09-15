import { NextResponse } from 'next/server';
import { KnowledgeGraphEngine } from '@/lib/knowledge-graph-engine';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const entityId = searchParams.get('entity_id') || 'CR-RICE-001';
  const depth = parseInt(searchParams.get('depth') || '2', 10);

  const graph = await KnowledgeGraphEngine.traverseGraph(entityId, depth);
  return NextResponse.json({
    namespace: '/api/v1/knowledge',
    status: 'ACTIVE',
    entity_id: entityId,
    graph,
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const node = await KnowledgeGraphEngine.addEntity(body);
  return NextResponse.json({ success: true, node });
}



