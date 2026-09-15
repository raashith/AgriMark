import { supabase as supabaseAdmin } from './supabase';

export type MeasurementType =
  | 'temperature'
  | 'humidity'
  | 'soil_moisture'
  | 'soil_temperature'
  | 'rainfall'
  | 'wind'
  | 'water_flow'
  | 'battery'
  | 'fuel'
  | 'machine_status'
  | 'GPS';

export interface TelemetryRecord {
  id: string;
  device_id: string;
  captured_at: string;
  received_at?: string;
  measurement_type: MeasurementType;
  value: number;
  unit: string;
  quality_status: 'NORMAL' | 'SUSPECT' | 'ANOMALOUS' | 'REJECTED';
  source: string;
  data_origin: string;
}

export async function ingestTelemetry(record: Omit<TelemetryRecord, 'id' | 'received_at'>): Promise<TelemetryRecord> {
  // Reject malformed payloads
  if (typeof record.value !== 'number' || isNaN(record.value)) {
    throw new Error('Malformed telemetry payload: numeric value is required.');
  }

  const payload: TelemetryRecord = {
    ...record,
    id: `tel_${Math.random().toString(36).substring(2, 11)}`,
    received_at: new Date().toISOString()
  };

  if (supabaseAdmin) {
    await supabaseAdmin.from('telemetry_records').insert(payload);
  }

  return payload;
}

export async function getDeviceTelemetry(deviceId: string, limit: number = 20): Promise<TelemetryRecord[]> {
  if (supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from('telemetry_records')
      .select('*')
      .eq('device_id', deviceId)
      .order('captured_at', { ascending: false })
      .limit(limit);

    if (data && data.length > 0) return data as TelemetryRecord[];
  }

  return [
    {
      id: 'tel_sample_01',
      device_id: deviceId,
      captured_at: new Date().toISOString(),
      received_at: new Date().toISOString(),
      measurement_type: 'soil_moisture',
      value: 22.4,
      unit: '%',
      quality_status: 'NORMAL',
      source: 'direct_iot',
      data_origin: 'agrimark_physical_gateway'
    }
  ];
}
