import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DEFAULT_API_BASE_URL = 'https://agrimark-api.onrender.com/api/v1';

function getBackendBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!configured || configured.includes('supabase.co')) return DEFAULT_API_BASE_URL;
  const normalized = configured.replace(/\/+$/, '');
  return /\/api\/v1$/i.test(normalized) ? normalized : '${normalized}/api/v1';
}

export async function GET(request: Request) {
  const authorization = request.headers.get('authorization');
  if (!authorization || !/^Bearer\s+\S+$/i.test(authorization)) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const response = await fetch('${getBackendBaseUrl()}/admin/dashboard-summary', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: authorization,
      },
      cache: 'no-store',
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { error: payload.detail || 'Unable to load administrator analytics' },
        { status: response.status },
      );
    }

    const summary = payload.summary || {};
    const totalOrders = Number(summary.total_orders || 0);
    const completedOrders = Number(summary.completed_orders || 0);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      filter: { district: 'All', state: 'All', filtersApplied: false },
      networkMetrics: {
        activeFarmers: Number(summary.farmer_accounts || 0),
        totalFarms: Number(summary.total_farms || 0),
        totalCultivatedAcres: Number(summary.total_farm_acres || 0),
        activeListings: Number(summary.active_listings || 0),
        totalAvailableStockKg: Number(summary.total_available_stock_kg || 0),
        averageAskingPricePerUnit: Number(summary.average_asking_price_per_unit || 0),
        totalOrders,
        completedOrders,
        fulfillmentRatePct: totalOrders > 0
          ? Math.round((completedOrders / totalOrders) * 100)
          : 0,
        grossOrderVolumeInr: Number(summary.order_volume_inr || 0),
      },
    });
  } catch (error) {
    console.error('[Analytics API] Backend request failed:', error);
    return NextResponse.json(
      { error: 'AgriMark analytics service is temporarily unavailable.' },
      { status: 503 },
    );
  }
}
