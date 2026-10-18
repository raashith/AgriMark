import { UserProfile, Farm, Cultivation, FarmerDocument, ProduceLot, Listing, MarketplaceOrder, MarketPriceObservation } from '@/types';

const DEFAULT_API_BASE_URL = 'https://agrimark-api.onrender.com/api/v1';
const configuredApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
const API_BASE_URL = (() => {
  if (!configuredApiUrl || configuredApiUrl.includes('supabase.co')) return DEFAULT_API_BASE_URL;
  const normalized = configuredApiUrl.replace(/\/+$/, '');
  return /\/api\/v1$/i.test(normalized) ? normalized : `${normalized}/api/v1`;
})();

export class ApiError extends Error {
  statusCode: number;
  detail: string;

  constructor(message: string, statusCode: number = 500, detail: string = '') {
    super(message);
    this.statusCode = statusCode;
    this.detail = detail;
  }
}

async function parseResponseBody(response: Response): Promise<any> {
  const text = await response.text();
  const contentType = response.headers.get('content-type') || '';

  if (!text) return {};

  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(text);
    } catch {
      return { detail: 'The server returned invalid JSON.' };
    }
  }

  const compact = text.replace(/\s+/g, ' ').trim();
  return {
    detail: compact.startsWith('<!DOCTYPE') || compact.startsWith('<html')
      ? 'AgriMark server is temporarily unavailable. Please try again.'
      : compact.slice(0, 500),
  };
}

const RETRYABLE_STATUS_CODES = new Set([502, 503, 504]);
const MAX_GET_RETRIES = 2;
const REQUEST_TIMEOUT_MS = 15000;

function isRetryableMethod(method: string): boolean {
  return method === 'GET' || method === 'HEAD' || method === 'OPTIONS';
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

async function fetchWithResilience(
  url: string,
  options: RequestInit,
): Promise<Response> {
  const method = (options.method || 'GET').toUpperCase();
  const canRetry = isRetryableMethod(method);
  const attempts = canRetry ? MAX_GET_RETRIES + 1 : 1;
  let lastError: unknown = null;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      if (!canRetry || !RETRYABLE_STATUS_CODES.has(response.status) || attempt === attempts - 1) {
        return response;
      }

      // Give a waking/cold backend a little time before retrying.
      await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
    } catch (error) {
      lastError = error;

      if (!canRetry || attempt === attempts - 1 || isAbortError(error)) {
        throw error;
      }

      await new Promise((resolve) => window.setTimeout(resolve, 500 * 2 ** attempt));
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Request failed');
}

async function request<T>(endpoint: string, options: RequestInit = {}, explicitToken?: string | null): Promise<T> {
  const token = explicitToken !== undefined
    ? explicitToken
    : (typeof window !== 'undefined' ? localStorage.getItem('agrimark_token') : null);

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers as Record<string, string>),
  };

  if (token) headers.Authorization = `Bearer ${token}`;
  else if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') headers.Authorization = 'Bearer agrimark-demo-token';

  try {
    const response = await fetchWithResilience(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    const data = await parseResponseBody(response);

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('agrimark_token');
        localStorage.removeItem('agrimark_user');
      }
      throw new ApiError(
        data.detail || `Request failed with status ${response.status}`,
        response.status,
        data.detail || ''
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const detail = error instanceof Error ? error.message : 'Unknown network error';
    const timedOut = error instanceof Error && error.name === 'AbortError';
    throw new ApiError(
      timedOut
        ? 'AgriMark services took too long to respond. Please retry in a moment.'
        : 'Unable to reach AgriMark services. Please check your connection and try again.',
      0,
      detail
    );
  }
}

