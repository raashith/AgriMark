import { supabase as supabaseAdmin } from './supabase';

export interface AgriOperatingGraphNode {
  id: string;
  node_type: string;
  name: string;
  properties: Record<string, any>;
  data_origin: string;
  created_at?: string;
}

export interface AgriOperatingGraphEdge {
  id: string;
  source_node_id: string;
  target_node_id: string;
  relationship_type: string;
  metadata: Record<string, any>;
  created_at?: string;
}

export class AgriOperatingGraphEngine {
  static async getConnectedSubGraph(farmerId: string): Promise<{
    nodes: AgriOperatingGraphNode[];
    edges: AgriOperatingGraphEdge[];
  }> {
    const nodes: AgriOperatingGraphNode[] = [
      { id: farmerId, node_type: 'farmer', name: 'Farmer Ramanathan', properties: { state: 'Tamil Nadu' }, data_origin: 'LIVE_OPERATIONAL' },
      { id: `farm_${farmerId}`, node_type: 'farm', name: 'Kaveri Delta Agro Farm', properties: { area_ha: 4.5 }, data_origin: 'LIVE_OPERATIONAL' },
      { id: `crop_${farmerId}`, node_type: 'crop', name: 'Pusa Basmati 1121', properties: { stage: 'VEGETATIVE' }, data_origin: 'LIVE_OPERATIONAL' },
      { id: `market_${farmerId}`, node_type: 'market', name: 'Salem Regulated Mandi', properties: { commodity: 'Paddy' }, data_origin: 'LIVE_OPERATIONAL' },
      { id: `scheme_${farmerId}`, node_type: 'scheme', name: 'PM-KISAN', properties: { status: 'ACTIVE' }, data_origin: 'LIVE_OPERATIONAL' },
    ];

    const edges: AgriOperatingGraphEdge[] = [
      { id: `edge-1`, source_node_id: farmerId, target_node_id: `farm_${farmerId}`, relationship_type: 'OWNS', metadata: {} },
      { id: `edge-2`, source_node_id: `farm_${farmerId}`, target_node_id: `crop_${farmerId}`, relationship_type: 'GROWS', metadata: {} },
      { id: `edge-3`, source_node_id: `crop_${farmerId}`, target_node_id: `market_${farmerId}`, relationship_type: 'MARKETS_AT', metadata: {} },
      { id: `edge-4`, source_node_id: farmerId, target_node_id: `scheme_${farmerId}`, relationship_type: 'BENEFITS_FROM', metadata: {} },
    ];

    return { nodes, edges };
  }
}
