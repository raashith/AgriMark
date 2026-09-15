import {
  UserProfile,
  Farm,
  CropCatalogItem,
  Cultivation,
  FieldObservation,
  HarvestBatch,
  ProduceLot,
  Listing,
  MarketplaceOrder,
  RFQ,
  Offer,
  MarketPriceObservation,
  WeatherForecast,
  FinanceRecord,
  FarmTask,
  FarmerDocument,
  ColdStorage,
  LogisticsRequest,
  AiInteraction,
} from '@/types';
import { supabase } from './supabase';

export const dataService = {
  // Profiles
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

  // Farms
  async getFarms(ownerId?: string): Promise<Farm[]> {
    try {
      let query = supabase.from('farms').select('*');
      if (ownerId) query = query.eq('owner_id', ownerId);
      const { data, error } = await query;
      if (!error && data) return data as Farm[];
    } catch {}
    return [];
  },

  async createFarm(farm: Partial<Farm>): Promise<Farm | null> {
    try {
      const { data, error } = await supabase.from('farms').insert(farm).select('*').single();
      if (!error && data) return data as Farm;
    } catch {}
    return null;
  },

  // Crop Catalog & Cultivations
  async getCropCatalog(): Promise<CropCatalogItem[]> {
    try {
      const { data, error } = await supabase.from('crop_catalog').select('*');
      if (!error && data && data.length > 0) return data as CropCatalogItem[];
    } catch {}
    // Standard agricultural categories reference list
    return [
      { id: 'crop-paddy', name: 'Paddy (Rice)', category: 'Cereals', typical_duration_days: 120, season: 'Kharif', agronomy_tips: 'Major staple grain cultivation' },
      { id: 'crop-wheat', name: 'Wheat', category: 'Cereals', typical_duration_days: 110, season: 'Rabi', agronomy_tips: 'Rabi cereal crop' },
      { id: 'crop-turmeric', name: 'Turmeric', category: 'Spices', typical_duration_days: 240, season: 'Perennial', agronomy_tips: 'High value rhizome spice' },
      { id: 'crop-tomato', name: 'Tomato', category: 'Vegetables', typical_duration_days: 90, season: 'Zaid', agronomy_tips: 'Short-duration horticulture crop' },
      { id: 'crop-cotton', name: 'Cotton', category: 'Cash Crops', typical_duration_days: 160, season: 'Kharif', agronomy_tips: 'Commercial cash crop' },
      { id: 'crop-sugarcane', name: 'Sugarcane', category: 'Cash Crops', typical_duration_days: 360, season: 'Perennial', agronomy_tips: 'Perennial industrial cash crop' },
    ];
  },

  async getCultivations(farmId?: string, ownerId?: string): Promise<Cultivation[]> {
    try {
      let query = supabase.from('cultivations').select('*');
      if (farmId) query = query.eq('farm_id', farmId);
      if (ownerId) query = query.eq('farmer_id', ownerId);
      const { data, error } = await query;
      if (!error && data) return data as Cultivation[];
    } catch {}
    return [];
  },

  async createCultivation(cult: Partial<Cultivation>): Promise<Cultivation | null> {
    try {
      const { data, error } = await supabase.from('cultivations').insert(cult).select('*').single();
      if (!error && data) return data as Cultivation;
    } catch {}
    return null;
  },

  // Field Observations
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

  // Harvest & Produce Lots
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

  // Marketplace Listings
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
        if (filters?.sort === 'price_asc') {
          result.sort((a, b) => (a.price_per_kg || a.price_per_unit) - (b.price_per_kg || b.price_per_unit));
        } else if (filters?.sort === 'price_desc') {
          result.sort((a, b) => (b.price_per_kg || b.price_per_unit) - (a.price_per_kg || a.price_per_unit));
        }
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
    try {
      await supabase.from('listings').update({ status }).eq('id', id);
    } catch {}
  },

  // Orders
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
    try {
      await supabase.from('orders').update({ status }).eq('id', orderId);
    } catch {}
  },

  // RFQs & Offers
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

  // Market Prices & Weather
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

  // Finance, Tasks, Documents
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
      const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      await supabase.from('farm_tasks').update({ status: nextStatus }).eq('id', id);
    } catch {}
  },

  async getDocuments(userId?: string): Promise<FarmerDocument[]> {
    try {
      let query = supabase.from('farmer_documents').select('*');
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (!error && data) return data as FarmerDocument[];
    } catch {}
    return [];
  },

  async createDocument(doc: Partial<FarmerDocument>): Promise<FarmerDocument | null> {
    try {
      const { data, error } = await supabase.from('farmer_documents').insert(doc).select('*').single();
      if (!error && data) return data as FarmerDocument;
    } catch {}
    return null;
  },

  // Cold Storage & Logistics
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

  // Crop Passport Lookups
  async getPassportByCode(code: string): Promise<{ batch?: HarvestBatch; lot?: ProduceLot; farm?: Farm } | null> {
    try {
      const { data: batch } = await supabase.from('harvest_batches').select('*').eq('trace_code', code).maybeSingle();
      if (batch) return { batch: batch as HarvestBatch };
      const { data: lot } = await supabase.from('produce_lots').select('*').eq('trace_code', code).maybeSingle();
      if (lot) return { lot: lot as ProduceLot };
    } catch {}
    return null;
  },

  // AI Interactions
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
