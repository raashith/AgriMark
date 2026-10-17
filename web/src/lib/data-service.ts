import {
  UserProfile, Farm, CropCatalogItem, Cultivation, FieldObservation, HarvestBatch,
  ProduceLot, Listing, MarketplaceOrder, RFQ, Offer, MarketPriceObservation,
  WeatherForecast, FinanceRecord, FarmTask, FarmerDocument, ColdStorage,
  LogisticsRequest, AiInteraction,
} from '@/types';
import { supabase } from './supabase';
import { api } from './api';

export const dataService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (!error && data) return data as UserProfile;
    } catch {}
    return null;
  },

  async updateProfile(profile: Partial<UserProfile> & { id: string }): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase.from('profiles').upsert(profile).select('*').single();
      if (!error && data) return data as UserProfile;
    } catch {}
    return null;
  },

  // Use the authenticated backend for farmer writes and reads.
  async getFarms(ownerId?: string): Promise<Farm[]> {
    if (!ownerId) return [];
    return api.getFarms(ownerId);
  },

  async createFarm(farm: Partial<Farm> & { owner_id: string }): Promise<Farm> {
    if (!farm.owner_id) throw new Error('Sign in before registering a farm.');
    const { owner_id, ...payload } = farm;
    const created = await api.createFarm(owner_id, payload);
    if (!created?.id) throw new Error('AgriMark did not confirm the farm was saved.');
    return created;
  },

  async getCropCatalog(): Promise<CropCatalogItem[]> {
    const response = await api.getCrops();
    return response.items.map((crop) => ({
      id: crop.id,
      name: crop.name,
      category: (crop.category || 'Cereals') as CropCatalogItem['category'],
      typical_duration_days: 120,
      season: 'Kharif',
    }));
  },

  async getCultivations(farmId?: string, ownerId?: string): Promise<Cultivation[]> {
    if (!ownerId) return [];
    const rows = await api.getFarmerCultivations(farmId);
    return rows.map((row) => ({
      ...row,
      crop_name: row.crop_name || 'Unknown crop',
      variety: row.variety || '',
      season: row.season || 'Kharif',
      area_acres: Number(row.area_acres || 0),
      expected_yield_kg: row.expected_yield_kg == null ? null : Number(row.expected_yield_kg),
      status: row.status || 'planned',
    })) as Cultivation[];
  },

  async createCultivation(cult: Partial<Cultivation> & { farmer_id: string }): Promise<Cultivation> {
    if (!cult.farm_id || !cult.crop_id) throw new Error('Select a farm and crop before saving cultivation.');
    const created = await api.createFarmerCultivation({
      farm_id: cult.farm_id,
      crop_id: cult.crop_id,
      variety: cult.variety?.trim() || null,
      season: cult.season || 'Kharif',
      sowing_date: cult.sowing_date || null,
      expected_harvest_date: cult.expected_harvest_date || null,
      area_acres: Number(cult.area_acres),
      expected_yield_kg: cult.expected_yield_kg ?? null,
      status: cult.status || 'planned',
      notes: cult.agronomy_notes || null,
      organic_practice: cult.organic_practice ?? false,
      budget_inr: cult.budget_inr,
      agronomy_notes: cult.agronomy_notes || null,
    });
    return {
      ...created,
      crop_name: created.crop_name || 'Unknown crop',
      variety: created.variety || '',
      season: created.season || 'Kharif',
      area_acres: Number(created.area_acres || 0),
      expected_yield_kg: created.expected_yield_kg == null ? null : Number(created.expected_yield_kg),
      status: created.status || 'planned',
    } as Cultivation;
  },

  async getFieldObservations(cultivationId?: string): Promise<FieldObservation[]> {
    try {
      let query = supabase.from('field_observations').select('*');
      if (cultivationId) query = query.eq('cultivation_id', cultivationId);
      const { data, error } = await query;
      if (!error && data) return data as FieldObservation[];
    } catch {}
    return [];
  },

  async createFieldObservation(obs: Partial<FieldObservation>): Promise<FieldObservation | null> {
    try {
      const { data, error } = await supabase.from('field_observations').insert(obs).select('*').single();
      if (!error && data) return data as FieldObservation;
    } catch {}
    return null;
  },

  async getHarvestBatches(farmerId?: string): Promise<HarvestBatch[]> {
    try {
      let query = supabase.from('harvest_batches').select('*');
      if (farmerId) query = query.eq('farmer_id', farmerId);
      const { data, error } = await query;
      if (!error && data) return data as HarvestBatch[];
    } catch {}
    return [];
  },

  async createHarvestBatch(batch: Partial<HarvestBatch>): Promise<HarvestBatch | null> {
    try {
      const { data, error } = await supabase.from('harvest_batches').insert(batch).select('*').single();
      if (!error && data) return data as HarvestBatch;
    } catch {}
    return null;
  },

  async getProduceLots(farmerId?: string): Promise<ProduceLot[]> {
    try {
      let query = supabase.from('produce_lots').select('*');
      if (farmerId) query = query.eq('farmer_id', farmerId);
      const { data, error } = await query;
      if (!error && data) return data as ProduceLot[];
    } catch {}
    return [];
  },

  async createProduceLot(lot: Partial<ProduceLot>): Promise<ProduceLot | null> {
    try {
      const { data, error } = await supabase.from('produce_lots').insert(lot).select('*').single();
      if (!error && data) return data as ProduceLot;
    } catch {}
    return null;
  },

  async getListings(filters?: { search?: string; category?: string; district?: string; minPrice?: number; maxPrice?: number; grade?: string; sort?: string; sellerId?: string }): Promise<Listing[]> {
    try {
      let query = supabase.from('listings').select('*').eq('status', 'active');
      if (filters?.sellerId) query = query.eq('seller_id', filters.sellerId);
      if (filters?.category && filters.category !== 'All') query = query.eq('crop_category', filters.category);
      if (filters?.district && filters.district !== 'All') query = query.eq('district', filters.district);
      if (filters?.grade && filters.grade !== 'All') query = query.eq('quality_grade', filters.grade);
      if (filters?.minPrice) query = query.gte('price_per_kg', filters.minPrice);
      if (filters?.maxPrice) query = query.lte('price_per_kg', filters.maxPrice);
      const { data, error } = await query;
      if (!error && data) {
        let result = data as Listing[];
        if (filters?.search) {
          const q = filters.search.toLowerCase();
          result = result.filter((l) => l.title.toLowerCase().includes(q) || (l.crop_name && l.crop_name.toLowerCase().includes(q)) || (l.location && l.location.toLowerCase().includes(q)));
        }
        if (filters?.sort === 'price_asc') result.sort((a, b) => (a.price_per_kg || a.price_per_unit) - (b.price_per_kg || b.price_per_unit));
        else if (filters?.sort === 'price_desc') result.sort((a, b) => (b.price_per_kg || b.price_per_unit) - (a.price_per_kg || a.price_per_unit));
        return result;
      }
    } catch {}
    return [];
  },

  async getListingById(id: string): Promise<Listing | null> {
    try {
      const { data, error } = await supabase.from('listings').select('*').eq('id', id).maybeSingle();
      if (!error && data) return data as Listing;
    } catch {}
    return null;
  },

  async createListing(listing: Partial<Listing>): Promise<Listing | null> {
    try {
      const { data, error } = await supabase.from('listings').insert(listing).select('*').single();
      if (!error && data) return data as Listing;
    } catch {}
    return null;
  },

  async updateListingStatus(id: string, status: Listing['status']): Promise<void> {
    try { await supabase.from('listings').update({ status }).eq('id', id); } catch {}
  },

  async getOrders(userId?: string, role?: string): Promise<MarketplaceOrder[]> {
    try {
      let query = supabase.from('orders').select('*');
      if (userId) {
        if (role === 'buyer') query = query.eq('buyer_id', userId);
        else if (role === 'farmer') query = query.eq('seller_id', userId);
      }
      const { data, error } = await query;
      if (!error && data) return data as MarketplaceOrder[];
    } catch {}
    return [];
  },

  async createOrder(order: Partial<MarketplaceOrder>): Promise<MarketplaceOrder | null> {
    try {
      const { data, error } = await supabase.from('orders').insert(order).select('*').single();
      if (!error && data) return data as MarketplaceOrder;
    } catch {}
    return null;
  },

  async updateOrderStatus(orderId: string, status: MarketplaceOrder['status']): Promise<void> {
    try { await supabase.from('orders').update({ status }).eq('id', orderId); } catch {}
  },

  async getRFQs(buyerId?: string): Promise<RFQ[]> {
    try {
      let query = supabase.from('rfqs').select('*');
      if (buyerId) query = query.eq('buyer_id', buyerId);
      const { data, error } = await query;
      if (!error && data) return data as RFQ[];
    } catch {}
    return [];
  },

  async createRFQ(rfq: Partial<RFQ>): Promise<RFQ | null> {
    try {
      const { data, error } = await supabase.from('rfqs').insert(rfq).select('*').single();
      if (!error && data) return data as RFQ;
    } catch {}
    return null;
  },

  async getOffers(rfqId?: string, sellerId?: string): Promise<Offer[]> {
    try {
      let query = supabase.from('offers').select('*');
      if (rfqId) query = query.eq('rfq_id', rfqId);
      if (sellerId) query = query.eq('seller_id', sellerId);
      const { data, error } = await query;
      if (!error && data) return data as Offer[];
    } catch {}
    return [];
  },

  async createOffer(offer: Partial<Offer>): Promise<Offer | null> {
    try {
      const { data, error } = await supabase.from('offers').insert(offer).select('*').single();
      if (!error && data) return data as Offer;
    } catch {}
    return null;
  },

  async getMarketPrices(commodity?: string, district?: string): Promise<MarketPriceObservation[]> {
    try {
      let query = supabase.from('market_prices').select('*');
      if (commodity) query = query.eq('commodity', commodity);
      if (district) query = query.eq('district', district);
      const { data, error } = await query;
      if (!error && data) return data as MarketPriceObservation[];
    } catch {}
    return [];
  },

  async getWeather(district?: string): Promise<WeatherForecast[]> {
    try {
      let query = supabase.from('weather_forecasts').select('*');
      if (district) query = query.eq('district', district);
      const { data, error } = await query;
      if (!error && data) return data as WeatherForecast[];
    } catch {}
    return [];
  },

  async getLiveWeather(latitude: number, longitude: number) {
    const params = new URLSearchParams({ latitude: String(latitude), longitude: String(longitude) });
    const response = await fetch(`/api/v1/interoperability/weather?${params.toString()}`, { cache: 'no-store' });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(payload && typeof payload === 'object' && 'meta' in payload
        ? String((payload as { meta?: { message?: unknown } }).meta?.message || 'Live weather request failed.')
        : 'Live weather request failed.');
    }
    return payload as { success: true; data: Record<string, unknown>; meta: { data_origin: string; provider: string; observed_at: string | null; freshness: string } };
  },

  async getFinance(userId?: string): Promise<FinanceRecord[]> {
    try {
      let query = supabase.from('finance_records').select('*');
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (!error && data) return data as FinanceRecord[];
    } catch {}
    return [];
  },

  async createFinanceRecord(record: Partial<FinanceRecord>): Promise<FinanceRecord | null> {
    try {
      const { data, error } = await supabase.from('finance_records').insert(record).select('*').single();
      if (!error && data) return data as FinanceRecord;
    } catch {}
    return null;
  },

  async getTasks(userId?: string): Promise<FarmTask[]> {
    try {
      let query = supabase.from('farm_tasks').select('*');
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (!error && data) return data as FarmTask[];
    } catch {}
    return [];
  },

  async createTask(task: Partial<FarmTask>): Promise<FarmTask | null> {
    try {
      const { data, error } = await supabase.from('farm_tasks').insert(task).select('*').single();
      if (!error && data) return data as FarmTask;
    } catch {}
    return null;
  },

  async toggleTaskStatus(id: string, currentStatus: string): Promise<void> {
    try {
      await supabase.from('farm_tasks').update({ status: currentStatus === 'completed' ? 'pending' : 'completed' }).eq('id', id);
    } catch {}
  },

  async getDocuments(userId?: string): Promise<FarmerDocument[]> {
    if (!userId) return [];
    return api.getFarmerDocuments();
  },

  async uploadFarmerDocument(userId: string, file: File, metadata: {
    doc_type: FarmerDocument['doc_type'];
    doc_number?: string;
    issuing_authority?: string;
    farm_id?: string | null;
    issue_date?: string;
    expiry_date?: string;
    description?: string;
  }): Promise<FarmerDocument> {
    if (!['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Choose a PDF, JPG, PNG, or WebP document.');
    if (file.size <= 0 || file.size > 10 * 1024 * 1024) throw new Error('Choose a non-empty document that is 10 MB or smaller.');
    return api.uploadFarmerDocument(file, metadata);
  },

  async getFarmerDocumentDownloadUrl(documentId: string): Promise<string> {
    return api.getFarmerDocumentDownloadUrl(documentId);
  },

  async getColdStorage(district?: string): Promise<ColdStorage[]> {
    try {
      let query = supabase.from('cold_storage').select('*');
      if (district) query = query.eq('district', district);
      const { data, error } = await query;
      if (!error && data) return data as ColdStorage[];
    } catch {}
    return [];
  },

  async getLogisticsRequests(userId?: string): Promise<LogisticsRequest[]> {
    try {
      let query = supabase.from('logistics_requests').select('*');
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (!error && data) return data as LogisticsRequest[];
    } catch {}
    return [];
  },

  async createLogisticsRequest(req: Partial<LogisticsRequest>): Promise<LogisticsRequest | null> {
    try {
      const { data, error } = await supabase.from('logistics_requests').insert(req).select('*').single();
      if (!error && data) return data as LogisticsRequest;
    } catch {}
    return null;
  },

  async getPassportByCode(code: string): Promise<{ batch?: HarvestBatch; lot?: ProduceLot; farm?: Farm } | null> {
    try {
      const { data: batch } = await supabase.from('harvest_batches').select('*').eq('trace_code', code).maybeSingle();
      if (batch) return { batch: batch as HarvestBatch };
      const { data: lot } = await supabase.from('produce_lots').select('*').eq('trace_code', code).maybeSingle();
      if (lot) return { lot: lot as ProduceLot };
    } catch {}
    return null;
  },

  async logAiInteraction(interaction: { query: string; response: string; context?: string; model?: string; userId?: string }): Promise<void> {
    try {
      await supabase.from('ai_interactions').insert({
        user_id: interaction.userId,
        query: interaction.query,
        response: interaction.response,
        context: interaction.context || 'general',
        model: interaction.model || 'gemini-3.6-flash',
        created_at: new Date().toISOString(),
      });
    } catch {}
  },

  async getAiLogs(userId?: string): Promise<AiInteraction[]> {
    try {
      let query = supabase.from('ai_interactions').select('*');
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (!error && data) return data as AiInteraction[];
    } catch {}
    return [];
  },
};
