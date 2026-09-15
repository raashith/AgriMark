import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const farmerId = searchParams.get('farmer_id') || 'FARMER_DEMO_1';

  return NextResponse.json({
    success: true,
    data: [
      {
        id: 'act_log_1',
        alert_id: 'alert_demo_1',
        farmer_id: farmerId,
        action_taken: 'Activated pulse drip irrigation and covered rows with sugarcane trash mulch',
        status: 'COMPLETED',
        result: 'Root zone soil temperature lowered by 3.2°C',
        created_at: new Date().toISOString()
      }
    ]
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({
      success: true,
      data: {
        id: `act_${Math.random().toString(36).substring(2, 10)}`,
        ...body,
        status: 'COMPLETED',
        created_at: new Date().toISOString()
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
