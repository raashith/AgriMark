import { NextResponse } from 'next/server';
import { getStorageAnalytics, evaluatePostHarvestLoss } from '@/lib/storage-processing-intelligence';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location') || 'Salem';
  const commodity = searchParams.get('commodity') || 'Turmeric';

  const storage = await getStorageAnalytics(location);
  const losses = await evaluatePostHarvestLoss(commodity, location);

  return NextResponse.json({
    success: true,
    data: {
      storage_facilities: storage,
      post_harvest_losses: losses
    }
  });
}



