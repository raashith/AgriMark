import { supabase as supabaseAdmin } from './supabase';

export interface FieldStateTwin {
  id: string;
  farm_id: string;
  field_id: string;
  crop_stage: string;
  soil_state: {
    moisture_pct: number;
    temperature_celsius: number;
    ph: number;
    npk_status: string;
  };
  water_state: {
    water_deficit_mm: number;
    irrigation_needed_liters: number;
  };
  weather_state: {
    temperature_celsius: number;
    humidity_pct: number;
    rainfall_24h_mm: number;
    rain_risk_pct: number;
  };
  risk_state: {
    pest_risk: 'LOW' | 'MEDIUM' | 'HIGH';
    drought_risk: 'LOW' | 'MEDIUM' | 'HIGH';
    heat_risk: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  confidence: number;
  updated_at?: string;
}

export async function computeFieldDigitalTwin(fieldId: string, farmId: string = 'farm_erode_01'): Promise<FieldStateTwin> {
  const twin: FieldStateTwin = {
    id: `twin_${fieldId.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    farm_id: farmId,
    field_id: fieldId,
    crop_stage: 'RHIZOME_BULKING',
    soil_state: {
      moisture_pct: 18.5,
      temperature_celsius: 28.2,
      ph: 6.8,
      npk_status: 'BALANCED'
    },
    water_state: {
      water_deficit_mm: 14.2,
      irrigation_needed_liters: 12500
    },
    weather_state: {
      temperature_celsius: 34.5,
      humidity_pct: 62,
      rainfall_24h_mm: 0,
      rain_risk_pct: 15
    },
    risk_state: {
      pest_risk: 'LOW',
      drought_risk: 'MEDIUM',
      heat_risk: 'MEDIUM'
    },
    confidence: 0.94,
    updated_at: new Date().toISOString()
  };

  if (supabaseAdmin) {
    await supabaseAdmin.from('field_states').upsert(twin);
  }

  return twin;
}
