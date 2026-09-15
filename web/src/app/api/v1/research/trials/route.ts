import { NextResponse } from 'next/server';
import { createFieldTrial, getPracticeLibrary } from '@/lib/practice-trial-engine';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const practices = await getPracticeLibrary();
  return NextResponse.json({
    success: true,
    data: {
      practices,
      active_trials: [
        {
          id: 'trial_salem_drip_1',
          title: 'Pulse Drip vs Continuous Drip Micro-Trial',
          crop: 'Turmeric',
          duration_months: 8,
          status: 'IN_PROGRESS',
          is_ai_draft: false,
          has_control_group: true,
          is_farmer_learning_trial: true
        }
      ]
    }
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const trial = await createFieldTrial(body);
    return NextResponse.json({ success: true, data: trial });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}



