import { supabaseAdmin } from './supabase';

export interface Experiment {
  id: string;
  experiment_name: string;
  description: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'CONCLUDED';
  target_cohort: string;
  feature_flag_key: string;
  variants: string[];
}

export interface ExperimentExposure {
  id: string;
  experiment_id: string;
  user_id: string;
  variant: string;
  exposed_at: string;
}

export async function getExperimentVariant(experimentName: string, userId: string): Promise<string> {
  // Deterministic hashing for variant assignment
  let hash = 0;
  const str = `${experimentName}:${userId}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }

  const variant = Math.abs(hash) % 2 === 0 ? 'variant_a' : 'variant_b';

  if (supabaseAdmin) {
    const exposure: Omit<ExperimentExposure, 'id'> = {
      experiment_id: experimentName,
      user_id: userId,
      variant,
      exposed_at: new Date().toISOString()
    };
    await supabaseAdmin.from('experiment_exposures').insert({
      id: `exp_exp_${Math.random().toString(36).substring(2, 10)}`,
      ...exposure
    });
  }

  return variant;
}

export async function createExperiment(exp: Omit<Experiment, 'id'>): Promise<Experiment> {
  const payload: Experiment = {
    ...exp,
    id: `exp_${exp.experiment_name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
  };

  if (supabaseAdmin) {
    await supabaseAdmin.from('experiments').upsert({
      id: payload.id,
      experiment_name: payload.experiment_name,
      description: payload.description,
      status: payload.status,
      target_cohort: payload.target_cohort,
      feature_flag_key: payload.feature_flag_key
    });
  }

  return payload;
}
