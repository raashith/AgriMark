import { supabase as supabaseAdmin } from './supabase';

export type PhysicalActionType =
  | 'IRRIGATE'
  | 'INSPECT'
  | 'SPRAY'
  | 'FERTILIZE'
  | 'HARVEST'
  | 'DELAY_HARVEST'
  | 'SCHEDULE_MACHINERY'
  | 'REQUEST_SERVICE';

export interface PhysicalRecommendation {
  id: string;
  field_id: string;
  action_type: PhysicalActionType;
  reason: string;
  evidence: Record<string, unknown>;
  confidence: number;
  expected_benefit: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  created_at?: string;
}

export async function generatePhysicalRecommendations(fieldId: string): Promise<PhysicalRecommendation[]> {
  const recs: PhysicalRecommendation[] = [
    {
      id: `rec_irr_${Math.random().toString(36).substring(2, 10)}`,
      field_id: fieldId,
      action_type: 'IRRIGATE',
      reason: 'Soil moisture dropped to 18.5% (below 22% threshold). High heat forecasted for tomorrow.',
      evidence: {
        current_moisture_pct: 18.5,
        target_moisture_pct: 28.0,
        suggested_duration_sec: 3600,
        suggested_water_liters: 12500
      },
      confidence: 0.94,
      expected_benefit: 4500, // Yield loss prevention value INR
      risk_level: 'LOW',
      status: 'OPEN',
      created_at: new Date().toISOString()
    },
    {
      id: `rec_insp_${Math.random().toString(36).substring(2, 10)}`,
      field_id: fieldId,
      action_type: 'INSPECT',
      reason: 'High humidity and temperature favor leaf spot fungus in turmeric.',
      evidence: {
        humidity_pct: 78,
        temp_celsius: 31.0,
        historical_fungal_risk: 'HIGH'
      },
      confidence: 0.88,
      expected_benefit: 3000,
      risk_level: 'LOW',
      status: 'OPEN',
      created_at: new Date().toISOString()
    }
  ];

  if (supabaseAdmin) {
    for (const r of recs) {
      await supabaseAdmin.from('physical_recommendations').upsert(r);
    }
  }

  return recs;
}
