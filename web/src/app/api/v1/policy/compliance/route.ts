import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      data: null,
      meta: {
        data_origin: 'NO_LIVE_SOURCE',
        message: 'Compliance checks require live farmer/FPO records and versioned policy sources.',
      },
    },
    { status: 503 },
  );
}
