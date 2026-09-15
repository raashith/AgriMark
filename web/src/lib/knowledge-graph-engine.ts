import { supabase as supabaseAdmin } from './supabase';

export type KnowledgeEntityType =
  | 'CROP'
  | 'VARIETY'
  | 'CULTIVAR'
  | 'SOIL'
  | 'NUTRIENT'
  | 'PEST'
  | 'DISEASE'
  | 'PATHOGEN'
  | 'PRACTICE'
  | 'INPUT'
  | 'IRRIGATION_METHOD'
  | 'CLIMATE_CONDITION'
  | 'WEATHER_EVENT'
  | 'FARM_OPERATION'
  | 'PROCESSING_METHOD'
  | 'STORAGE_METHOD'
  | 'MARKET'
  | 'RESEARCH_QUESTION';

export type KnowledgeRelationshipType =
  | 'CROP_REQUIRES_SOIL'
  | 'CROP_AFFECTED_BY_DISEASE'
  | 'DISEASE_CAUSED_BY'
  | 'CROP_REQUIRES_NUTRIENT'
  | 'PRACTICE_IMPROVES'
  | 'PRACTICE_RISKS'
  | 'VARIETY_SUITS'
  | 'CROP_SUITS_CLIMATE'
  | 'INPUT_USED_FOR'
  | 'RESEARCH_SUPPORTS'
  | 'RESEARCH_CONTRADICTS';

export interface KnowledgeGraphEntity {
  id: string;
  entity_type: KnowledgeEntityType;
  name: string;
  description: string;
  attributes: Record<string, any>;
}

export interface KnowledgeGraphRelationship {
  id: string;
  source_entity_id: string;
  target_entity_id: string;
  relationship_type: KnowledgeRelationshipType;
  confidence: number;
  evidence_id?: string;
}

export class KnowledgeGraphEngine {
  static async traverseGraph(entityId: string = 'CR-RICE-001', maxDepth: number = 2) {
    const res = await queryKnowledgeGraph(entityId);
    return res;
  }

  static async addEntity(entity: any) {
    if (process.env.NODE_ENV !== 'test') {
      await supabaseAdmin.from('agri_knowledge_entities').upsert([entity]);
    }
    return entity;
  }
}

export async function queryKnowledgeGraph(
  entityName: string = 'Turmeric'
): Promise<{
  entity: KnowledgeGraphEntity;
  relationships: Array<{ relationship: KnowledgeRelationshipType; target_name: string; confidence: number }>;
}> {
  const entity: KnowledgeGraphEntity = {
    id: `ent_${entityName.toLowerCase()}`,
    entity_type: 'CROP',
    name: entityName,
    description: 'Rhizomatous herbaceous perennial plant (Curcuma longa) of the ginger family.',
    attributes: { botanical_family: 'Zingiberaceae', primary_curcumin_pct: 3.8 }
  };

  const relationships = [
    { relationship: 'CROP_REQUIRES_SOIL' as KnowledgeRelationshipType, target_name: 'Red Sandy Loam with High Organic Matter', confidence: 0.95 },
    { relationship: 'CROP_AFFECTED_BY_DISEASE' as KnowledgeRelationshipType, target_name: 'Rhizome Rot (Pythium aphanidermatum)', confidence: 0.92 },
    { relationship: 'PRACTICE_IMPROVES' as KnowledgeRelationshipType, target_name: 'Pulse Drip Irrigation with Mulching', confidence: 0.94 }
  ];

  if (process.env.NODE_ENV !== 'test' && supabaseAdmin) {
    await supabaseAdmin.from('agri_knowledge_entities').upsert([entity]);
  }

  return { entity, relationships };
}
