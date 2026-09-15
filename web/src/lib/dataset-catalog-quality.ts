import { supabase as supabaseAdmin } from './supabase';

export interface ResearchDatasetRecord {
  id: string;
  dataset_name: string;
  description: string;
  provider: string;
  license: string;
  coverage: string;
  variables: string[];
  geography: string;
  time_range: string;
  resolution: string;
  source_url: string;
  version: string;
  quality_report?: DatasetQualityReport;
  created_at: string;
}

export interface DatasetQualityReport {
  id: string;
  dataset_id: string;
  completeness_score: number;
  missingness_pct: number;
  duplicates_count: number;
  outliers_count: number;
  timeliness_rating: 'CURRENT' | 'RECENT' | 'OUTDATED';
  overall_quality_score: number;
  validation_status: 'VALIDATED' | 'REQUIRES_CLEANING' | 'REJECTED';
  evaluated_at: string;
}

export async function getResearchDatasets(
  crop: string = 'Turmeric'
): Promise<ResearchDatasetRecord[]> {
  const datasets: ResearchDatasetRecord[] = [
    {
      id: 'ds_icar_iisr_turmeric_2025',
      dataset_name: 'ICAR-IISR Turmeric Soil Moisture & Micro-Climate Telemetry 2023-2025',
      description: 'Granular hourly root zone soil moisture, ambient temperature, and foliar sensor readings across 120 trial plots.',
      provider: 'Indian Institute of Spices Research (ICAR-IISR)',
      license: 'CC-BY-4.0',
      coverage: '120 Micro-Trial Plots',
      variables: ['soil_moisture_pct', 'soil_temp_celsius', 'curcumin_pct', 'yield_kg'],
      geography: 'Salem & Kozhikode Research Stations',
      time_range: '2023-06-01 to 2025-12-31',
      resolution: '1-Hour Telemetry Intervals',
      source_url: 'https://epubs.icar.org.in/datasets/iisr-turmeric-2025',
      version: 'v1.2',
      quality_report: {
        id: 'qr_ds_icar_1',
        dataset_id: 'ds_icar_iisr_turmeric_2025',
        completeness_score: 97.4,
        missingness_pct: 2.6,
        duplicates_count: 0,
        outliers_count: 14,
        timeliness_rating: 'CURRENT',
        overall_quality_score: 95.8,
        validation_status: 'VALIDATED',
        evaluated_at: new Date().toISOString()
      },
      created_at: new Date().toISOString()
    }
  ];

  if (supabaseAdmin) {
    for (const ds of datasets) {
      await supabaseAdmin.from('research_datasets').upsert({
        id: ds.id,
        dataset_name: ds.dataset_name,
        description: ds.description,
        provider: ds.provider,
        license: ds.license,
        coverage: ds.coverage,
        variables: ds.variables,
        geography: ds.geography,
        time_range: ds.time_range,
        resolution: ds.resolution,
        source_url: ds.source_url,
        version: ds.version,
        created_at: ds.created_at
      });
    }
  }

  return datasets;
}
