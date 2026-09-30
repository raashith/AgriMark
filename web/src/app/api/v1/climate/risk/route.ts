import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ success: false, data: null, meta: { data_origin: 'NO_LIVE_SOURCE', message: 'Live weather and soil inputs are required for climate risk assessment.' } }, { status: 503 });
}

export async function POST() {
  return NextResponse.json({ success: false, data: null, meta: { data_origin: 'NO_LIVE_SOURCE', message: 'Live weather and soil inputs are required for climate risk assessment.' } }, { status: 503 });
}
