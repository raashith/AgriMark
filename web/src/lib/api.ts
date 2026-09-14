import { UserProfile, Farm, Cultivation, ProduceLot, Listing, MarketplaceOrder, MarketPriceObservation } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://agrimark-api.onrender.com/api/v1';

export class ApiError extends Error {
  statusCode: number;
  detail: string;

  constructor(message: string, statusCode: number = 500, detail: string = '') {
    super(message);
    this.statusCode = statusCode;
    this.detail = detail;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('agrimark_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    const text = await response.text();
    let data: any = {};
    if (text) {
      try { data = JSON.parse(text); } catch { data = { detail: text }; }
    }
    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('agrimark_token');
        localStorage.removeItem('agrimark_user');
      }
      throw new ApiError(data.detail || `Request failed with status ${response.status}`, response.status, data.detail || '');
    }
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Network connection error. Please check your network.', 0, (error as Error).message);
  }
}

export const api = {
  login: (data: any) => request<{ access_token: string; refresh_token?: string; token_type: string; user: UserProfile }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request<UserProfile>('/auth/me'),
  logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),

  listCrops: (search?: string) => request<{ items: any[] }>(`/core/crops${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getCrops: () => request<{ items: any[] }>('/core/crops'),
  getFarms: (profileId: string) => request<Farm[]>(`/core/profiles/${profileId}/farms`),
  createFarm: (profileId: string, data: Partial<Farm>) => request<Farm>(`/core/profiles/${profileId}/farms`, { method: 'POST', body: JSON.stringify(data) }),
  getCultivations: (params?: { farm_id?: string; crop_id?: string }) => {
    const query = new URLSearchParams();
    if (params?.farm_id) query.set('farm_id', params.farm_id);
    if (params?.crop_id) query.set('crop_id', params.crop_id);
    return request<Cultivation[]>(`/core/cultivations${query.toString() ? `?${query}` : ''}`);
  },
  createCultivation: (data: Partial<Cultivation>) => request<Cultivation>('/core/cultivations', { method: 'POST', body: JSON.stringify(data) }),
  getProduceLots: () => request<ProduceLot[]>('/core/produce-lots'),
  createProduceLot: (data: Partial<ProduceLot>) => request<ProduceLot>('/core/produce-lots', { method: 'POST', body: JSON.stringify(data) }),
  createListing: (data: Partial<Listing>) => request<Listing>('/core/listings', { method: 'POST', body: JSON.stringify(data) }),

  getListings: (query?: string) => request<Listing[]>(`/marketplace/listings${query ? `?${query}` : ''}`),
  placeOrder: (data: { listing_id: string; quantity: number; unit?: string }) => request<MarketplaceOrder>('/marketplace/orders', { method: 'POST', body: JSON.stringify(data) }),
  getOrders: () => request<MarketplaceOrder[]>('/marketplace/orders'),
  createRFQ: (data: any) => request<any>('/marketplace/rfqs', { method: 'POST', body: JSON.stringify(data) }),
  getRFQs: () => request<any[]>('/marketplace/rfqs'),
  createOffer: (data: any) => request<any>('/marketplace/offers', { method: 'POST', body: JSON.stringify(data) }),
  getOffers: () => request<any[]>('/marketplace/offers'),

  getLatestLocation: () => request<any>('/tracking/latest'),
  recordLocation: (data: any) => request<any>('/tracking/location', { method: 'POST', body: JSON.stringify(data) }),

  getMarketPrices: () => request<MarketPriceObservation[]>('/marketplace/prices'),
  askAgriAI: (message: string, context?: string) => request<{ answer: string; model: string; status: string }>('/ai/chat', { method: 'POST', body: JSON.stringify({ message, context }) }),
};
