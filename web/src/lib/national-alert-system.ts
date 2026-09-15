/**
 * AgriMark Phase 13 - National Alert System Engine
 * Dispatches targeted multi-category agricultural alerts (WEATHER, CROP_RISK, DISEASE, PRICE_MOVEMENT, DEMAND,
 * ORDERS, SHIPMENTS, FPO, FINANCIAL, POLICY, DATA_QUALITY) with priority levels and recommended actions.
 */

export type AlertCategory = 
  | 'WEATHER'
  | 'CROP_RISK'
  | 'DISEASE'
  | 'PRICE_MOVEMENT'
  | 'DEMAND'
  | 'ORDER'
  | 'SHIPMENT'
  | 'FPO'
  | 'FINANCIAL'
  | 'POLICY'
  | 'DATA_QUALITY';

export type AlertPriority = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface NationalAlert {
  alert_id: string;
  category: AlertCategory;
  priority: AlertPriority;
  title: string;
  reason: string;
  source: string;
  confidence: number;
  recommended_action: string;
  recipient_id: string;
  is_read: boolean;
  created_at: string;
}

export class NationalAlertSystem {
  private static alerts: Map<string, NationalAlert> = new Map();

  public static dispatchAlert(
    recipientId: string,
    category: AlertCategory,
    priority: AlertPriority,
    title: string,
    reason: string,
    source: string,
    recommendedAction: string,
    confidence: number = 0.90
  ): NationalAlert {
    const alertId = `alt_${Date.now()}`;
    const now = new Date().toISOString();

    const alert: NationalAlert = {
      alert_id: alertId,
      category,
      priority,
      title,
      reason,
      source,
      confidence,
      recommended_action: recommendedAction,
      recipient_id: recipientId,
      is_read: false,
      created_at: now
    };

    this.alerts.set(alertId, alert);
    return alert;
  }

  public static getAlertsForUser(recipientId: string): NationalAlert[] {
    return Array.from(this.alerts.values()).filter(a => a.recipient_id === recipientId);
  }
}
