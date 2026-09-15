import { NextResponse } from 'next/server';
import { getEntityGraph, calculateNetworkDensity } from '@/lib/agricultural-network-graph';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const entityId = searchParams.get('entity_id') || 'usr_f_sample';
  const region = searchParams.get('region') || 'Salem';

  const graph = await getEntityGraph(entityId);
  const density = await calculateNetworkDensity(region);

  return NextResponse.json({
    success: true,
    data: {
      graph,
      network_health: density
    }
  });
}
