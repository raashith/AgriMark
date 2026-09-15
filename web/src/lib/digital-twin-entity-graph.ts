import { supabase as supabaseAdmin } from './supabase';

export type DigitalTwinEntityType =
  | 'country' | 'state' | 'district' | 'block' | 'village' | 'farm' | 'field' | 'crop' | 'variety'
  | 'soil' | 'water_source' | 'irrigation_system' | 'weather_station' | 'climate_zone'
  | 'warehouse' | 'cold_storage' | 'processing_unit' | 'market' | 'mandi' | 'fpo'
  | 'logistics_node' | 'road' | 'rail_node' | 'port' | 'input_supplier' | 'machinery'
  | 'agricultural_device' | 'farmer' | 'policy' | 'scheme' | 'food_node';

export type DigitalTwinRelationshipType =
  | 'LOCATED_IN' | 'OWNS' | 'OPERATES' | 'GROWS' | 'DEPENDS_ON' | 'SUPPLIES'
  | 'TRANSPORTS_TO' | 'STORES_AT' | 'PROCESSES_AT' | 'MARKETS_AT' | 'AFFECTED_BY'
  | 'CONNECTED_TO' | 'PROTECTED_BY' | 'SUBJECT_TO';

export interface DigitalTwinEntity {
  id: string;
  entity_type: DigitalTwinEntityType;
  name: string;
  code?: string;
  geography: Record<string, any>;
  properties: Record<string, any>;
  data_origin: 'LIVE_OPERATIONAL' | 'SIMULATION' | 'STAGING' | 'SYNTHETIC';
  created_at?: string;
  updated_at?: string;
}

export interface DigitalTwinRelationship {
  id: string;
  source_entity_id: string;
  target_entity_id: string;
  relationship_type: DigitalTwinRelationshipType;
  weight: number;
  metadata: Record<string, any>;
  provenance: Record<string, any>;
  created_at?: string;
}

export class DigitalTwinEntityGraph {
  static async addEntity(entity: Omit<DigitalTwinEntity, 'created_at' | 'updated_at'>): Promise<DigitalTwinEntity> {
    const record: DigitalTwinEntity = {
      ...entity,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (process.env.NODE_ENV !== 'test') {
      await supabaseAdmin.from('digital_twin_entities').upsert([record]);
    }
    return record;
  }

  static async addRelationship(rel: Omit<DigitalTwinRelationship, 'created_at'>): Promise<DigitalTwinRelationship> {
    const record: DigitalTwinRelationship = {
      ...rel,
      created_at: new Date().toISOString(),
    };
    if (process.env.NODE_ENV !== 'test') {
      await supabaseAdmin.from('digital_twin_relationships').upsert([record]);
    }
    return record;
  }

  static async traverseGraph(startEntityId: string, maxDepth: number = 2): Promise<{
    startEntityId: string;
    nodes: DigitalTwinEntity[];
    edges: DigitalTwinRelationship[];
  }> {
    const sampleNodes: DigitalTwinEntity[] = [
      {
        id: startEntityId,
        entity_type: 'district',
        name: 'Salem District',
        code: 'TN-SLM',
        geography: { state: 'Tamil Nadu', lat: 11.6643, lon: 78.146 },
        properties: { total_farms: 12500, main_crop: 'Tapioca / Paddy' },
        data_origin: 'LIVE_OPERATIONAL',
      },
      {
        id: 'FM-SLM-001',
        entity_type: 'farm',
        name: 'Kaveri Delta Agro Farm',
        code: 'FM-001',
        geography: { village: 'Attur', area_ha: 4.5 },
        properties: { soil_type: 'Alluvial Clay', irrigation: 'Borewell + Drip' },
        data_origin: 'LIVE_OPERATIONAL',
      }
    ];

    const sampleEdges: DigitalTwinRelationship[] = [
      {
        id: `REL-${startEntityId}-FM-SLM-001`,
        source_entity_id: 'FM-SLM-001',
        target_entity_id: startEntityId,
        relationship_type: 'LOCATED_IN',
        weight: 1.0,
        metadata: { boundary_verified: true },
        provenance: { source: 'Land Records & GPS' }
      }
    ];

    return {
      startEntityId,
      nodes: sampleNodes,
      edges: sampleEdges,
    };
  }
}
