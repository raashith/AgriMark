/**
 * AgriMark Phase 10 - National Price Intelligence Engine
 * Maintains strict separation between raw price signals (Mandi, Farmer Ask, Buyer Offer, FPO Ask, AI Forecast).
 * Guarantees signals are never merged into an unexplained single average.
 */

import { MarketPriceObservation, ProvenanceMetadata } from './national-data-model';

export type PriceSignalType = 
  | 'OBSERVED_MANDI' 
  | 'FARMER_ASKING' 
  | 'BUYER_OFFER' 
  | 'FPO_ASKING' 
  | 'AI_FORECAST';

export interface PriceSignalInput {
  commodity_code: string;
  variant_code?: string;
  mandi_code?: string;
  district_code?: string;
  state_code?: string;
  price_signal_type: PriceSignalType;
  min_price: number;
  max_price: number;
  modal_price: number;
  arrival_quantity_mt?: number;
  observed_at: string;
  source: string;
  unit?: string;
}

export interface NationalPriceIntelligenceReport {
  commodity_code: string;
  geography: string;
  as_of_date: string;
  signals: Record<PriceSignalType, MarketPriceObservation | null>;
  price_dispersion_inr: number;
  highest_signal_type: PriceSignalType | null;
  lowest_signal_type: PriceSignalType | null;
  provenance_chain: ProvenanceMetadata[];
}

export class NationalPriceIntelligenceEngine {
  public static createPriceObservation(input: PriceSignalInput): MarketPriceObservation {
    const min_price = Math.max(0, input.min_price);
    const max_price = Math.max(min_price, input.max_price);
    const modal_price = Math.min(max_price, Math.max(min_price, input.modal_price));

    const provenance: ProvenanceMetadata = {
      source: input.source,
      retrieved_at: new Date().toISOString(),
      license: 'AGRIMARK_PRICE_INTELLIGENCE',
      coverage_start: input.observed_at.split('T')[0],
      coverage_end: input.observed_at.split('T')[0],
      geography: input.district_code || input.state_code || 'NATIONAL',
      unit: input.unit || 'INR_PER_QUINTAL',
      schema_version: 'v1.0',
      quality_score: 0.95,
      validation_status: 'VALIDATED',
      data_layer: 'CANONICAL'
    };

    return {
      id: `price-signal-${input.price_signal_type}-${input.commodity_code}-${Date.now()}`,
      commodity_code: input.commodity_code,
      variant_code: input.variant_code,
      mandi_code: input.mandi_code,
      district_code: input.district_code,
      state_code: input.state_code,
      price_signal_type: input.price_signal_type,
      min_price,
      max_price,
      modal_price,
      arrival_quantity_mt: input.arrival_quantity_mt || 0,
      observed_at: input.observed_at,
      provenance
    };
  }

  public static buildMultiSignalReport(
    commodityCode: string,
    geography: string,
    observations: MarketPriceObservation[]
  ): NationalPriceIntelligenceReport {
    const signals: Record<PriceSignalType, MarketPriceObservation | null> = {
      OBSERVED_MANDI: null,
      FARMER_ASKING: null,
      BUYER_OFFER: null,
      FPO_ASKING: null,
      AI_FORECAST: null
    };

    observations.forEach(obs => {
      signals[obs.price_signal_type] = obs;
    });

    const activeModals = Object.values(signals)
      .filter((s): s is MarketPriceObservation => s !== null)
      .map(s => ({ type: s.price_signal_type, modal: s.modal_price }));

    let highest_signal_type: PriceSignalType | null = null;
    let lowest_signal_type: PriceSignalType | null = null;
    let price_dispersion_inr = 0;

    if (activeModals.length > 0) {
      activeModals.sort((a, b) => a.modal - b.modal);
      lowest_signal_type = activeModals[0].type;
      highest_signal_type = activeModals[activeModals.length - 1].type;
      price_dispersion_inr = activeModals[activeModals.length - 1].modal - activeModals[0].modal;
    }

    const provenance_chain = Object.values(signals)
      .filter((s): s is MarketPriceObservation => s !== null)
      .map(s => s.provenance);

    return {
      commodity_code: commodityCode,
      geography,
      as_of_date: new Date().toISOString(),
      signals,
      price_dispersion_inr: Math.round(price_dispersion_inr * 100) / 100,
      highest_signal_type,
      lowest_signal_type,
      provenance_chain
    };
  }
}
