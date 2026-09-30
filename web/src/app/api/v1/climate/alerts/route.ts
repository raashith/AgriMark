import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ success: false, data: [], meta: { data_origin: 'NO_LIVE_SOURCE', message: 'No live climate-alert feed is connected to this endpoint.' } }, { status: 503 });
}

export async function POST() {
  return NextResponse.json({ success: false, data: [], meta: { data_origin: 'NO_LIVE_SOURCE', message: 'Live climate alert persistence is not configured.' } }, { status: 503 });
}
