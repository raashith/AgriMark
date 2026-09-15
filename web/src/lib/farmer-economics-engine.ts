/**
 * AgriMark Phase 12 - Farmer Economic Ledger Engine
 * Computes net realization, gross margin, and ROI from explicit production, input, labor,
 * irrigation, transport, storage costs, platform fees, and sales revenues.
 * Shows full source attribution and explicit disclaimer that output represents internal economic models, not audited statements.
 */

export interface CostBreakdownInput {
  production_cost_inr: number;
  input_cost_inr: number;
  labor_cost_inr: number;
  irrigation_cost_inr: number;
  transport_cost_inr: number;
  storage_cost_inr: number;
  platform_fees_inr: number;
  sale_revenue_inr: number;
}

export interface FarmerEconomicSummary {
  farmer_id: string;
  crop_year: string;
  commodity_code: string;
  total_expenses_inr: number;
  sale_revenue_inr: number;
  net_realization_inr: number;
  gross_margin_percent: number;
  roi_percent: number;
  cost_breakdown: CostBreakdownInput;
  assumptions: string[];
  disclaimer: string;
}

export class FarmerEconomicsEngine {
  public static calculateLedger(
    farmerId: string,
    cropYear: string,
    commodityCode: string,
    input: CostBreakdownInput
  ): FarmerEconomicSummary {
    const total_expenses_inr = 
      Math.max(0, input.production_cost_inr) +
      Math.max(0, input.input_cost_inr) +
      Math.max(0, input.labor_cost_inr) +
      Math.max(0, input.irrigation_cost_inr) +
      Math.max(0, input.transport_cost_inr) +
      Math.max(0, input.storage_cost_inr) +
      Math.max(0, input.platform_fees_inr);

    const sale_revenue_inr = Math.max(0, input.sale_revenue_inr);
    const net_realization_inr = Math.round((sale_revenue_inr - total_expenses_inr) * 100) / 100;

    const gross_margin_percent = sale_revenue_inr > 0 
      ? Math.round(((sale_revenue_inr - total_expenses_inr) / sale_revenue_inr) * 10000) / 100 
      : 0;

    const roi_percent = total_expenses_inr > 0 
      ? Math.round(((sale_revenue_inr - total_expenses_inr) / total_expenses_inr) * 10000) / 100 
      : 0;

    return {
      farmer_id: farmerId,
      crop_year: cropYear,
      commodity_code: commodityCode,
      total_expenses_inr,
      sale_revenue_inr,
      net_realization_inr,
      gross_margin_percent,
      roi_percent,
      cost_breakdown: input,
      assumptions: [
        'Input costs calculated based on farmer logged receipts and local market rates.',
        'Labor costs include family labor opportunity valuation where logged.',
        'Platform fees represent 1% digital transaction settlement charge.'
      ],
      disclaimer: 'DISCLAIMER: This ledger is an internal economic decision-support model based on logged operational entries and does not constitute audited financial statements or tax documents.'
    };
  }
}
