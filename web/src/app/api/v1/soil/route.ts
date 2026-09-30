import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      data: null,
      meta: {
        data_origin: 'NO_LIVE_SOURCE',
        message: 'Live field soil measurements are required for soil-health reporting.',
      },
    },
    { status: 503 },
  );
}

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      data: null,
      meta: {
        data_origin: 'NO_LIVE_SOURCE',
        message: 'Live field soil measurements are required before soil-health actions can be recorded.',
      },
    },
    { status: 503 },
  );
}
