import { supabase as supabaseAdmin } from './supabase';

export type AlertLifecycleStatus = 'CREATED' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED' | 'EXPIRED';
export type NationalAlertType =
  | 'weather' | 'climate' | 'crop_disease' | 'market' | 'food_security'
  | 'water' | 'logistics' | 'scheme_deadline' | 'device_failure' | 'ai_incident';

export interface NationalAlertRecord {
  id: string;
  alert_type: NationalAlertType;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: AlertLifecycleStatus;
  acknowledged_by?: string;
  resolved_at?: string;
  created_at: string;
}

export class NationalAlertSystem {
  static dispatchAlert(
    recipientId: string,
    alertType: string,
    severity: string,
    title: string,
    description: string,
    source?: string,
    actionItem?: string,
    confidence?: number
  ) {
    return {
      id: `ALT-DISP-${Date.now()}`,
      recipient_id: recipientId,
      alert_type: alertType.toLowerCase() as NationalAlertType,
      severity: severity as any,
      title,
      description,
      source: source || 'SYSTEM',
      action_item: actionItem,
      confidence: confidence || 1.0,
      status: 'CREATED' as AlertLifecycleStatus,
      created_at: new Date().toISOString()
    };
  }

  static async createAlert(alert: Omit<NationalAlertRecord, 'id' | 'status' | 'created_at'>): Promise<NationalAlertRecord> {
    const record: NationalAlertRecord = {
      ...alert,
      id: `ALT-NAT-${Date.now()}`,
      status: 'CREATED',
      created_at: new Date().toISOString(),
    };

    if (process.env.NODE_ENV !== 'test' && supabaseAdmin) {
      await supabaseAdmin.from('national_alerts').insert([record]);
    }

    return record;
  }

  static transitionAlertStatus(currentStatus: AlertLifecycleStatus, newStatus: AlertLifecycleStatus): AlertLifecycleStatus {
    const allowedTransitions: Record<AlertLifecycleStatus, AlertLifecycleStatus[]> = {
      'CREATED': ['ACKNOWLEDGED', 'EXPIRED'],
      'ACKNOWLEDGED': ['IN_PROGRESS', 'RESOLVED', 'EXPIRED'],
      'IN_PROGRESS': ['RESOLVED', 'EXPIRED'],
      'RESOLVED': [],
      'EXPIRED': []
    };

    if (allowedTransitions[currentStatus]?.includes(newStatus)) {
      return newStatus;
    }
    return currentStatus;
  }
}
