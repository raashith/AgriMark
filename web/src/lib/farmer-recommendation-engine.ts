export interface FarmerAdvisoryRecommendation {
  recommendation_id: string;
  farmer_id: string;
  category: 'HARVEST_TIMING' | 'MARKET_SELECTION' | 'STORAGE_DECISION' | 'BUYER_MATCH' | 'URGENT_TASK';
  title: string;
  description: string;
  suggested_action: string;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number;
  reasoning_factors: string[];
  is_advisory_only: true;
  created_at: string;
}

export async function generateFarmerRecommendations(farmerId: string): Promise<FarmerAdvisoryRecommendation[]> {
  return [
    {
      recommendation_id: `rec_hrv_${Math.random().toString(36).substring(2, 10)}`,
      farmer_id: farmerId,
      category: 'HARVEST_TIMING',
      title: 'Optimal Harvest Window Reached for Field 2 Turmeric',
      description: 'Soil moisture and rhizome maturity indicators show 94% optimal quality if harvested within 5 days.',
      suggested_action: 'Schedule labor and harvest dry crops before rain forecast on Sept 20.',
      urgency: 'HIGH',
      confidence: 0.92,
      reasoning_factors: ['Soil moisture levels at 18%', 'Dry weather window for next 4 days', 'Market demand high'],
      is_advisory_only: true,
      created_at: new Date().toISOString()
    },
    {
      recommendation_id: `rec_mkt_${Math.random().toString(36).substring(2, 10)}`,
      farmer_id: farmerId,
      category: 'MARKET_SELECTION',
      title: 'Consider Direct Sale via Erode FPO Hub',
      description: 'Erode FPO offers bulk buyer aggregation saving 12% in transport fees compared to individual mandi transport.',
      suggested_action: 'View Erode FPO aggregated buying order offer.',
      urgency: 'MEDIUM',
      confidence: 0.88,
      reasoning_factors: ['FPO aggregation order open', 'FPO pickup vehicle available in your village'],
      is_advisory_only: true,
      created_at: new Date().toISOString()
    }
  ];
}
