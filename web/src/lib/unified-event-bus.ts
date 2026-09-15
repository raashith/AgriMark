import { supabase as supabaseAdmin } from './supabase';

export type UnifiedEventType =
  | 'farmer.created' | 'farm.updated' | 'crop.updated' | 'crop.harvested'
  | 'market.price_changed' | 'order.created' | 'order.fulfilled' | 'shipment.updated'
  | 'payment.created' | 'payment.settled' | 'scheme.changed' | 'policy.changed'
  | 'weather.alert' | 'water.alert' | 'climate.alert' | 'food_security.alert'
  | 'device.alert' | 'ai.recommendation' | 'ai.action_requested' | 'simulation.completed';

export interface UnifiedEvent {
  event_id: string;
  event_type: UnifiedEventType;
  timestamp: string;
  actor: string;
  source: string;
  entity: Record<string, any>;
  payload: Record<string, any>;
  correlation_id: string;
}

export class UnifiedEventBus {
  static async publish(event: Omit<UnifiedEvent, 'event_id' | 'timestamp'>): Promise<UnifiedEvent> {
    const fullEvent: UnifiedEvent = {
      ...event,
      event_id: `EVT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };

    if (process.env.NODE_ENV !== 'test' && supabaseAdmin) {
      await supabaseAdmin.from('unified_events_log').insert([{
        id: fullEvent.event_id,
        event_id: fullEvent.event_id,
        event_type: fullEvent.event_type,
        actor: fullEvent.actor,
        source: fullEvent.source,
        entity: fullEvent.entity,
        payload: fullEvent.payload,
        correlation_id: fullEvent.correlation_id,
        timestamp: fullEvent.timestamp,
      }]);
    }

    return fullEvent;
  }
}
