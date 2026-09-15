import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: [
      {
        id: 'cite_1',
        source_paper_id: 'paper_icar_2025_turmeric_1',
        target_paper_id: 'paper_tnau_2023_drip_2',
        relationship_type: 'EXTENDS',
        created_at: new Date().toISOString()
      }
    ]
  });
}
