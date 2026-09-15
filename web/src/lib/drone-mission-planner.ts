import { supabase as supabaseAdmin } from './supabase';

export type DroneMissionType =
  | 'CROP_SURVEY'
  | 'NDVI_MULTISPECTRAL'
  | 'THERMAL_SURVEY'
  | 'PEST_SCOUTING'
  | 'IRRIGATION_INSPECTION';

export interface DroneMissionPlan {
  id: string;
  target_field_id: string;
  drone_id: string;
  operator_id: string;
  mission_type: DroneMissionType;
  boundary_polygon: Array<{ lat: number; lng: number }>;
  altitude_limit_m: number;
  time_window_start: string;
  time_window_end: string;
  approval_status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  flight_control_allowed: false; // Autonomous flight control is strictly forbidden
  created_at?: string;
}

export async function planDroneMission(plan: Omit<DroneMissionPlan, 'id' | 'approval_status' | 'flight_control_allowed' | 'created_at'>): Promise<DroneMissionPlan> {
  const payload: DroneMissionPlan = {
    ...plan,
    id: `mission_${Math.random().toString(36).substring(2, 10)}`,
    approval_status: 'PENDING_APPROVAL',
    flight_control_allowed: false,
    created_at: new Date().toISOString()
  };

  if (supabaseAdmin) {
    await supabaseAdmin.from('drone_missions').insert(payload);
  }

  return payload;
}
