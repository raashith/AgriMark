import { NextResponse } from 'next/server';
import { DigitalTwinStateModel } from '@/lib/digital-twin-state-model';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const district = searchParams.get('district') || 'Salem';
  const timestamp = searchParams.get('timestamp') || new Date().toISOString();

  const snapshot = await DigitalTwinStateModel.getHistoricalReconstruction({ district }, timestamp);
  return NextResponse.json(snapshot);
}

export async function POST(req: Request) {
  const body = await req.json();
  const snapshot = await DigitalTwinStateModel.createSnapshot(body);
  return NextResponse.json({ success: true, snapshot });
}
