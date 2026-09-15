import { supabase } from './supabase';

export type AuditAction =
  | 'USER_REGISTERED'
  | 'LOGIN_FAILED'
  | 'FARM_CREATED'
  | 'CROP_CULTIVATION_CREATED'
  | 'FIELD_OBSERVATION_LOGGED'
  | 'HARVEST_BATCH_RECORDED'
  | 'PRODUCE_LOT_CREATED'
  | 'LISTING_CREATED'
  | 'RFQ_SUBMITTED'
  | 'MARKETPLACE_ORDER_CREATED'
  | 'INVENTORY_RESERVED'
  | 'ORDER_STATUS_CHANGED'
  | 'DELIVERY_UPDATED'
  | 'AGRI_AI_INTERACTION'
  | 'MUTATION_FAILED';

export interface AuditEvent {
  userId?: string;
  action: AuditAction;
  details: string;
  metadata?: Record<string, any>;
}

export async function logAuditEvent(event: AuditEvent): Promise<void> {
  // Sanitize metadata to remove any passwords, tokens, or private secrets
  const sanitizedMeta = { ...event.metadata };
  delete sanitizedMeta.password;
  delete sanitizedMeta.token;
  delete sanitizedMeta.secret;

  try {
    await supabase.from('admin_audit_log').insert({
      user_id: event.userId || null,
      action: event.action,
      details: event.details,
      metadata: JSON.stringify(sanitizedMeta),
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[Audit Logger Warning] Failed to log audit event:', err);
  }
}
