export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { FarmCropSoilWaterTwinEngine, CropStage } from '@/lib/farm-crop-soil-water-twin';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const stage = (searchParams.get('stage') || 'VEGETATIVE') as CropStage;
  const gdd = parseInt(searchParams.get('gdd') || '450', 10);

  const nextStage = FarmCropSoilWaterTwinEngine.transitionCropStage(stage, gdd);

  return NextResponse.json({
    crop_id: 'CRP-RICE-001',
    current_stage: stage,
    accumulated_gdd: gdd,
    projected_next_stage: nextStage,
    canopy_cover_pct: 68.4,
    stress_index: 0.12,
    lifecycle_states: [
      'PLANNED', 'SOWN', 'GERMINATING', 'VEGETATIVE',
      'FLOWERING', 'FRUITING', 'MATURING', 'HARVEST_READY', 'HARVESTED'
    ]
  });
}

