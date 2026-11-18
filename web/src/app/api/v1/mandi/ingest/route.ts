import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * This legacy route used an unauthenticated GET request to write external
 * AGMARKNET data through a public Supabase client. It is intentionally
 * disabled. Official ingestion is handled by the resumable, secret-backed
 * GitHub Actions worker.
 */
export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      code: 'LEGACY_INGESTION_DISABLED',
      error: 'This public ingestion endpoint is disabled. Official AGMARKNET ingestion runs through the controlled GitHub Actions workflow.',
    },
    {
      status: 410,
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    },
  );
}
