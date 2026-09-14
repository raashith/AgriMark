export type ApiErrorShape = {
  status: number;
  detail: string;
};

const rawApiUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://agrimark-api.onrender.com/api/v1';
const API_BASE_URL = rawApiUrl.includes('supabase.co')
  ? 'https://agrimark-api.onrender.com/api/v1'
  : rawApiUrl;

async function parseResponse(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { detail: text };
  }
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token =
    typeof window !== 'undefined'
      ? window.localStorage.getItem('agrimark_token')
      : null;
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });

  const data = await parseResponse(response);
  if (!response.ok) {
    throw {
      status: response.status,
      detail:
        data && typeof data === 'object' && 'detail' in data
          ? String((data as { detail?: unknown }).detail)
          : `Request failed (${response.status})`,
    } satisfies ApiErrorShape;
  }

  return data as T;
}

export const apiClient = {
  get: <T>(path: string) => apiRequest<T>(path),
  post: <T>(path: string, body: unknown) =>
    apiRequest<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
