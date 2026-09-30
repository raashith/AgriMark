import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: false,
    data: [],
    meta: { data_origin: 'NO_LIVE_SOURCE', message: 'No live weather observations are connected to this endpoint.' },
  }, { status: 503 });
}
