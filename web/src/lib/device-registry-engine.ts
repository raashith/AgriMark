import { supabase as supabaseAdmin } from './supabase';

export type DeviceType =
  | 'soil_sensor'
  | 'weather_station'
  | 'water_meter'
  | 'irrigation_controller'
  | 'drone'
  | 'tractor'
  | 'harvester'
  | 'cold_storage_controller'
  | 'camera'
  | 'gateway';

export interface PhysicalDevice {
  id: string;
  device_type: DeviceType;
  device_model: string;
  manufacturer: string;
  owner_id: string;
  farm_id?: string;
  location: string;
  firmware_version: string;
  connectivity_status: 'ONLINE' | 'OFFLINE' | 'QUARANTINED' | 'DEGRADED';
  last_seen: string;
  capabilities: string[];
  safety_class: 'LOW_RISK' | 'STANDARD' | 'CRITICAL_EQUIPMENT';
  created_at?: string;
}

export async function registerDevice(device: Omit<PhysicalDevice, 'created_at' | 'last_seen'>): Promise<PhysicalDevice> {
  const payload: PhysicalDevice = {
    ...device,
    last_seen: new Date().toISOString(),
    created_at: new Date().toISOString()
  };

  if (supabaseAdmin) {
    await supabaseAdmin.from('devices').upsert(payload);
    await supabaseAdmin.from('device_credentials').upsert({
      id: `cred_${payload.id}`,
      device_id: payload.id,
      credential_hash: `hash_${Math.random().toString(36).substring(2, 12)}`,
      certificate_status: 'VALID',
      last_authenticated: new Date().toISOString(),
      is_quarantined: false,
      is_revoked: false,
      rotated_at: new Date().toISOString()
    });
  }

  return payload;
}

export async function verifyDeviceAuthentication(deviceId: string): Promise<{ authenticated: boolean; quarantined: boolean; device?: PhysicalDevice }> {
  if (supabaseAdmin) {
    const { data: cred } = await supabaseAdmin
      .from('device_credentials')
      .select('*')
      .eq('device_id', deviceId)
      .single();

    if (cred && (cred.is_quarantined || cred.is_revoked || cred.certificate_status !== 'VALID')) {
      return { authenticated: false, quarantined: Boolean(cred.is_quarantined) };
    }

    const { data: dev } = await supabaseAdmin
      .from('devices')
      .select('*')
      .eq('id', deviceId)
      .single();

    if (dev) {
      return { authenticated: true, quarantined: false, device: dev as PhysicalDevice };
    }
  }

  return {
    authenticated: true,
    quarantined: false,
    device: {
      id: deviceId,
      device_type: 'soil_sensor',
      device_model: 'SoilMaster-V2',
      manufacturer: 'AgriTech Hardware Ltd',
      owner_id: 'usr_f_sample',
      location: 'Salem Field 2',
      firmware_version: '2.1.0',
      connectivity_status: 'ONLINE',
      last_seen: new Date().toISOString(),
      capabilities: ['soil_moisture', 'soil_temp', 'pH'],
      safety_class: 'STANDARD'
    }
  };
}

export async function quarantineDevice(deviceId: string, reason: string): Promise<boolean> {
  if (supabaseAdmin) {
    await supabaseAdmin
      .from('device_credentials')
      .update({ is_quarantined: true })
      .eq('device_id', deviceId);

    await supabaseAdmin
      .from('devices')
      .update({ connectivity_status: 'QUARANTINED' })
      .eq('id', deviceId);

    await supabaseAdmin.from('device_events').insert({
      id: `dev_evt_${Date.now()}`,
      device_id: deviceId,
      event_type: 'quarantined',
      payload: { reason, timestamp: new Date().toISOString() }
    });
  }
  return true;
}
