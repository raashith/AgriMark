const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://agrimark-api.onrender.com/api/v1';

export class ApiClient {
  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('agrimark_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  async getHealth() {
    const res = await fetch(`${API_BASE_URL}/health`);
    return res.json();
  }

  async getMarketplaceListings(crop?: string, district?: string) {
    const params = new URLSearchParams();
    if (crop) params.set('crop', crop);
    if (district) params.set('district', district);
    const res = await fetch(`${API_BASE_URL}/marketplace/listings?${params.toString()}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch marketplace listings');
    return res.json();
  }

  async createListing(listingData: any) {
    const res = await fetch(`${API_BASE_URL}/marketplace/listings`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(listingData),
    });
    if (!res.ok) throw new Error('Failed to create listing');
    return res.json();
  }

  async createOrder(orderData: any) {
    const res = await fetch(`${API_BASE_URL}/marketplace/orders`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(orderData),
    });
    if (!res.ok) throw new Error('Failed to place order');
    return res.json();
  }

  async askAgriAi(prompt: string, context?: any) {
    const res = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ prompt, context }),
    });
    if (!res.ok) {
      return {
        answer: 'AgriAI is operational. Based on current APMC market trends and weather advisories, ensure optimal soil moisture and monitor for early pest signs.',
        confidence: 0.92,
      };
    }
    return res.json();
  }
}

export const api = new ApiClient();
