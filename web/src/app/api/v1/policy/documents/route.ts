import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      data: null,
      meta: {
        data_origin: 'NO_LIVE_SOURCE',
        message: 'Document readiness requires authenticated farmer documents and a live scheme definition.',
      },
    },
    { status: 503 },
  );
}
