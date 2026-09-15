import { NextResponse } from 'next/server';
import { matchResourcesForFarmer, createResourceListing } from '@/lib/shared-resource-marketplace';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const farmerId = searchParams.get('farmer_id') || 'usr_f_sample';
  const resourceType = (searchParams.get('resource_type') as any) || 'machinery';
  const location = searchParams.get('location') || 'Salem';

  const matches = await matchResourcesForFarmer(farmerId, resourceType, location);
  return NextResponse.json({ success: true, data: matches });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const listing = await createResourceListing(body);
    return NextResponse.json({ success: true, data: listing });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}
