/**
 * AgriMark Phase 11 - Canonical Agricultural Identity & Interoperability Mapping Engine
 * Manages stable non-sequential identifiers (never phone numbers) and canonical to external code translations
 * across commodity names, crop codes, unit systems, geographies, market identifiers, and quality grades.
 */

import crypto from 'crypto';

export type MappingType = 
  | 'COMMODITY' 
  | 'CROP' 
  | 'UNIT' 
  | 'GEOGRAPHY' 
  | 'MARKET' 
  | 'GRADE';

export interface CanonicalMappingRecord {
  id: string;
  mapping_type: MappingType;
  canonical_code: string;
  external_system: string;
  external_code: string;
  effective_from: string;
  effective_to?: string;
}

export class CanonicalMappingsEngine {
  private static mappings: CanonicalMappingRecord[] = [
    {
      id: 'map-01',
      mapping_type: 'COMMODITY',
      canonical_code: 'RICE_PADDY',
      external_system: 'AGMARKNET',
      external_code: 'Paddy(Dhan)(Common)',
      effective_from: '2020-01-01'
    },
    {
      id: 'map-02',
      mapping_type: 'COMMODITY',
      canonical_code: 'RICE_PADDY',
      external_system: 'ENAM',
      external_code: 'PADDY_RAW_COMMON',
      effective_from: '2020-01-01'
    },
    {
      id: 'map-03',
      mapping_type: 'UNIT',
      canonical_code: 'METRIC_TON',
      external_system: 'AGMARKNET',
      external_code: 'Quintal', // Requires conversion factor 10
      effective_from: '2020-01-01'
    },
    {
      id: 'map-04',
      mapping_type: 'GEOGRAPHY',
      canonical_code: 'THANJAVUR',
      external_system: 'LGD_GOV_IN', // Local Government Directory
      external_code: '603',
      effective_from: '2020-01-01'
    }
  ];

  /**
   * Generates a stable, globally unique non-sequential identity ID
   */
  public static generateStableIdentity(prefix: 'usr_f' | 'farm' | 'fpo' | 'crop' | 'lot' | 'mkt' | 'ship'): string {
    const randomHex = crypto.randomBytes(6).toString('hex');
    return `${prefix}_${randomHex}`;
  }

  /**
   * Translates external system code to internal canonical code
   */
  public static translateExternalToCanonical(
    mappingType: MappingType,
    externalSystem: string,
    externalCode: string
  ): string {
    const matched = this.mappings.find(m => 
      m.mapping_type === mappingType &&
      m.external_system.toUpperCase() === externalSystem.toUpperCase() &&
      m.external_code.toLowerCase() === externalCode.toLowerCase()
    );

    if (matched) {
      return matched.canonical_code;
    }

    // Fallback: return sanitized uppercase string as default canonical candidate
    return externalCode.toUpperCase().replace(/\s+/g, '_');
  }

  /**
   * Translates internal canonical code to external target system code
   */
  public static translateCanonicalToExternal(
    mappingType: MappingType,
    canonicalCode: string,
    targetSystem: string
  ): string {
    const matched = this.mappings.find(m => 
      m.mapping_type === mappingType &&
      m.canonical_code.toUpperCase() === canonicalCode.toUpperCase() &&
      m.external_system.toUpperCase() === targetSystem.toUpperCase()
    );

    if (matched) {
      return matched.external_code;
    }

    return canonicalCode;
  }

  /**
   * Adds a new mapping entry dynamically without application redeployment
   */
  public static addMapping(
    mappingType: MappingType,
    canonicalCode: string,
    externalSystem: string,
    externalCode: string
  ): CanonicalMappingRecord {
    const newRecord: CanonicalMappingRecord = {
      id: `map-${Date.now()}`,
      mapping_type: mappingType,
      canonical_code: canonicalCode,
      external_system: externalSystem,
      external_code: externalCode,
      effective_from: new Date().toISOString().split('T')[0]
    };

    this.mappings.push(newRecord);
    return newRecord;
  }
}
