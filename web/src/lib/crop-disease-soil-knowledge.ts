import { supabase as supabaseAdmin } from './supabase';

export interface CropKnowledgeProfile {
  id: string;
  crop_name: string;
  soil_requirements: { texture: string; ph_range: string; organic_carbon_pct: string };
  climate_conditions: { temp_celsius_range: string; rainfall_mm_annual: string };
  water_requirements: { total_water_mm: string; critical_stages: string[] };
  nutrient_requirements: { npk_ratio_kg_per_ha: string };
  harvest_guidance: string;
  provenance_lineage: Array<{ source: string; doi?: string }>;
  updated_at: string;
}

export interface DiseaseKnowledgeProfile {
  id: string;
  disease_name: string;
  symptoms: string[];
  causes: string;
  host_crops: string[];
  diagnostic_uncertainty_note: string; // AI must distinguish observed vs predicted vs confirmed
  management_practices: string[];
  updated_at: string;
}

export interface SoilKnowledgeProfile {
  id: string;
  soil_type: string;
  characteristics: { drainage: string; water_retention: string };
  suitable_crops: string[];
  lab_testing_disclaimer: string; // Does not replace lab soil testing
  updated_at: string;
}

export async function getCropKnowledgeProfile(cropName: string = 'Turmeric'): Promise<CropKnowledgeProfile> {
  const profile: CropKnowledgeProfile = {
    id: `crop_prof_${cropName.toLowerCase()}`,
    crop_name: cropName,
    soil_requirements: {
      texture: 'Well-drained red sandy loam or clay loam',
      ph_range: '6.0 - 7.5',
      organic_carbon_pct: '> 0.80%'
    },
    climate_conditions: {
      temp_celsius_range: '20°C - 35°C',
      rainfall_mm_annual: '1500 mm - 2250 mm'
    },
    water_requirements: {
      total_water_mm: '1200 - 1500 mm',
      critical_stages: ['Sprouting', 'Rhizome Initiation', 'Rhizome Bulking']
    },
    nutrient_requirements: {
      npk_ratio_kg_per_ha: '60:50:120 N:P2O5:K2O'
    },
    harvest_guidance: 'Harvest 8-9 months after planting when lower leaves turn yellow and dry.',
    provenance_lineage: [
      { source: 'ICAR-IISR Turmeric Production Package of Practices 2025', doi: '10.56093/ijas.v95i6.148201' }
    ],
    updated_at: new Date().toISOString()
  };

  if (supabaseAdmin) {
    await supabaseAdmin.from('crop_knowledge_profiles').upsert({
      id: profile.id,
      crop_name: profile.crop_name,
      soil_requirements: profile.soil_requirements,
      climate_conditions: profile.climate_conditions,
      water_requirements: profile.water_requirements,
      nutrient_requirements: profile.nutrient_requirements,
      harvest_guidance: profile.harvest_guidance,
      provenance_lineage: profile.provenance_lineage,
      updated_at: profile.updated_at
    });
  }

  return profile;
}

export async function getDiseaseKnowledgeProfile(diseaseName: string = 'Rhizome Rot'): Promise<DiseaseKnowledgeProfile> {
  const profile: DiseaseKnowledgeProfile = {
    id: `disease_prof_${diseaseName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    disease_name: diseaseName,
    symptoms: [
      'OBSERVED: Foliar yellowing starting from lower leaf margins',
      'OBSERVED: Water-soaked soft rot lesions at collar region of pseudostem'
    ],
    causes: 'Pythium aphanidermatum / Pythium myriotylum soil-borne fungal pathogens',
    host_crops: ['Turmeric', 'Ginger'],
    diagnostic_uncertainty_note: 'DIAGNOSTIC NOTE: Symptom matching provides a PREDICTED disease classification. Confirmed diagnosis requires laboratory culturing or PCR test.',
    management_practices: [
      'Soil drenching with Trichoderma harzianum bio-fungicide at 2.5 kg/ha',
      'Improve field drainage to prevent waterlogging during monsoon'
    ],
    updated_at: new Date().toISOString()
  };

  if (supabaseAdmin) {
    await supabaseAdmin.from('disease_knowledge_profiles').upsert({
      id: profile.id,
      disease_name: profile.disease_name,
      symptoms: profile.symptoms,
      causes: profile.causes,
      host_crops: profile.host_crops,
      diagnostic_uncertainty_note: profile.diagnostic_uncertainty_note,
      management_practices: profile.management_practices,
      updated_at: profile.updated_at
    });
  }

  return profile;
}

export async function getSoilKnowledgeProfile(soilType: string = 'Red Sandy Loam'): Promise<SoilKnowledgeProfile> {
  const profile: SoilKnowledgeProfile = {
    id: `soil_prof_${soilType.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    soil_type: soilType,
    characteristics: {
      drainage: 'Good to moderate drainage',
      water_retention: 'Moderate cation exchange capacity'
    },
    suitable_crops: ['Turmeric', 'Tapioca', 'Groundnut', 'Pulses'],
    lab_testing_disclaimer: 'Knowledge profiles offer general soil context and do NOT replace accredited laboratory soil testing.',
    updated_at: new Date().toISOString()
  };

  return profile;
}
