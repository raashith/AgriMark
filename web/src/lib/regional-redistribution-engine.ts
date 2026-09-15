import { supabase as supabaseAdmin } from './supabase';

export interface RedistributionProposal {
  id: string;
  source_region: string;
  destination_region: string;
  commodity: string;
  surplus_quantity_mt: number;
  shortage_quantity_mt: number;
  recommended_transfer_mt: number;
  estimated_transport_vehicles: number; // 25-tonne heavy trucks
  storage_requirement_type: string;
  time_window_days: number;
  confidence: number;
  auto_execution_blocked: true; // Non-autonomous decision support
  status: 'PROPOSED' | 'APPROVED' | 'IN_TRANSIT' | 'COMPLETED';
}

export async function computeRegionalRedistribution(
  commodity: string = 'Turmeric',
  sourceRegion: string = 'Erode Cluster',
  destRegion: string = 'Salem North'
): Promise<RedistributionProposal> {
  const transferQuantity = 1250;
  const proposal: RedistributionProposal = {
    id: `redist_${Math.random().toString(36).substring(2, 10)}`,
    source_region: sourceRegion,
    destination_region: destRegion,
    commodity,
    surplus_quantity_mt: 4200,
    shortage_quantity_mt: 1800,
    recommended_transfer_mt: transferQuantity,
    estimated_transport_vehicles: Math.ceil(transferQuantity / 25),
    storage_requirement_type: 'VENTILATED_DRY_WAREHOUSE',
    time_window_days: 10,
    confidence: 0.94,
    auto_execution_blocked: true,
    status: 'PROPOSED'
  };

  if (supabaseAdmin) {
    await supabaseAdmin.from('regional_supply_gaps').insert({
      id: proposal.id,
      source_region: proposal.source_region,
      destination_region: proposal.destination_region,
      commodity: proposal.commodity,
      surplus_quantity_mt: proposal.surplus_quantity_mt,
      shortage_quantity_mt: proposal.shortage_quantity_mt,
      recommended_transfer_mt: proposal.recommended_transfer_mt,
      estimated_transport_vehicles: proposal.estimated_transport_vehicles,
      storage_requirement_type: proposal.storage_requirement_type,
      time_window_days: proposal.time_window_days,
      confidence: proposal.confidence,
      status: proposal.status
    });
  }

  return proposal;
}
