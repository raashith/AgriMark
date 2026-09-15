import { supabaseAdmin } from './supabase';

export interface NetworkNode {
  id: string;
  entity_type: 'farmer' | 'farm' | 'fpo' | 'buyer' | 'market' | 'mandi' | 'produce_lot' | 'order' | 'logistics' | 'warehouse' | 'quality_provider' | 'researcher';
  entity_name: string;
  data_origin: string;
  classification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'SENSITIVE';
  metadata: Record<string, unknown>;
  created_at?: string;
}

export interface NetworkEdge {
  id: string;
  source_entity_id: string;
  target_entity_id: string;
  relationship_type: 'owns_farm' | 'member_of_fpo' | 'planted_crop' | 'listed_lot' | 'ordered_by' | 'delivered_by' | 'stored_at' | 'harvested_from';
  weight: number;
  provenance: string;
  metadata: Record<string, unknown>;
  created_at?: string;
}

export async function addNetworkNode(node: Omit<NetworkNode, 'created_at'>): Promise<NetworkNode> {
  const payload = {
    ...node,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('network_entities')
      .upsert(payload)
      .select()
      .single();

    if (!error && data) return data as NetworkNode;
  }

  return payload;
}

export async function addNetworkEdge(edge: Omit<NetworkEdge, 'created_at'>): Promise<NetworkEdge> {
  const payload = {
    ...edge,
    created_at: new Date().toISOString()
  };

  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('network_relationships')
      .upsert(payload)
      .select()
      .single();

    if (!error && data) return data as NetworkEdge;
  }

  return payload;
}

export async function getEntityGraph(entityId: string, depth: number = 2): Promise<{ nodes: NetworkNode[]; edges: NetworkEdge[] }> {
  if (supabaseAdmin) {
    const { data: edgesData } = await supabaseAdmin
      .from('network_relationships')
      .select('*')
      .or(`source_entity_id.eq.${entityId},target_entity_id.eq.${entityId}`);

    const edges = (edgesData || []) as NetworkEdge[];
    const nodeIds = new Set<string>([entityId]);
    edges.forEach(e => {
      nodeIds.add(e.source_entity_id);
      nodeIds.add(e.target_entity_id);
    });

    const { data: nodesData } = await supabaseAdmin
      .from('network_entities')
      .select('*')
      .in('id', Array.from(nodeIds));

    return {
      nodes: (nodesData || []) as NetworkNode[],
      edges
    };
  }

  return {
    nodes: [
      { id: entityId, entity_type: 'farmer', entity_name: 'Sample Farmer', data_origin: 'mock', classification: 'INTERNAL', metadata: {} }
    ],
    edges: []
  };
}

export async function calculateNetworkDensity(region?: string): Promise<{ total_nodes: number; total_edges: number; density_score: number }> {
  if (supabaseAdmin) {
    const { count: nodeCount } = await supabaseAdmin.from('network_entities').select('*', { count: 'exact', head: true });
    const { count: edgeCount } = await supabaseAdmin.from('network_relationships').select('*', { count: 'exact', head: true });

    const nodes = nodeCount || 10;
    const edges = edgeCount || 15;
    const maxEdges = (nodes * (nodes - 1)) / 2;
    const density = maxEdges > 0 ? Number((edges / maxEdges).toFixed(4)) : 0;

    return {
      total_nodes: nodes,
      total_edges: edges,
      density_score: Math.min(density, 1.0)
    };
  }

  return {
    total_nodes: 100,
    total_edges: 250,
    density_score: 0.0505
  };
}
