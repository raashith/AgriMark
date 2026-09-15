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
import {
  SEED_PROFILES,
  SEED_FARMS,
  SEED_CROP_CATALOG,
  SEED_CULTIVATIONS,
  SEED_OBSERVATIONS,
  SEED_HARVEST_BATCHES,
  SEED_PRODUCE_LOTS,
  SEED_LISTINGS,
  SEED_ORDERS,
  SEED_RFQS,
  SEED_OFFERS,
  SEED_MARKET_PRICES,
  SEED_WEATHER,
  SEED_FINANCE,
  SEED_TASKS,
  SEED_DOCUMENTS,
  SEED_COLD_STORAGE,
  SEED_LOGISTICS,
} from './seed-data';
import { supabase } from './supabase';

function getStorage<T>(key: string, seed: T[]): T[] {
  if (typeof window === 'undefined') return seed;
  try {
    const raw = localStorage.getItem(`agrimark_${key}`);
    if (!raw) {
      localStorage.setItem(`agrimark_${key}`, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw);
  } catch {
    return seed;
  }
}

function setStorage<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`agrimark_${key}`, JSON.stringify(data));
  } catch {}
}

export const dataService = {
  // Profiles
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (data) return data as UserProfile;
    } catch {}
    const list = getStorage<UserProfile>('profiles', SEED_PROFILES);
    return list.find((p) => p.id === userId) || list[0];
  },

  async updateProfile(profile: Partial<UserProfile> & { id: string }): Promise<UserProfile> {
    try {
      const { data, error } = await supabase.from('profiles').upsert(profile).select('*').single();
      if (!error && data) return data as UserProfile;
    } catch {}
    const list = getStorage<UserProfile>('profiles', SEED_PROFILES);
    const idx = list.findIndex((p) => p.id === profile.id);
    const updated = idx >= 0 ? { ...list[idx], ...profile } : ({ ...profile, role: profile.role || 'farmer' } as UserProfile);
    if (idx >= 0) list[idx] = updated;
    else list.unshift(updated);
    setStorage('profiles', list);
    return updated;
  },

  // Farms
  async getFarms(ownerId?: string): Promise<Farm[]> {
    try {
      let query = supabase.from('farms').select('*');
      if (ownerId) query = query.eq('owner_id', ownerId);
      const { data } = await query;
      if (data && data.length > 0) return data as Farm[];
    } catch {}
    const farms = getStorage<Farm>('farms', SEED_FARMS);
    if (ownerId) return farms.filter((f) => f.owner_id === ownerId || !f.owner_id);
    return farms;
  },

  async createFarm(farm: Partial<Farm>): Promise<Farm> {
    const newFarm: Farm = {
      id: `farm-${Date.now()}`,
      created_at: new Date().toISOString(),
      name: farm.name || 'New Farm',
      village: farm.village || 'Village',
      district: farm.district || 'Thanjavur',
      state: farm.state || 'Tamil Nadu',
      location: farm.location || `${farm.district || 'Thanjavur'}, ${farm.state || 'Tamil Nadu'}`,
      area_acres: farm.area_acres || 3.0,
      soil_type: farm.soil_type || 'Red Sandy Loam',
      irrigation_source: farm.irrigation_source || 'Borewell',
      water_source: farm.water_source || 'Submersible Well',
      electricity_available: farm.electricity_available ?? true,
      tenancy_type: farm.tenancy_type || 'owned',
      infrastructure: farm.infrastructure || ['Borewell Pump'],
      ...farm,
    };
    try {
      const { data } = await supabase.from('farms').insert(newFarm).select('*').single();
      if (data) return data as Farm;
    } catch {}
    const list = getStorage<Farm>('farms', SEED_FARMS);
    list.unshift(newFarm);
    setStorage('farms', list);
    return newFarm;
  },

  // Crop Catalog & Cultivations
  async getCropCatalog(): Promise<CropCatalogItem[]> {
    return SEED_CROP_CATALOG;
  },

  async getCultivations(farmId?: string): Promise<Cultivation[]> {
    try {
      let query = supabase.from('cultivations').select('*');
      if (farmId) query = query.eq('farm_id', farmId);
      const { data } = await query;
      if (data && data.length > 0) return data as Cultivation[];
    } catch {}
    const list = getStorage<Cultivation>('cultivations', SEED_CULTIVATIONS);
    if (farmId) return list.filter((c) => c.farm_id === farmId);
    return list;
  },

  async createCultivation(cult: Partial<Cultivation>): Promise<Cultivation> {
    const newCult: Cultivation = {
      id: `cultivation-${Date.now()}`,
      farm_id: cult.farm_id || 'farm-01',
      crop_id: cult.crop_id || 'crop-paddy',
      crop_name: cult.crop_name || 'Paddy',
      variety: cult.variety || 'Standard Variety',
      season: cult.season || 'Kharif',
      sowing_date: cult.sowing_date || new Date().toISOString().split('T')[0],
      expected_harvest_date: cult.expected_harvest_date || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      area_acres: cult.area_acres || 2.5,
      expected_yield_kg: cult.expected_yield_kg || 5000,
      status: 'active',
      organic_practice: cult.organic_practice ?? false,
      seed_variety: cult.seed_variety || 'Certified Variety',
      agronomy_notes: cult.agronomy_notes || 'Regular care',
      budget_inr: cult.budget_inr || 50000,
      created_at: new Date().toISOString(),
      ...cult,
    };
    try {
      const { data } = await supabase.from('cultivations').insert(newCult).select('*').single();
      if (data) return data as Cultivation;
    } catch {}
    const list = getStorage<Cultivation>('cultivations', SEED_CULTIVATIONS);
    list.unshift(newCult);
    setStorage('cultivations', list);
    return newCult;
  },

  // Field Observations
  async getFieldObservations(cultivationId?: string): Promise<FieldObservation[]> {
    const list = getStorage<FieldObservation>('observations', SEED_OBSERVATIONS);
    if (cultivationId) return list.filter((o) => o.cultivation_id === cultivationId);
    return list;
  },

  async createFieldObservation(obs: Partial<FieldObservation>): Promise<FieldObservation> {
    const newObs: FieldObservation = {
      id: `obs-${Date.now()}`,
      cultivation_id: obs.cultivation_id || 'cultivation-01',
      farm_id: obs.farm_id || 'farm-01',
      crop_stage: obs.crop_stage || 'Vegetative Stage',
      plant_health_score: obs.plant_health_score || 8,
      pest_pressure: obs.pest_pressure || 'low',
      disease_pressure: obs.disease_pressure || 'none',
      weed_pressure: obs.weed_pressure || 'low',
      soil_moisture_pct: obs.soil_moisture_pct || 65,
      notes: obs.notes || 'Routine observation.',
      observed_at: new Date().toISOString(),
      ...obs,
    };
    const list = getStorage<FieldObservation>('observations', SEED_OBSERVATIONS);
    list.unshift(newObs);
    setStorage('observations', list);
    return newObs;
  },

  // Harvest & Produce Lots
  async getHarvestBatches(): Promise<HarvestBatch[]> {
    return getStorage<HarvestBatch>('harvest_batches', SEED_HARVEST_BATCHES);
  },

  async createHarvestBatch(batch: Partial<HarvestBatch>): Promise<HarvestBatch> {
    const traceCode = `PASSPORT-${(batch.quality_grade || 'A').replace(/\s+/g, '')}-${Date.now().toString().slice(-6)}`;
    const newBatch: HarvestBatch = {
      id: `harvest-${Date.now()}`,
      cultivation_id: batch.cultivation_id || 'cultivation-01',
      harvest_date: batch.harvest_date || new Date().toISOString().split('T')[0],
      total_quantity_kg: batch.total_quantity_kg || 1000,
      quality_grade: batch.quality_grade || 'Grade A',
      moisture_pct: batch.moisture_pct || 12.0,
      rejection_pct: batch.rejection_pct || 1.0,
      packaging_type: batch.packaging_type || '50kg Bags',
      storage_requirement: batch.storage_requirement || 'Dry Storage',
      trace_code: traceCode,
      created_at: new Date().toISOString(),
      ...batch,
    };
    const batches = getStorage<HarvestBatch>('harvest_batches', SEED_HARVEST_BATCHES);
    batches.unshift(newBatch);
    setStorage('harvest_batches', batches);

    // Auto-create Produce Lot
    const newLot: ProduceLot = {
      id: `lot-${Date.now()}`,
      harvest_batch_id: newBatch.id,
      cultivation_id: newBatch.cultivation_id,
      crop_id: 'crop-paddy',
      crop_name: 'Harvested Crop',
      quantity: newBatch.total_quantity_kg,
      quantity_kg: newBatch.total_quantity_kg,
      unit: 'kg',
      quality_grade: newBatch.quality_grade,
      available_quantity: newBatch.total_quantity_kg,
      harvest_date: newBatch.harvest_date,
      storage_location: 'Farm Shed',
      trace_code: traceCode,
      is_listed: false,
      status: 'available',
      created_at: new Date().toISOString(),
    };
    const lots = getStorage<ProduceLot>('produce_lots', SEED_PRODUCE_LOTS);
    lots.unshift(newLot);
    setStorage('produce_lots', lots);

    return newBatch;
  },

  async getProduceLots(): Promise<ProduceLot[]> {
    return getStorage<ProduceLot>('produce_lots', SEED_PRODUCE_LOTS);
  },

  // Marketplace Listings
  async getListings(filters?: { search?: string; category?: string; district?: string; minPrice?: number; maxPrice?: number; grade?: string; sort?: string }): Promise<Listing[]> {
    try {
      const { data } = await supabase.from('listings').select('*').eq('status', 'active');
      if (data && data.length > 0) return data as Listing[];
    } catch {}

    let list = getStorage<Listing>('listings', SEED_LISTINGS);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((l) => l.title.toLowerCase().includes(q) || (l.crop_name && l.crop_name.toLowerCase().includes(q)) || (l.location && l.location.toLowerCase().includes(q)));
    }
    if (filters?.category && filters.category !== 'All') {
      list = list.filter((l) => l.crop_category === filters.category);
    }
    if (filters?.district && filters.district !== 'All') {
      const d = filters.district;
      list = list.filter((l) => l.district === d || Boolean(l.location && l.location.includes(d)));
    }
    if (filters?.grade && filters.grade !== 'All') {
      const g = filters.grade;
      list = list.filter((l) => Boolean(l.quality_grade && l.quality_grade.includes(g)));
    }
    if (filters?.minPrice) {
      list = list.filter((l) => (l.price_per_kg || l.price_per_unit) >= filters.minPrice!);
    }
    if (filters?.maxPrice) {
      list = list.filter((l) => (l.price_per_kg || l.price_per_unit) <= filters.maxPrice!);
    }
    if (filters?.sort === 'price_asc') {
      list.sort((a, b) => (a.price_per_kg || a.price_per_unit) - (b.price_per_kg || b.price_per_unit));
    } else if (filters?.sort === 'price_desc') {
      list.sort((a, b) => (b.price_per_kg || b.price_per_unit) - (a.price_per_kg || a.price_per_unit));
    }
    return list;
  },

  async getListingById(id: string): Promise<Listing | null> {
    const list = await this.getListings();
    return list.find((l) => l.id === id) || null;
  },

  async createListing(listing: Partial<Listing>): Promise<Listing> {
    const newListing: Listing = {
      id: `list-${Date.now()}`,
      seller_id: listing.seller_id || 'user-farmer-01',
      lot_id: listing.lot_id || 'lot-01',
      title: listing.title || 'Fresh Crop Produce Lot',
      price_per_unit: listing.price_per_unit || 50,
      price_per_kg: listing.price_per_kg || listing.price_per_unit || 50,
      currency: 'INR',
      min_order_quantity: listing.min_order_quantity || 100,
      min_order_quantity_kg: listing.min_order_quantity_kg || 100,
      crop_name: listing.crop_name || 'Produce',
      crop_category: listing.crop_category || 'Cereals',
      quantity_available_kg: listing.quantity_available_kg || 1000,
      quality_grade: listing.quality_grade || 'Grade A',
      location: listing.location || 'Thanjavur, Tamil Nadu',
      seller_name: listing.seller_name || 'Ramanathan K.',
      seller_rating: 4.9,
      images: listing.images?.length ? listing.images : ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600'],
      description: listing.description || 'Authentic direct-from-farm harvest lot.',
      status: 'active',
      created_at: new Date().toISOString(),
      ...listing,
    };
    try {
      const { data } = await supabase.from('listings').insert(newListing).select('*').single();
      if (data) return data as Listing;
    } catch {}
    const list = getStorage<Listing>('listings', SEED_LISTINGS);
    list.unshift(newListing);
    setStorage('listings', list);
    return newListing;
  },

  async updateListingStatus(id: string, status: Listing['status']): Promise<void> {
    const list = getStorage<Listing>('listings', SEED_LISTINGS);
    const item = list.find((l) => l.id === id);
    if (item) {
      item.status = status;
      setStorage('listings', list);
    }
  },

  // Orders
  async getOrders(userId?: string, role?: string): Promise<MarketplaceOrder[]> {
    let list = getStorage<MarketplaceOrder>('orders', SEED_ORDERS);
    if (userId) {
      if (role === 'buyer') list = list.filter((o) => o.buyer_id === userId);
      else if (role === 'farmer') list = list.filter((o) => o.seller_id === userId);
    }
    return list;
  },

  async createOrder(order: Partial<MarketplaceOrder>): Promise<MarketplaceOrder> {
    const qty = order.quantity_kg || order.quantity || 100;
    const price = order.unit_price || 50;
    const total = qty * price;
    const newOrder: MarketplaceOrder = {
      id: `ord-${Date.now().toString().slice(-6)}`,
      listing_id: order.listing_id || 'list-01',
      listing_title: order.listing_title || 'AgriMark Produce Order',
      buyer_id: order.buyer_id || 'user-buyer-01',
      buyer_name: order.buyer_name || 'Anand Sharma',
      seller_id: order.seller_id || 'user-farmer-01',
      seller_name: order.seller_name || 'Ramanathan K.',
      quantity: qty,
      quantity_kg: qty,
      unit: 'kg',
      unit_price: price,
      total_amount: total,
      total_price: total,
      status: 'pending',
      payment_status: 'escrowed',
      delivery_address: order.delivery_address || 'Registered Buyer Address',
      created_at: new Date().toISOString(),
      ...order,
    };
    const list = getStorage<MarketplaceOrder>('orders', SEED_ORDERS);
    list.unshift(newOrder);
    setStorage('orders', list);
    return newOrder;
  },

  async updateOrderStatus(orderId: string, status: MarketplaceOrder['status']): Promise<void> {
    const list = getStorage<MarketplaceOrder>('orders', SEED_ORDERS);
    const item = list.find((o) => o.id === orderId);
    if (item) {
      item.status = status;
      setStorage('orders', list);
    }
  },

  // RFQs & Offers
  async getRFQs(): Promise<RFQ[]> {
    return getStorage<RFQ>('rfqs', SEED_RFQS);
  },

  async createRFQ(rfq: Partial<RFQ>): Promise<RFQ> {
    const newRfq: RFQ = {
      id: `rfq-${Date.now()}`,
      buyer_id: rfq.buyer_id || 'user-buyer-01',
      buyer_name: rfq.buyer_name || 'Procurement Manager',
      crop_name: rfq.crop_name || 'Crop Demand',
      required_quantity_kg: rfq.required_quantity_kg || 1000,
      target_price_per_kg: rfq.target_price_per_kg || 50,
      quality_grade: rfq.quality_grade || 'Grade A',
      location: rfq.location || 'Regional Hub',
      needed_by_date: rfq.needed_by_date || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: 'open',
      created_at: new Date().toISOString(),
      ...rfq,
    };
    const list = getStorage<RFQ>('rfqs', SEED_RFQS);
    list.unshift(newRfq);
    setStorage('rfqs', list);
    return newRfq;
  },

  async getOffers(rfqId?: string): Promise<Offer[]> {
    const list = getStorage<Offer>('offers', SEED_OFFERS);
    if (rfqId) return list.filter((o) => o.rfq_id === rfqId);
    return list;
  },

  async createOffer(offer: Partial<Offer>): Promise<Offer> {
    const newOffer: Offer = {
      id: `off-${Date.now()}`,
      rfq_id: offer.rfq_id || 'rfq-01',
      seller_id: offer.seller_id || 'user-farmer-01',
      seller_name: offer.seller_name || 'Kaveri Delta Farmers',
      offered_price_per_kg: offer.offered_price_per_kg || 50,
      quantity_offered_kg: offer.quantity_offered_kg || 1000,
      terms: offer.terms || 'Direct transport to warehouse included',
      status: 'pending',
      created_at: new Date().toISOString(),
      ...offer,
    };
    const list = getStorage<Offer>('offers', SEED_OFFERS);
    list.unshift(newOffer);
    setStorage('offers', list);
    return newOffer;
  },

  // Market Prices & Weather
  async getMarketPrices(): Promise<MarketPriceObservation[]> {
    return SEED_MARKET_PRICES;
  },

  async getWeather(district?: string): Promise<WeatherForecast[]> {
    return SEED_WEATHER;
  },

  // Finance, Tasks, Documents
  async getFinance(userId?: string): Promise<FinanceRecord[]> {
    return getStorage<FinanceRecord>('finance', SEED_FINANCE);
  },

  async createFinanceRecord(record: Partial<FinanceRecord>): Promise<FinanceRecord> {
    const newRec: FinanceRecord = {
      id: `fin-${Date.now()}`,
      user_id: record.user_id || 'user-farmer-01',
      type: record.type || 'expense',
      category: record.category || 'Other',
      amount: record.amount || 1000,
      transaction_date: record.transaction_date || new Date().toISOString().split('T')[0],
      payment_status: record.payment_status || 'paid',
      description: record.description || 'Farm transaction',
      created_at: new Date().toISOString(),
      ...record,
    };
    const list = getStorage<FinanceRecord>('finance', SEED_FINANCE);
    list.unshift(newRec);
    setStorage('finance', list);
    return newRec;
  },

  async getTasks(userId?: string): Promise<FarmTask[]> {
    return getStorage<FarmTask>('tasks', SEED_TASKS);
  },

  async createTask(task: Partial<FarmTask>): Promise<FarmTask> {
    const newTask: FarmTask = {
      id: `task-${Date.now()}`,
      user_id: task.user_id || 'user-farmer-01',
      title: task.title || 'New Farm Task',
      description: task.description || '',
      due_date: task.due_date || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      priority: task.priority || 'medium',
      status: 'pending',
      category: task.category || 'Maintenance',
      created_at: new Date().toISOString(),
      ...task,
    };
    const list = getStorage<FarmTask>('tasks', SEED_TASKS);
    list.unshift(newTask);
    setStorage('tasks', list);
    return newTask;
  },

  async toggleTaskStatus(id: string): Promise<void> {
    const list = getStorage<FarmTask>('tasks', SEED_TASKS);
    const item = list.find((t) => t.id === id);
    if (item) {
      item.status = item.status === 'completed' ? 'pending' : 'completed';
      setStorage('tasks', list);
    }
  },

  async getDocuments(userId?: string): Promise<FarmerDocument[]> {
    return getStorage<FarmerDocument>('documents', SEED_DOCUMENTS);
  },

  async createDocument(doc: Partial<FarmerDocument>): Promise<FarmerDocument> {
    const newDoc: FarmerDocument = {
      id: `doc-${Date.now()}`,
      user_id: doc.user_id || 'user-farmer-01',
      doc_type: doc.doc_type || 'Land Record (Patta/Chitta)',
      doc_number: doc.doc_number || `DOC-${Date.now().toString().slice(-6)}`,
      issuing_authority: doc.issuing_authority || 'District Agriculture Office',
      issue_date: doc.issue_date || new Date().toISOString().split('T')[0],
      verification_status: 'pending',
      file_url: doc.file_url || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=600',
      extracted_info: doc.extracted_info || 'Uploaded document metadata.',
      is_private: doc.is_private ?? true,
      created_at: new Date().toISOString(),
      ...doc,
    };
    const list = getStorage<FarmerDocument>('documents', SEED_DOCUMENTS);
    list.unshift(newDoc);
    setStorage('documents', list);
    return newDoc;
  },

  // Storage & Logistics
  async getColdStorage(): Promise<ColdStorage[]> {
    return SEED_COLD_STORAGE;
  },

  async getLogisticsRequests(): Promise<LogisticsRequest[]> {
    return getStorage<LogisticsRequest>('logistics', SEED_LOGISTICS);
  },

  async createLogisticsRequest(req: Partial<LogisticsRequest>): Promise<LogisticsRequest> {
    const newReq: LogisticsRequest = {
      id: `log-${Date.now()}`,
      pickup_location: req.pickup_location || 'Farm Shed, Thanjavur',
      delivery_location: req.delivery_location || 'Mandi Warehouse',
      crop_name: req.crop_name || 'Produce',
      weight_kg: req.weight_kg || 1000,
      vehicle_type: req.vehicle_type || 'Mini Truck (1.5 Ton)',
      status: 'requested',
      tracking_code: `TRK-${Date.now().toString().slice(-8)}`,
      driver_name: 'Assigned Driver',
      driver_phone: '+91 98000 11223',
      created_at: new Date().toISOString(),
      ...req,
    };
    const list = getStorage<LogisticsRequest>('logistics', SEED_LOGISTICS);
    list.unshift(newReq);
    setStorage('logistics', list);
    return newReq;
  },

  // AI Interactions
  async logAiInteraction(interaction: { query: string; response: string; context?: string; model?: string }): Promise<void> {
    try {
      await supabase.from('ai_interactions').insert({
        query: interaction.query,
        response: interaction.response,
        context: interaction.context || 'general',
        model: interaction.model || 'gemini-3.6-flash',
        created_at: new Date().toISOString(),
      });
    } catch {}
    const list = getStorage<AiInteraction>('ai_logs', []);
    list.unshift({
      id: `ai-${Date.now()}`,
      query: interaction.query,
      response: interaction.response,
      context: interaction.context,
      model: interaction.model || 'gemini-3.6-flash',
      created_at: new Date().toISOString(),
    });
    setStorage('ai_logs', list);
  },

  async getAiLogs(): Promise<AiInteraction[]> {
    return getStorage<AiInteraction>('ai_logs', []);
  },
};