export const api = {
  // Legacy endpoints retained only for compatibility with older screens.
  login: (data: any) => request<{ access_token: string; refresh_token?: string; token_type: string; user: UserProfile }>(
    '/auth/login',
    { method: 'POST', body: JSON.stringify(data) }
  ),
  register: (data: any) => request<any>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getMe: () => request<UserProfile>('/auth/me'),
  logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),

  syncFirebaseProfile: (
    data: {
      firebase_uid: string;
      email?: string | null;
      phone?: string | null;
      full_name?: string | null;
      requested_role?: string | null;
    },
    idToken: string,
  ) => request<{ user: UserProfile }>(
    '/auth/firebase/sync',
    {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        id_token: idToken,
      }),
    },
    idToken,
  ),

  listCrops: (search?: string) =>
    request<{ items: any[] }>(
      `/core/crops${search ? `?search=${encodeURIComponent(search)}` : ''}`
    ),
  getCrops: () => request<{ items: any[] }>('/core/crops'),
  getFarms: (profileId: string) => request<Farm[]>(`/core/profiles/${profileId}/farms`),
  createFarm: (profileId: string, data: Partial<Farm>) =>
    request<Farm>(`/core/profiles/${profileId}/farms`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getCultivations: (params?: { farm_id?: string; crop_id?: string }) => {
    const query = new URLSearchParams();
    if (params?.farm_id) query.set('farm_id', params.farm_id);
    if (params?.crop_id) query.set('crop_id', params.crop_id);
    return request<Cultivation[]>(
      `/core/cultivations${query.toString() ? `?${query}` : ''}`
    );
  },
  createCultivation: (data: Partial<Cultivation>) =>
    request<Cultivation>('/core/cultivations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getFarmerCultivations: (farmId?: string) => {
    const query = farmId ? `?farm_id=${encodeURIComponent(farmId)}` : '';
    return request<Cultivation[]>(`/core/farmer-cultivations${query}`);
  },
  createFarmerCultivation: (data: {
    farm_id: string;
    crop_id: string;
    crop_name?: string | null;
    variety?: string | null;
    seed_variety?: string | null;
    season?: string;
    sowing_date?: string | null;
    expected_harvest_date?: string | null;
    area_acres: number;
    expected_yield_kg?: number | null;
    status?: string;
    notes?: string | null;
    organic_practice?: boolean;
    budget_inr?: number;
    agronomy_notes?: string | null;
  }) => request<Cultivation>('/core/farmer-cultivations', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getFarmerDocuments: () => request<FarmerDocument[]>('/core/documents'),
  uploadFarmerDocument: (file: File, metadata: {
    doc_type: FarmerDocument['doc_type'];
    doc_number?: string;
    issuing_authority?: string;
    farm_id?: string | null;
    issue_date?: string;
    expiry_date?: string;
    description?: string;
  }) => {
    const form = new FormData();
    form.append('file', file);
    form.append('doc_type', metadata.doc_type);
    if (metadata.doc_number) form.append('doc_number', metadata.doc_number);
    if (metadata.issuing_authority) form.append('issuing_authority', metadata.issuing_authority);
    if (metadata.farm_id) form.append('farm_id', metadata.farm_id);
    if (metadata.issue_date) form.append('issue_date', metadata.issue_date);
    if (metadata.expiry_date) form.append('expiry_date', metadata.expiry_date);
    if (metadata.description) form.append('description', metadata.description);
    return request<FarmerDocument>('/core/documents', { method: 'POST', body: form });
  },
  getFarmerDocumentDownloadUrl: async (documentId: string) => {
    const response = await request<{ url: string }>(
      `/core/documents/${encodeURIComponent(documentId)}/download-url`
    );
    return response.url;
  },
  getPublicHarvestBatches: () =>
    request<Array<{
      id: string;
      cultivation_id: string;
      harvest_date: string;
      total_quantity_kg: number;
      quality_grade: string;
      trace_code: string;
    }>>('/core/public/harvest-batches'),
  getPublicProduceLots: () => request<ProduceLot[]>('/core/public/produce-lots'),
  getHarvestBatches: () =>
    request<Array<{
      id: string;
      cultivation_id: string;
      harvest_date: string;
      total_quantity_kg: number;
      quality_grade: string;
      trace_code: string;
    }>>('/core/harvest-batches'),
  createHarvestBatch: (data: {
    cultivation_id: string;
    harvest_date: string;
    total_quantity_kg: number;
    quality_grade: string;
  }) =>
    request<{
      id: string;
      cultivation_id: string;
      harvest_date: string;
      total_quantity_kg: number;
      quality_grade: string;
      trace_code: string;
    }>('/core/harvest-batches', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getProduceLots: () => request<ProduceLot[]>('/core/produce-lots'),
  createProduceLot: (data: Partial<ProduceLot>) =>
    request<ProduceLot>('/core/produce-lots', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  createListing: (data: Partial<Listing>) =>
    request<Listing>('/core/listings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getListings: (query?: string) =>
    request<Listing[]>(`/marketplace/listings${query ? `?${query}` : ''}`),
  placeOrder: (data: { listing_id: string; quantity: number; unit?: string }) =>
    request<MarketplaceOrder>('/marketplace/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getOrders: () => request<MarketplaceOrder[]>('/marketplace/orders'),
  createRFQ: (data: any) =>
    request<any>('/marketplace/rfqs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getRFQs: () => request<any[]>('/marketplace/rfqs'),
  createOffer: (data: any) =>
    request<any>('/marketplace/offers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getOffers: () => request<any[]>('/marketplace/offers'),

  getAdminOperationsOverview: () => request<any>('/admin/operations/overview'),

  getLatestLocation: () => request<any>('/tracking/latest'),
  recordLocation: (data: any) =>
    request<any>('/tracking/location', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMarketPrices: () => request<MarketPriceObservation[]>('/marketplace/prices'),
  askAgriAI: (message: string, context?: string, languageCode: string = 'auto') =>
    request<{ answer: string; model: string; status: string }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, context, language_code: languageCode }),
    }),
};
