import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: [
      {
        id: 'author_1',
        name: 'Dr. V. Ramakrishnan',
        institution: 'ICAR-Indian Institute of Spices Research (IISR)',
        orcid: '0000-0002-1825-0097'
      }
    ]
  });
}



