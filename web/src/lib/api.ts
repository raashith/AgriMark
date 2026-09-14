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
    'Accept': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    let data: any = {};
    const text = await response.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { detail: text };
      }
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
  // Auth
  login: (data: any) => request<{ access_token: string; token_type: string; user: UserProfile }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => request<UserProfile>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request<UserProfile>('/auth/me'),
  logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),

  // Farmer Operations
  getFarms: () => request<Farm[]>('/farmer/farms'),
  createFarm: (data: Partial<Farm>) => request<Farm>('/farmer/farms', { method: 'POST', body: JSON.stringify(data) }),
  getCrops: () => request<Cultivation[]>('/farmer/crops'),
  createCrop: (data: Partial<Cultivation>) => request<Cultivation>('/farmer/crops', { method: 'POST', body: JSON.stringify(data) }),
  getProduceLots: () => request<ProduceLot[]>('/farmer/harvests'),
  createProduceLot: (data: Partial<ProduceLot>) => request<ProduceLot>('/farmer/harvests', { method: 'POST', body: JSON.stringify(data) }),

  // Marketplace
  getListings: (query?: string) => request<Listing[]>(`/marketplace/listings${query ? `?${query}` : ''}`),
  createListing: (data: Partial<Listing>) => request<Listing>('/marketplace/listings', { method: 'POST', body: JSON.stringify(data) }),
  placeOrder: (data: { listing_id: string; quantity_kg: number }) => request<MarketplaceOrder>('/marketplace/orders', { method: 'POST', body: JSON.stringify(data) }),
  getOrders: () => request<MarketplaceOrder[]>('/marketplace/orders'),

  // Intelligence & AI
  getMarketPrices: () => request<MarketPriceObservation[]>('/market/prices'),
  askAgriAI: (prompt: string) => request<{ response: string }>('/ai/chat', { method: 'POST', body: JSON.stringify({ prompt }) }),
};
