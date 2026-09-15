import { NextResponse } from 'next/server';
import { planDroneMission } from '@/lib/drone-mission-planner';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const mission = await planDroneMission(body);
    return NextResponse.json({ success: true, data: mission });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}
