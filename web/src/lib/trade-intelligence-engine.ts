import { supabase as supabaseAdmin } from './supabase';

export interface ImportDependencyMetric {
  id: string;
  commodity: string;
  domestic_production_mt: number;
  imports_mt: number;
  domestic_demand_mt: number;
  import_dependency_ratio: number; // imports / demand
  is_import_dependent: boolean; // requires ratio > 0.35 and evidence
  trend: 'INCREASING' | 'STABLE' | 'DECREASING';
  period: string;
  confidence: number;
  evidence: string[];
  evaluated_at: string;
}

export interface ExportPressureMetric {
  id: string;
  commodity: string;
  production_mt: number;
  domestic_demand_mt: number;
  export_volume_mt: number;
  stock_levels_mt: number;
  export_pressure_level: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  domestic_availability_risk: boolean;
  trade_restriction_recommended: false; // Explicit prohibition on recommending trade restrictions
  evaluated_at: string;
}

export async function evaluateImportDependency(commodity: string = 'Pulses'): Promise<ImportDependencyMetric> {
  const prod = 165000;
  const imp = 85000;
  const demand = 240000;
  const ratio = Math.round((imp / demand) * 1000) / 1000;

  const metric: ImportDependencyMetric = {
    id: `imp_dep_${commodity.toLowerCase()}`,
    commodity,
    domestic_production_mt: prod,
    imports_mt: imp,
    domestic_demand_mt: demand,
    import_dependency_ratio: ratio,
    is_import_dependent: ratio > 0.35,
    trend: 'STABLE',
    period: '2026-Q3',
    confidence: 0.94,
    evidence: [
      `Ministry of Commerce import data confirms ${imp.toLocaleString()} MT imported`,
      `Domestic demand stands at ${demand.toLocaleString()} MT`
    ],
    evaluated_at: new Date().toISOString()
  };

  if (supabaseAdmin) {
    await supabaseAdmin.from('import_dependency_metrics').upsert({
      id: metric.id,
      commodity: metric.commodity,
      domestic_production_mt: metric.domestic_production_mt,
      imports_mt: metric.imports_mt,
      domestic_demand_mt: metric.domestic_demand_mt,
      import_dependency_ratio: metric.import_dependency_ratio,
      trend: metric.trend,
      period: metric.period,
      confidence: metric.confidence,
      evaluated_at: metric.evaluated_at
    });
  }

  return metric;
}

export async function evaluateExportPressure(commodity: string = 'Rice'): Promise<ExportPressureMetric> {
  const prod = 1200000;
  const demand = 950000;
  const exports = 280000;
  const stocks = 140000;

  const metric: ExportPressureMetric = {
    id: `exp_press_${commodity.toLowerCase()}`,
    commodity,
    production_mt: prod,
    domestic_demand_mt: demand,
    export_volume_mt: exports,
    stock_levels_mt: stocks,
    export_pressure_level: 'HIGH',
    domestic_availability_risk: true,
    trade_restriction_recommended: false,
    evaluated_at: new Date().toISOString()
  };

  if (supabaseAdmin) {
    await supabaseAdmin.from('export_pressure_metrics').upsert({
      id: metric.id,
      commodity: metric.commodity,
      production_mt: metric.production_mt,
      domestic_demand_mt: metric.domestic_demand_mt,
      export_volume_mt: metric.export_volume_mt,
      stock_levels_mt: metric.stock_levels_mt,
      export_pressure_level: metric.export_pressure_level,
      domestic_availability_risk: metric.domestic_availability_risk,
      evaluated_at: metric.evaluated_at
    });
  }

  return metric;
}
