import { supabase as supabaseAdmin } from './supabase';

export type DataClassification = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';

export class DataGovernanceEngine {
  static async logAccess(userId: string, classification: DataClassification, resource: string, action: string) {
    const logRecord = {
      id: `GOV-${Date.now()}`,
      user_id: userId,
      data_classification: classification,
      resource_accessed: resource,
      action,
      timestamp: new Date().toISOString(),
    };

    if (process.env.NODE_ENV !== 'test' && supabaseAdmin) {
      await supabaseAdmin.from('data_governance_access_logs').insert([logRecord]);
    }

    return logRecord;
  }
}
