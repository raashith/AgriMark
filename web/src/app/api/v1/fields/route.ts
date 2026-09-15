export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { computeFieldDigitalTwin } from '@/lib/field-digital-twin';
import { generatePhysicalRecommendations } from '@/lib/agricultural-decision-engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fieldId = searchParams.get('field_id') || 'field_salem_02';

  const twin = await computeFieldDigitalTwin(fieldId);
  const recommendations = await generatePhysicalRecommendations(fieldId);

  return NextResponse.json({
    success: true,
    data: {
      digital_twin: twin,
      recommendations
    }
  });
}

