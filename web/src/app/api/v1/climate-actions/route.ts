import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ success: false, data: [], meta: { data_origin: 'NO_LIVE_SOURCE', message: 'No live climate-action records are connected to this endpoint.' } }, { status: 503 });
}

export async function POST() {
  return NextResponse.json({ success: false, data: null, meta: { data_origin: 'NO_LIVE_SOURCE', message: 'Live alert and authenticated action workflow are required before an action can be recorded.' } }, { status: 503 });
}
