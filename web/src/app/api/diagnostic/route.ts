import { NextResponse } from 'next/server';
import { getSupabaseDiagnostic } from '@/lib/supabase';

export async function GET() {
  return NextResponse.json(getSupabaseDiagnostic());
}
