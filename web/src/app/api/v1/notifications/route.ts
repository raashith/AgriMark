import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// AgriMark web sign-in is Firebase-backed. Notifications are now served by
// the authenticated Render API (/api/v1/marketplace/notifications), which
// derives the user identity from the verified bearer token instead of trusting
// a user_id supplied in a request body or query string.
export async function GET() {
  return NextResponse.json(
    { error: 'Use the authenticated marketplace notifications API.' },
    { status: 410, headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function POST() {
  return NextResponse.json(
    { error: 'Notifications are created by verified marketplace events.' },
    { status: 410, headers: { 'Cache-Control': 'no-store' } },
  );
}
