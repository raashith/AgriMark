import { NextResponse } from 'next/server';
import { registerModelVersion, rollbackModelVersion } from '@/lib/model-registry-governance';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, model_name, version_data, target_version, rollback_reason } = body;

    if (action === 'rollback') {
      const res = await rollbackModelVersion(model_name, target_version, rollback_reason || 'Manual administrative rollback');
      return NextResponse.json({ success: true, data: res });
    }

    const res = await registerModelVersion(model_name || 'matching_ranker', version_data);
    return NextResponse.json({ success: true, data: res });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}



