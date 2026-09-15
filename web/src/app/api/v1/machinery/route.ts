import { NextResponse } from 'next/server';
import { registerEquipment, bookServiceRequest } from '@/lib/machinery-operations-engine';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.type === 'service_request') {
      const srv = await bookServiceRequest(body);
      return NextResponse.json({ success: true, data: srv });
    }

    const eq = await registerEquipment(body);
    return NextResponse.json({ success: true, data: eq });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}



