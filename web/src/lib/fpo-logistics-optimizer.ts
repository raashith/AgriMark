export interface FPOAggregationRecommendation {
  fpo_id: string;
  crop_type: string;
  target_quantity_kg: number;
  member_farmer_count: number;
  recommended_pickup_hub: string;
  optimal_delivery_window: { start: string; end: string };
  matched_buyers: Array<{ buyer_id: string; offer_price_per_kg: number }>;
  warehouse_capacity_utilization_pct: number;
  logistics_utilization_pct: number;
  estimated_cost_savings_pct: number;
  requires_fpo_approval: true;
}

export interface LogisticsRouteRecommendation {
  route_id: string;
  pickup_hubs: string[];
  destination_warehouse_id: string;
  recommended_route: string[];
  estimated_distance_km: number;
  estimated_duration_hours: number;
  vehicle_type: string;
  capacity_utilization_pct: number;
  cold_chain_required: boolean;
  risk_factors: string[];
  confidence: number;
}

export async function generateFPOAggregationPlan(fpoId: string, cropType: string): Promise<FPOAggregationRecommendation> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 2);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 3);

  return {
    fpo_id: fpoId,
    crop_type: cropType,
    target_quantity_kg: 25000,
    member_farmer_count: 34,
    recommended_pickup_hub: 'Erode Agri-Hub Center 4',
    optimal_delivery_window: {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    },
    matched_buyers: [
      { buyer_id: 'byr_spices_corp', offer_price_per_kg: 168.5 },
      { buyer_id: 'byr_chennai_organics', offer_price_per_kg: 165.0 }
    ],
    warehouse_capacity_utilization_pct: 78.5,
    logistics_utilization_pct: 92.0,
    estimated_cost_savings_pct: 14.2,
    requires_fpo_approval: true
  };
}

export async function optimizeLogisticsRoute(
  pickupLocations: string[],
  destinationWarehouse: string,
  requiresColdChain: boolean = false
): Promise<LogisticsRouteRecommendation> {
  return {
    route_id: `route_${Math.random().toString(36).substring(2, 10)}`,
    pickup_hubs: pickupLocations,
    destination_warehouse_id: destinationWarehouse,
    recommended_route: [...pickupLocations, 'NH-44 Corridor', destinationWarehouse],
    estimated_distance_km: 142.5,
    estimated_duration_hours: 3.8,
    vehicle_type: requiresColdChain ? 'Refrigerated 10T Truck' : 'Standard 10T Truck',
    capacity_utilization_pct: 88.4,
    cold_chain_required: requiresColdChain,
    risk_factors: ['Monsoon rain warning near Salem stretch'],
    confidence: 0.91
  };
}
