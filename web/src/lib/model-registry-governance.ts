import { supabase as supabaseAdmin } from './supabase';

export interface ModelRecord {
  id: string;
  model_name: string;
  task_type: 'matching' | 'liquidity' | 'forecasting' | 'opportunity' | 'pricing';
  current_version: string;
  status: 'ACTIVE' | 'ARCHIVED';
  created_at?: string;
}

export interface ModelVersionRecord {
  id: string;
  model_id: string;
  version: string;
  dataset_version: string;
  features: string[];
  evaluation_metrics: Record<string, number>;
  approved_by: string;
  status: 'STAGING' | 'PRODUCTION' | 'ARCHIVED' | 'ROLLED_BACK';
  deployed_at?: string;
}

export async function registerModelVersion(modelName: string, versionData: Omit<ModelVersionRecord, 'id' | 'model_id'>): Promise<ModelVersionRecord> {
  const modelId = `mdl_${modelName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  const versionId = `${modelId}_v_${versionData.version.replace(/\./g, '_')}`;

  const modelEntry: ModelRecord = {
    id: modelId,
    model_name: modelName,
    task_type: 'matching',
    current_version: versionData.version,
    status: 'ACTIVE',
    created_at: new Date().toISOString()
  };

  const versionEntry: ModelVersionRecord = {
    ...versionData,
    id: versionId,
    model_id: modelId,
    deployed_at: new Date().toISOString()
  };

  if (supabaseAdmin) {
    await supabaseAdmin.from('model_registry').upsert(modelEntry);
    await supabaseAdmin.from('model_versions').upsert(versionEntry);
  }

  return versionEntry;
}

export async function rollbackModelVersion(modelName: string, targetVersion: string, reason: string): Promise<{ success: boolean; model_name: string; rolled_back_to: string }> {
  const modelId = `mdl_${modelName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

  if (supabaseAdmin) {
    await supabaseAdmin
      .from('model_registry')
      .update({ current_version: targetVersion })
      .eq('id', modelId);

    await supabaseAdmin
      .from('model_deployments')
      .insert({
        id: `dep_rb_${Date.now()}`,
        model_version_id: `${modelId}_v_${targetVersion.replace(/\./g, '_')}`,
        environment: 'production',
        status: 'ROLLED_BACK',
        deployed_at: new Date().toISOString(),
        rollback_reason: reason
      });
  }

  return {
    success: true,
    model_name: modelName,
    rolled_back_to: targetVersion
  };
}
