export type UserProfile = {
  id: string;
  full_name?: string | null;
  phone?: string | null;
  role?: string | null;
};

export type Farm = {
  id: string;
  name?: string | null;
  village?: string | null;
  district?: string | null;
  state?: string | null;
  area_acres?: number | string | null;
  soil_type?: string | null;
  irrigation_type?: string | null;
  soil_ph?: number | string | null;
};

export type Cultivation = {
  id: string;
  farm_id: string;
  crop_id: string;
  season?: string | null;
  status?: string | null;
  sowing_date?: string | null;
  expected_harvest_date?: string | null;
  area_acres?: number | string | null;
};

export type ProduceLot = {
  id: string;
  crop_id?: string;
  quantity?: number | string;
  available_quantity?: number | string;
  unit?: string;
  quality_grade?: string;
  status?: string;
  harvested_at?: string | null;
};

export type Listing = {
  id: string;
  seller_id?: string;
  lot_id?: string;
  title?: string;
  price_per_unit?: number | string;
  currency?: string;
  min_order_quantity?: number | string;
  status?: string;
};

export type MarketplaceOrder = {
  id: string;
  listing_id?: string;
  quantity?: number | string;
  unit?: string;
  unit_price?: number | string;
  total_amount?: number | string;
  status?: string;
};

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://agrimark-api.onrender.com/api/v1').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('agrimark_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  if (options.body) headers.set('Content-Type', 'application/json');
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      cache: 'no-store',
    });
  } catch {
    throw new ApiError(0, 'Unable to reach AgriMark services. Please check your connection.');
  }

  const text = await response.text();
  let data: unknown = {};
  if (text) {
    try { data = JSON.parse(text); } catch { data = { detail: text.slice(0, 400) }; }
  }

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('agrimark_token');
      localStorage.removeItem('agrimark_user');
    }
    const detail = typeof data === 'object' && data && 'detail' in data ? String((data as { detail?: unknown }).detail ?? '') : '';
    throw new ApiError(response.status, detail || `Request failed (${response.status})`);
  }

  return data as T;
}

export const api = {
  login: (credentials: Record<string, unknown>) => request<{ access_token: string; token_type: string; user: UserProfile }>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (payload: Record<string, unknown>) => request<{ access_token?: string; user?: UserProfile; message?: string }>('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => request<UserProfile>('/auth/me'),
  logout: () => request<{ message?: string }>('/auth/logout', { method: 'POST' }),
  farms: (profileId: string) => request<Farm[]>(`/core/profiles/${profileId}/farms`),
  cultivations: () => request<Cultivation[]>('/core/cultivations'),
  produceLots: () => request<ProduceLot[]>('/core/produce-lots'),
  listings: () => request<Listing[]>('/marketplace/listings'),
  orders: () => request<MarketplaceOrder[]>('/marketplace/orders'),
  marketPrices: () => request<any[]>('/marketplace/prices'),
  askAi: (message: string, context?: string) => request<{ answer: string; model?: string }>('/ai/chat', { method: 'POST', body: JSON.stringify({ message, context }) }),
};
