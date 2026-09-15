import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: [
      {
        id: 'inst_icar_iisr',
        name: 'ICAR-Indian Institute of Spices Research (IISR)',
        type: 'ICAR',
        country: 'India',
        website: 'https://spices.res.in'
      }
    ]
  });
}
