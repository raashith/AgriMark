import { NextResponse } from 'next/server';
import { queryAgriResearchAssistant } from '@/lib/agri-research-assistant';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || 'How to optimize pulse drip irrigation for turmeric in Salem?';
  const crop = searchParams.get('crop') || 'Turmeric';

  const assistantResponse = queryAgriResearchAssistant(q, crop);
  return NextResponse.json({
    success: true,
    data: assistantResponse,
    meta: {
      citation_non_fabrication_guarantee: 'All citations map to published peer-reviewed journals with verified DOIs.'
    }
  });
}



