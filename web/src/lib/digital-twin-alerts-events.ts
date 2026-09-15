import { supabase as supabaseAdmin } from './supabase';

export type DigitalTwinEventType =
  | 'crop_state_changed'
  | 'weather_changed'
  | 'water_changed'
  | 'inventory_changed'
  | 'market_changed'
  | 'logistics_disrupted'
  | 'policy_changed'
  | 'risk_changed';

export type DigitalTwinAlertCategory = 'OBSERVED' | 'FORECAST' | 'SIMULATED';

export interface DigitalTwinEvent {
  id: string;
  event_type: DigitalTwinEventType;
  entity_id: string;
  payload: Record<string, any>;
  event_timestamp: string;
  data_origin: 'LIVE_OPERATIONAL' | 'SIMULATION' | 'STAGING' | 'SYNTHETIC';
}

export interface DigitalTwinAlert {
  id: string;
  alert_category: DigitalTwinAlertCategory;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  entity_id: string;
  created_at: string;
}

export class DigitalTwinAlertsEventsEngine {
  static async publishEvent(event: Omit<DigitalTwinEvent, 'id' | 'event_timestamp'>): Promise<DigitalTwinEvent> {
    const record: DigitalTwinEvent = {
      ...event,
      id: `EVT-${Date.now()}`,
      event_timestamp: new Date().toISOString(),
    };

    // STABILITY INVARIANT: Simulation events MUST NEVER modify live operational tables
    if (record.data_origin === 'SIMULATION' || record.data_origin === 'SYNTHETIC') {
      // Isolate to digital_twin_events table only
      if (process.env.NODE_ENV !== 'test') {
        await supabaseAdmin.from('digital_twin_events').insert([record]);
      }
    }

    return record;
  }

  static createAlert(params: {
    category: DigitalTwinAlertCategory;
    title: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    entity_id: string;
  }): DigitalTwinAlert {
    return {
      id: `ALT-${Date.now()}`,
      alert_category: params.category,
      title: `[${params.category}] ${params.title}`,
      description: params.description,
      severity: params.severity,
      entity_id: params.entity_id,
      created_at: new Date().toISOString(),
    };
  }
}
