import { supabase as supabaseAdmin } from './supabase';
import { TelemetryRecord } from './telemetry-ingestion-engine';

export type QualityAnomalyType = 'IMPOSSIBLE_VALUE' | 'SENSOR_DRIFT' | 'STALE_SENSOR' | 'SPIKE' | 'CLOCK_SKEW' | 'NONE';

export interface SensorQualityResult {
  id: string;
  telemetry_id: string;
  quality_status: 'NORMAL' | 'SUSPECT' | 'ANOMALOUS' | 'REJECTED';
  quality_score: number;
  anomaly_type: QualityAnomalyType;
  evidence: Record<string, unknown>;
  evaluated_at?: string;
}

export async function evaluateSensorQuality(telemetry: TelemetryRecord): Promise<SensorQualityResult> {
  let status: SensorQualityResult['quality_status'] = 'NORMAL';
  let score = 1.0;
  let anomaly: QualityAnomalyType = 'NONE';
  const evidence: Record<string, unknown> = {};

  // 1. Impossible Value Checks
  if (telemetry.measurement_type === 'soil_moisture' && (telemetry.value < 0 || telemetry.value > 100)) {
    status = 'REJECTED';
    score = 0.0;
    anomaly = 'IMPOSSIBLE_VALUE';
    evidence.reason = 'Soil moisture percentage out of range [0, 100]';
  } else if (telemetry.measurement_type === 'temperature' && (telemetry.value < -40 || telemetry.value > 70)) {
    status = 'REJECTED';
    score = 0.0;
    anomaly = 'IMPOSSIBLE_VALUE';
    evidence.reason = 'Air temperature out of physical environmental range [-40°C, 70°C]';
  }

  // 2. Sudden Spike Detection
  if (telemetry.measurement_type === 'soil_moisture' && telemetry.value > 95) {
    status = 'ANOMALOUS';
    score = 0.4;
    anomaly = 'SPIKE';
    evidence.reason = 'Sudden moisture reading spike detected above saturation threshold';
  }

  const result: SensorQualityResult = {
    id: `qual_${Math.random().toString(36).substring(2, 10)}`,
    telemetry_id: telemetry.id,
    quality_status: status,
    quality_score: score,
    anomaly_type: anomaly,
    evidence,
    evaluated_at: new Date().toISOString()
  };

  if (supabaseAdmin) {
    await supabaseAdmin.from('telemetry_quality').insert(result);
  }

  return result;
}
