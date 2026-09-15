/**
 * AgriMark Phase 13 - Farmer Action Center & Intelligence-to-Action Loop Engine
 * Manages farmer task queues, intelligence recommendation loops (weather, price, harvest),
 * and human decision gates (accept/reject recommendations).
 */

export type ActionPriority = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ActionStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'DISMISSED' | 'EXPIRED';

export interface ActionItem {
  action_id: string;
  owner_id: string;
  title: string;
  description: string;
  priority: ActionPriority;
  source: string;
  deadline?: string;
  status: ActionStatus;
  intelligence_context?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export class FarmerActionCenterEngine {
  private static actions: Map<string, ActionItem> = new Map();

  /**
   * Generates a new action item in the farmer queue from intelligence inputs
   */
  public static createActionItem(
    ownerId: string,
    title: string,
    description: string,
    priority: ActionPriority,
    source: string,
    intelligenceContext?: Record<string, any>,
    deadlineHours: number = 72
  ): ActionItem {
    const actionId = `act_${Date.now()}`;
    const now = new Date();
    const deadline = new Date(now.getTime() + deadlineHours * 3600000).toISOString();

    const item: ActionItem = {
      action_id: actionId,
      owner_id: ownerId,
      title,
      description,
      priority,
      source,
      deadline,
      status: 'OPEN',
      intelligence_context: intelligenceContext,
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };

    this.actions.set(actionId, item);
    return item;
  }

  /**
   * Intelligence-to-Action Loop: Triggers action recommendation from national weather hazard
   */
  public static triggerHeatStressIntelligenceLoop(
    farmerId: string,
    districtCode: string,
    heatStressScore: number
  ): ActionItem {
    return this.createActionItem(
      farmerId,
      `Heat Stress Risk Alert (${districtCode})`,
      `National weather forecast indicates severe heat stress index (${heatStressScore}). Recommended action: Increase irrigation frequency by 25% over the next 48 hours to prevent crop wilting.`,
      'HIGH',
      'NATIONAL_WEATHER_INTELLIGENCE_LOOP',
      { heat_stress_score: heatStressScore, district_code: districtCode },
      48
    );
  }

  /**
   * Updates action status when farmer accepts, completes, or dismisses
   */
  public static updateActionStatus(actionId: string, status: ActionStatus): ActionItem {
    const item = this.actions.get(actionId);
    if (!item) {
      throw new Error(`Action item '${actionId}' not found.`);
    }

    item.status = status;
    item.updated_at = new Date().toISOString();
    this.actions.set(actionId, item);
    return item;
  }

  public static getFarmerActions(ownerId: string): ActionItem[] {
    return Array.from(this.actions.values()).filter(a => a.owner_id === ownerId);
  }
}
