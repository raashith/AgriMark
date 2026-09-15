import { NextResponse } from 'next/server';
import { evaluateSoilHealth, recordRegenerativePractice } from '@/lib/soil-health-engine';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fieldId = searchParams.get('field_id') || 'FIELD_NORTH_1';

  const health = await evaluateSoilHealth(fieldId);
  return NextResponse.json({
    success: true,
    data: health,
    meta: {
      laboratory_untested_warning: 'Laboratory unmeasured parameters are flagged UNTESTED. No values were inferred.'
    }
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.action === 'record_practice') {
      const practice = await recordRegenerativePractice(body.practice);
      return NextResponse.json({ success: true, data: practice });
    }
    const health = await evaluateSoilHealth(body.field_id, body.soil_test);
    return NextResponse.json({ success: true, data: health });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}



