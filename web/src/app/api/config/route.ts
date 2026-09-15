import { NextResponse } from 'next/server';
import { getSupabaseDiagnostic } from '@/lib/supabase';
export const dynamic = 'force-dynamic';


export async function GET() {
  return NextResponse.json(getSupabaseDiagnostic());
}

