import { NextResponse } from 'next/server';
import { evaluateImportDependency, evaluateExportPressure } from '@/lib/trade-intelligence-engine';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const commodity = searchParams.get('commodity') || 'Pulses';

  const importDep = await evaluateImportDependency(commodity);
  const exportPress = await evaluateExportPressure(commodity);

  return NextResponse.json({
    success: true,
    data: {
      import_dependency: importDep,
      export_pressure: exportPress
    },
    meta: {
      disclaimer: 'Trade metrics provide decision support. AgriMark does not claim official customs verification or recommend trade restrictions.'
    }
  });
}



