import { NextResponse } from 'next/server';
import { searchGovernmentSchemes, SchemeSearchFilters } from '@/lib/policy-search-comparison';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filters: SchemeSearchFilters = {
    jurisdiction: (searchParams.get('jurisdiction') as any) || undefined,
    state: searchParams.get('state') || undefined,
    category: searchParams.get('category') || undefined,
    page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 10
  };

  const results = await searchGovernmentSchemes(filters);
  return NextResponse.json({ success: true, ...results });
}



