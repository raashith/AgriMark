/**
 * AgriMark Phase 13 - National Operating Graph & Unified Entity Identifiers Engine
 * Manages canonical relationship graph nodes & stable, non-sequential entity identifiers
 * (never phone numbers) with data classification attributes.
 */

import crypto from 'crypto';

export type EntityType = 
  | 'FARMER'
  | 'FARM'
  | 'CROP'
  | 'CULTIVATION'
  | 'HARVEST'
  | 'PRODUCE_LOT'
  | 'LISTING'
  | 'ORDER'
  | 'SHIPMENT'
  | 'WAREHOUSE'
  | 'FPO'
  | 'MARKET'
  | 'BUYER';

export type DataClassification = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'SENSITIVE' | 'REGULATED';

export interface UnifiedEntityIdentifier {
  entity_type: EntityType;
  canonical_id: string;
  entity_version: number;
  owner_id: string;
  data_classification: DataClassification;
  created_at: string;
}

export interface OperatingGraphNode {
  canonical_id: string;
  entity_type: EntityType;
  parent_id?: string;
  children_ids: string[];
  attributes: Record<string, any>;
  provenance_id: string;
}

export class NationalOperatingGraphEngine {
  private static registeredEntities: Map<string, UnifiedEntityIdentifier> = new Map();
  private static graphNodes: Map<string, OperatingGraphNode> = new Map();

  /**
   * Generates a stable, globally unique non-sequential canonical identifier
   */
  public static generateCanonicalId(entityType: EntityType): string {
    const prefixMap: Record<EntityType, string> = {
      FARMER: 'usr_f',
      FARM: 'farm',
      CROP: 'crop',
      CULTIVATION: 'cult',
      HARVEST: 'hrv',
      PRODUCE_LOT: 'lot',
      LISTING: 'list',
      ORDER: 'ord',
      SHIPMENT: 'ship',
      WAREHOUSE: 'wh',
      FPO: 'fpo',
      MARKET: 'mkt',
      BUYER: 'usr_b'
    };

    const prefix = prefixMap[entityType] || 'ent';
    const randomHex = crypto.randomBytes(6).toString('hex');
    return `${prefix}_${randomHex}`;
  }

  /**
   * Registers a unified entity identifier with data classification
   */
  public static registerEntity(
    entityType: EntityType,
    ownerId: string,
    dataClassification: DataClassification = 'CONFIDENTIAL'
  ): UnifiedEntityIdentifier {
    const canonical_id = this.generateCanonicalId(entityType);
    const now = new Date().toISOString();

    const entity: UnifiedEntityIdentifier = {
      entity_type: entityType,
      canonical_id,
      entity_version: 1,
      owner_id: ownerId,
      data_classification: dataClassification,
      created_at: now
    };

    this.registeredEntities.set(canonical_id, entity);
    return entity;
  }

  /**
   * Links nodes in the canonical operating graph
   */
  public static addGraphNode(
    canonicalId: string,
    entityType: EntityType,
    parentId: string | undefined,
    attributes: Record<string, any>,
    provenanceId: string
  ): OperatingGraphNode {
    const node: OperatingGraphNode = {
      canonical_id: canonicalId,
      entity_type: entityType,
      parent_id: parentId,
      children_ids: [],
      attributes,
      provenance_id: provenanceId
    };

    if (parentId && this.graphNodes.has(parentId)) {
      const parentNode = this.graphNodes.get(parentId)!;
      if (!parentNode.children_ids.includes(canonicalId)) {
        parentNode.children_ids.push(canonicalId);
        this.graphNodes.set(parentId, parentNode);
      }
    }

    this.graphNodes.set(canonicalId, node);
    return node;
  }

  public static getGraphNode(canonicalId: string): OperatingGraphNode | undefined {
    return this.graphNodes.get(canonicalId);
  }
}
