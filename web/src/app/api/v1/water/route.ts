import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      data: null,
      meta: {
        data_origin: 'NO_LIVE_SOURCE',
        message: 'Live farm water telemetry is required before irrigation intelligence is shown.',
      },
    },
    { status: 503 },
  );
}
