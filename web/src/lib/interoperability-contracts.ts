/**
 * AgriMark Phase 11 - Machine-Readable Agricultural Data Contracts
 * Defines versioned schemas and validator contracts for all 16 core entities:
 * Farmer, Farm, Crop, Cultivation, Harvest, Produce Lot, Listing, Order,
 * Shipment, FPO, Market Observation, Weather Observation, Production Statistic,
 * Forecast, Policy/Scheme, Food Security Indicator.
 */

export type EntityContractType = 
  | 'Farmer'
  | 'Farm'
  | 'Crop'
  | 'Cultivation'
  | 'Harvest'
  | 'ProduceLot'
  | 'Listing'
  | 'Order'
  | 'Shipment'
  | 'FPO'
  | 'MarketObservation'
  | 'WeatherObservation'
  | 'ProductionStatistic'
  | 'Forecast'
  | 'PolicyScheme'
  | 'FoodSecurityIndicator';

export interface DataContractHeader {
  schema_version: string;
  entity_version: string;
  source: string;
  producer: string;
  created_at: string;
  updated_at: string;
  geography: string;
  unit: string;
  provenance_id: string;
  data_quality: {
    score: number;
    validation_status: 'VALIDATED' | 'QUARANTINED' | 'RAW';
  };
  consent_scope?: 'PUBLIC' | 'COMMUNITY' | 'COMMERCIAL' | 'RESEARCH' | 'PRIVATE' | 'REGULATED';
}

export interface MachineReadableContract<T = any> {
  contract_type: EntityContractType;
  header: DataContractHeader;
  payload: T;
}

export class InteroperabilityContractEngine {
  public static readonly CURRENT_SCHEMA_VERSION = 'v1.0';

  /**
   * Wraps an entity payload into a standard machine-readable contract
   */
  public static createContract<T>(
    type: EntityContractType,
    payload: T,
    metadata: {
      source: string;
      producer: string;
      geography: string;
      unit: string;
      provenance_id: string;
      quality_score?: number;
      consent_scope?: DataContractHeader['consent_scope'];
    }
  ): MachineReadableContract<T> {
    const now = new Date().toISOString();

    return {
      contract_type: type,
      header: {
        schema_version: this.CURRENT_SCHEMA_VERSION,
        entity_version: '1.0.0',
        source: metadata.source,
        producer: metadata.producer,
        created_at: now,
        updated_at: now,
        geography: metadata.geography,
        unit: metadata.unit,
        provenance_id: metadata.provenance_id,
        data_quality: {
          score: metadata.quality_score ?? 0.95,
          validation_status: 'VALIDATED'
        },
        consent_scope: metadata.consent_scope ?? 'PUBLIC'
      },
      payload
    };
  }

  /**
   * Validates contract structure against standard header requirements
   */
  public static validateContract(contract: MachineReadableContract): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!contract.contract_type) errors.push('Missing contract_type.');
    if (!contract.header) errors.push('Missing contract header.');
    else {
      if (!contract.header.schema_version) errors.push('Header missing schema_version.');
      if (!contract.header.source) errors.push('Header missing source.');
      if (!contract.header.producer) errors.push('Header missing producer.');
      if (!contract.header.geography) errors.push('Header missing geography.');
      if (!contract.header.provenance_id) errors.push('Header missing provenance_id.');
    }
    if (!contract.payload) errors.push('Missing contract payload.');

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
