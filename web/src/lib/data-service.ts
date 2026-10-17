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
    // The canonical catalog is public.crops. Do not query a parallel crop_catalog table.
    const { data, error } = await supabase
      .from('crops')
      .select('id,name,category,created_at')
      .order('name');
    if (error) throw new Error(`Could not load the crop catalog: ${error.message}`);
    return (data ?? []).map((crop) => ({
      id: crop.id,
      name: crop.name,
      category: crop.category || 'Cereals',
      typical_duration_days: 120,
      season: 'Kharif',
    })) as CropCatalogItem[];
  },

  async getCultivations(farmId?: string, ownerId?: string): Promise<Cultivation[]> {
    if (!ownerId) return [];
    let query = supabase
      .from('farmer_cultivation_records')
      .select('*,crops(id,name,category)')
      .eq('farmer_id', ownerId)
      .order('created_at', { ascending: false });
    if (farmId) query = query.eq('farm_id', farmId);
    const { data, error } = await query;
    if (error) throw new Error(`Could not load cultivation records: ${error.message}`);
    return (data ?? []).map((row) => ({
      id: row.id,
      farm_id: row.farm_id,
      farmer_id: row.farmer_id,
      crop_id: row.crop_id,
      crop_name: row.crops?.name || 'Unknown crop',
      variety: row.variety || '',
      season: row.season || 'Kharif',
      sowing_date: row.sowing_date,
      expected_harvest_date: row.expected_harvest_date,
      area_acres: Number(row.area_acres || 0),
      expected_yield_kg: row.expected_yield_kg == null ? null : Number(row.expected_yield_kg),
      status: row.status || 'planned',
      created_at: row.created_at,
    })) as Cultivation[];
  },

  async createCultivation(cult: Partial<Cultivation> & { farmer_id: string }): Promise<Cultivation> {
    if (!cult.farm_id || !cult.crop_id) {
      throw new Error('Select a farm and crop before saving cultivation.');
    }
    const payload = {
      farmer_id: cult.farmer_id,
      farm_id: cult.farm_id,
      crop_id: cult.crop_id,
      variety: cult.variety?.trim() || null,
      season: cult.season || 'Kharif',
      sowing_date: cult.sowing_date || null,
      expected_harvest_date: cult.expected_harvest_date || null,
      area_acres: cult.area_acres ?? null,
      expected_yield_kg: cult.expected_yield_kg ?? null,
      status: cult.status || 'planned',
      notes: cult.agronomy_notes || null,
    };
    const { data, error } = await supabase
      .from('farmer_cultivation_records')
      .insert(payload)
      .select('*,crops(id,name,category)')
      .single();
    if (error) throw new Error(`Could not save cultivation: ${error.message}`);
    return {
      id: data.id,
      farm_id: data.farm_id,
      farmer_id: data.farmer_id,
      crop_id: data.crop_id,
      crop_name: data.crops?.name || 'Unknown crop',
      variety: data.variety || '',
      season: data.season || 'Kharif',
      sowing_date: data.sowing_date,
      expected_harvest_date: data.expected_harvest_date,
      area_acres: Number(data.area_acres || 0),
      expected_yield_kg: data.expected_yield_kg == null ? null : Number(data.expected_yield_kg),
      status: data.status || 'planned',
      created_at: data.created_at,
    } as Cultivation;
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

  async getLiveWeather(latitude: number, longitude: number) {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
    });

    const response = await fetch(`/api/v1/interoperability/weather?${params.toString()}`, {
      cache: 'no-store',
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        payload && typeof payload === 'object' && 'meta' in payload
          ? String((payload as { meta?: { message?: unknown } }).meta?.message || 'Live weather request failed.')
          : 'Live weather request failed.',
      );
    }

    return payload as {
      success: true;
      data: {
        latitude: number | null;
        longitude: number | null;
        timezone_offset_seconds?: number | null;
        location_name?: string | null;
        country?: string | null;
        condition?: string | null;
        description?: string | null;
        icon?: string | null;
        temperature_c?: number | null;
        feels_like_c?: number | null;
        min_temperature_c?: number | null;
        max_temperature_c?: number | null;
        humidity_pct?: number | null;
        pressure_hpa?: number | null;
        wind_speed_mps?: number | null;
        wind_direction_deg?: number | null;
        wind_gust_mps?: number | null;
        cloudiness_pct?: number | null;
        visibility_m?: number | null;
        rain_1h_mm?: number | null;
        snow_1h_mm?: number | null;
        observed_at_unix?: number | null;
        observed_at?: string | null;
        sunrise_unix?: number | null;
        sunset_unix?: number | null;
      };
      meta: {
        data_origin: string;
        provider: string;
        observed_at: string | null;
        freshness: string;
      };
    };
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
    if (!userId) return [];
    const { data, error } = await supabase
      .from('farmer_documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(`Could not load documents: ${error.message}`);
    return (data ?? []) as FarmerDocument[];
  },

  async uploadFarmerDocument(userId: string, file: File): Promise<string> {
    const allowedTypes = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);
    if (!allowedTypes.has(file.type)) {
      throw new Error('Choose a PDF, JPG, PNG, or WebP document.');
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Documents must be 10 MB or smaller.');
    }
    const safeName = file.name.normalize('NFKD').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120) || 'document';
    const objectPath = `${userId}/${crypto.randomUUID()}-${safeName}`;
    const { data, error } = await supabase.storage.from('farmer-documents').upload(objectPath, file, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false,
    });
    if (error) throw new Error(`Could not upload document file: ${error.message}`);
    return data.path;
  },

  async getFarmerDocumentDownloadUrl(objectPath: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from('farmer-documents')
      .createSignedUrl(objectPath, 60);
    if (error || !data?.signedUrl) {
      throw new Error(`Could not create a private document link: ${error?.message || 'No URL returned'}`);
    }
    return data.signedUrl;
  },

  async createDocument(doc: Partial<FarmerDocument>): Promise<FarmerDocument> {
    const { data, error } = await supabase
      .from('farmer_documents')
      .insert(doc)
      .select('*')
      .single();
    if (error) throw new Error(`Could not save document metadata: ${error.message}`);
    return data as FarmerDocument;
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
