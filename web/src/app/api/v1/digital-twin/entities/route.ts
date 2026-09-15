import { NextResponse } from 'next/server';
import { DigitalTwinEntityGraph } from '@/lib/digital-twin-entity-graph';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const startId = searchParams.get('start_entity_id') || 'DIST-TN-SLM';
  const depth = parseInt(searchParams.get('depth') || '2', 10);

  const graph = await DigitalTwinEntityGraph.traverseGraph(startId, depth);
  return NextResponse.json(graph);
}

export async function POST(req: Request) {
  const body = await req.json();
  const entity = await DigitalTwinEntityGraph.addEntity(body);
  return NextResponse.json({ success: true, entity });
}
