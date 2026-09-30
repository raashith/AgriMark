import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body?.farmer_profile || !body?.scheme_id) {
      return NextResponse.json(
        { success: false, error: 'farmer_profile and scheme_id are required.' },
        { status: 400 },
      );
    }
    return NextResponse.json(
      {
        success: false,
        data: null,
        meta: {
          data_origin: 'NO_LIVE_SOURCE',
          message: 'Eligibility requires live farmer records and a versioned scheme definition.',
        },
      },
      { status: 503 },
    );
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body.' }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      data: null,
      meta: {
        data_origin: 'NO_LIVE_SOURCE',
        message: 'Eligibility cannot be evaluated from a synthetic farmer profile.',
      },
    },
    { status: 503 },
  );
}
