import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      data: [],
      meta: {
        data_origin: 'NO_LIVE_SOURCE',
        message: 'Measured intervention outcomes are not connected to this endpoint.',
      },
    },
    { status: 503 },
  );
}
