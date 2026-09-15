import { NextResponse } from 'next/server';
import { registerDevice, verifyDeviceAuthentication } from '@/lib/device-registry-engine';
export const dynamic = 'force-dynamic';


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get('device_id') || 'dev_soil_salem_01';

  const auth = await verifyDeviceAuthentication(deviceId);
  return NextResponse.json({ success: true, data: auth });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const device = await registerDevice(body);
    return NextResponse.json({ success: true, data: device });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}

