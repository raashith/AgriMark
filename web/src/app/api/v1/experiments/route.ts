import { NextResponse } from 'next/server';
import { getExperimentVariant, createExperiment } from '@/lib/experimentation-platform';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const experiment = searchParams.get('experiment') || 'exp_matching_ranker_v2';
  const userId = searchParams.get('user_id') || 'usr_f_sample';

  const variant = await getExperimentVariant(experiment, userId);
  return NextResponse.json({ success: true, data: { experiment, user_id: userId, variant } });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const exp = await createExperiment(body);
    return NextResponse.json({ success: true, data: exp });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}



