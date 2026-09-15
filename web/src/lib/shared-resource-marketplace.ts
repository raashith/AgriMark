import { supabaseAdmin } from './supabase';

export interface SharedResource {
  id: string;
  provider_id: string;
  resource_type: 'machinery' | 'labor' | 'transport' | 'storage' | 'processing' | 'field_service' | 'irrigation';
  name: string;
  capacity: number;
  unit: string;
  rate_per_unit: number;
  location: string;
  availability_status: 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE';
  metadata?: Record<string, unknown>;
  created_at?: string;
}

export interface ResourceMatch {
  id: string;
  farmer_id: string;
  resource_id: string;
  match_score: number;
  status: 'MATCHED' | 'REQUESTED' | 'CONFIRMED' | 'REJECTED' | 'COMPLETED';
  requested_at: string;
}

export async function createResourceListing(resource: Omit<SharedResource, 'created_at'>): Promise<SharedResource> {
  const payload = {
    ...resource,
    created_at: new Date().toISOString()
  };

  if (supabaseAdmin) {
    await supabaseAdmin.from('resource_listings').upsert(payload);
  }

  return payload;
}

export async function matchResourcesForFarmer(
  farmerId: string,
  resourceType: SharedResource['resource_type'],
  location: string
): Promise<Array<{ resource: SharedResource; match_score: number }>> {
  const defaultResources: SharedResource[] = [
    {
      id: 'res_trac_01',
      provider_id: 'prov_agro_machinery_salem',
      resource_type: 'machinery',
      name: 'John Deere 5050D Tractor with Harvester Attachment',
      capacity: 1,
      unit: 'day',
      rate_per_unit: 2200,
      location: location || 'Salem East',
      availability_status: 'AVAILABLE',
      metadata: { fuel_included: false, operator_included: true }
    },
    {
      id: 'res_stor_02',
      provider_id: 'prov_erode_cold_chain',
      resource_type: 'storage',
      name: 'Temperature-Controlled Spice Storage Vault',
      capacity: 50,
      unit: 'ton',
      rate_per_unit: 150,
      location: location || 'Erode Hub',
      availability_status: 'AVAILABLE',
      metadata: { humidity_control: true, temp_celsius: 12 }
    }
  ];

  if (supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from('resource_listings')
      .select('*')
      .eq('resource_type', resourceType)
      .eq('availability_status', 'AVAILABLE')
      .limit(10);

    if (data && data.length > 0) {
      return data.map(r => ({ resource: r as SharedResource, match_score: 92 }));
    }
  }

  return defaultResources
    .filter(r => r.resource_type === resourceType)
    .map(resource => ({ resource, match_score: 94 }));
}
