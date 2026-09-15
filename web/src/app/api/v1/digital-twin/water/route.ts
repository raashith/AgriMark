export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { FarmCropSoilWaterTwinEngine } from '@/lib/farm-crop-soil-water-twin';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cap = parseFloat(searchParams.get('capacity_mcm') || '1200');
  const inflow = parseFloat(searchParams.get('inflow_mcm') || '300');
  const demand = parseFloat(searchParams.get('demand_mcm') || '1800');

  const waterTwin = FarmCropSoilWaterTwinEngine.calculateWaterBalance({
    capacity_mcm: cap,
    inflow_mcm: inflow,
    demand_mcm: demand
  });

  return NextResponse.json(waterTwin);
}

