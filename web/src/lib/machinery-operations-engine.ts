import { supabase as supabaseAdmin } from './supabase';

export interface FarmEquipment {
  id: string;
  farm_id: string;
  owner_id: string;
  equipment_type: 'tractor' | 'harvester' | 'sprayer' | 'planter' | 'implement';
  name: string;
  model: string;
  fuel_capacity_liters: number;
  total_hours: number;
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'REPAIR_NEEDED';
  last_serviced_at?: string;
}

export interface ServiceBooking {
  id: string;
  farmer_id: string;
  provider_id: string;
  service_type: string;
  target_field_id: string;
  scheduled_time: string;
  status: 'REQUESTED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  created_at?: string;
}

export async function registerEquipment(equipment: Omit<FarmEquipment, 'last_serviced_at'>): Promise<FarmEquipment> {
  const payload: FarmEquipment = {
    ...equipment,
    last_serviced_at: new Date().toISOString()
  };

  if (supabaseAdmin) {
    await supabaseAdmin.from('equipment').upsert(payload);
  }

  return payload;
}

export async function bookServiceRequest(request: Omit<ServiceBooking, 'id' | 'created_at' | 'status'>): Promise<ServiceBooking> {
  const payload: ServiceBooking = {
    ...request,
    id: `srv_req_${Math.random().toString(36).substring(2, 10)}`,
    status: 'REQUESTED',
    created_at: new Date().toISOString()
  };

  if (supabaseAdmin) {
    await supabaseAdmin.from('service_requests').insert(payload);
  }

  return payload;
}
