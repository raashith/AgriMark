export interface QueuedAction {
  id: string;
  action_type: string;
  payload: Record<string, any>;
  timestamp: string;
  status: 'PENDING' | 'SYNCED' | 'FAILED';
  retry_count: number;
}

export class OfflineSyncEngine {
  private static STORAGE_KEY = 'agrimark_offline_queue';
  private static LOW_BANDWIDTH_KEY = 'agrimark_low_bandwidth';

  static isOnline(): boolean {
    if (typeof window === 'undefined') return true;
    return navigator.onLine;
  }

  static isLowBandwidth(): boolean {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem(this.LOW_BANDWIDTH_KEY);
    if (stored !== null) return stored === 'true';
    
    // Auto-detect via Network Information API if available
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      if (connection.saveData || connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
        return true;
      }
    }
    return false;
  }

  static setLowBandwidthMode(enabled: boolean): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.LOW_BANDWIDTH_KEY, String(enabled));
    }
  }

  static getQueue(): QueuedAction[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to read offline queue from storage', e);
      return [];
    }
  }

  static queueAction(actionType: string, payload: Record<string, any>): QueuedAction {
    const action: QueuedAction = {
      id: `act-off-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      action_type: actionType,
      payload,
      timestamp: new Date().toISOString(),
      status: 'PENDING',
      retry_count: 0
    };

    const queue = this.getQueue();
    queue.push(action);

    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(queue));
    }

    return action;
  }

  static async syncPendingQueue(apiSyncFn: (action: QueuedAction) => Promise<boolean>): Promise<{ synced: number; failed: number }> {
    if (!this.isOnline()) {
      return { synced: 0, failed: 0 };
    }

    const queue = this.getQueue();
    const pending = queue.filter(item => item.status === 'PENDING' || item.status === 'FAILED');

    let synced = 0;
    let failed = 0;

    for (const item of pending) {
      try {
        const success = await apiSyncFn(item);
        if (success) {
          item.status = 'SYNCED';
          synced++;
        } else {
          item.status = 'FAILED';
          item.retry_count++;
          failed++;
        }
      } catch (err) {
        item.status = 'FAILED';
        item.retry_count++;
        failed++;
      }
    }

    // Save updated status
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(queue));
    }

    return { synced, failed };
  }

  static clearSynced(): void {
    if (typeof window === 'undefined') return;
    const queue = this.getQueue();
    const remaining = queue.filter(item => item.status !== 'SYNCED');
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(remaining));
  }
}
