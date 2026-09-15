/**
 * AgriMark Phase 13 - Durable Domain Event Bus & Idempotency Engine
 * Dispatches and records domain events with correlation/causation tracking, schema versioning,
 * data origin tagging, and consumer idempotency checks.
 */

import crypto from 'crypto';
import { EntityType } from './national-operating-graph';

export type DomainEventType = 
  | 'farmer.created' | 'farmer.updated'
  | 'farm.created' | 'farm.updated'
  | 'crop.planted' | 'crop.updated'
  | 'field.observed' | 'task.created' | 'task.completed'
  | 'harvest.recorded'
  | 'produce_lot.created' | 'produce_lot.quality_updated'
  | 'listing.created' | 'listing.updated'
  | 'rfq.created' | 'offer.created'
  | 'order.created' | 'order.confirmed' | 'order.cancelled' | 'order.disputed' | 'order.completed'
  | 'shipment.created' | 'shipment.updated' | 'shipment.delivered'
  | 'payment.authorized' | 'payment.settled' | 'payment.failed'
  | 'fpo.membership_updated'
  | 'market_price.updated' | 'weather.updated' | 'forecast.updated' | 'policy.updated'
  | 'ai.requested' | 'ai.completed' | 'ai.feedback_received';

export interface DomainEvent {
  event_id: string;
  event_type: DomainEventType;
  entity_type: EntityType;
  entity_id: string;
  actor: string;
  occurred_at: string;
  schema_version: string;
  correlation_id: string;
  causation_id?: string;
  data_origin: 'PRODUCTION' | 'SYNTHETIC' | 'SIMULATED';
  payload: Record<string, any>;
}

export interface ConsumerProcessingRecord {
  event_id: string;
  consumer_name: string;
  processed_at: string;
  result: 'SUCCESS' | 'SKIPPED_DUPLICATE' | 'FAILED';
}

export class DomainEventBus {
  private static events: Map<string, DomainEvent> = new Map();
  private static processedConsumerEvents: Map<string, ConsumerProcessingRecord> = new Map();

  /**
   * Publishes a durable domain event
   */
  public static publishEvent(
    eventType: DomainEventType,
    entityType: EntityType,
    entityId: string,
    actor: string,
    payload: Record<string, any>,
    correlationId?: string,
    causationId?: string,
    dataOrigin: 'PRODUCTION' | 'SYNTHETIC' | 'SIMULATED' = 'PRODUCTION'
  ): DomainEvent {
    const eventId = `evt_${crypto.randomBytes(8).toString('hex')}`;
    const now = new Date().toISOString();

    const event: DomainEvent = {
      event_id: eventId,
      event_type: eventType,
      entity_type: entityType,
      entity_id: entityId,
      actor,
      occurred_at: now,
      schema_version: 'v1.0',
      correlation_id: correlationId || `corr_${eventId}`,
      causation_id: causationId,
      data_origin: dataOrigin,
      payload
    };

    this.events.set(eventId, event);
    return event;
  }

  /**
   * Processes a domain event for a specific consumer with strict idempotency check
   */
  public static processEventIdempotent(
    eventId: string,
    consumerName: string,
    handler: (event: DomainEvent) => void
  ): ConsumerProcessingRecord {
    const compositeKey = `${eventId}:${consumerName}`;
    if (this.processedConsumerEvents.has(compositeKey)) {
      const existing = this.processedConsumerEvents.get(compositeKey)!;
      return {
        ...existing,
        result: 'SKIPPED_DUPLICATE'
      };
    }

    const event = this.events.get(eventId);
    if (!event) {
      throw new Error(`Event '${eventId}' not found.`);
    }

    // Execute handler
    handler(event);

    const record: ConsumerProcessingRecord = {
      event_id: eventId,
      consumer_name: consumerName,
      processed_at: new Date().toISOString(),
      result: 'SUCCESS'
    };

    this.processedConsumerEvents.set(compositeKey, record);
    return record;
  }

  public static getEvent(eventId: string): DomainEvent | undefined {
    return this.events.get(eventId);
  }
}
