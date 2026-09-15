import { NextResponse } from 'next/server';

export async function GET() {
  const providers = [
    {
      id: 'srv_prov_01',
      user_id: 'usr_provider_01',
      service_type: 'drone_operator',
      service_area: 'Salem & Erode',
      hourly_rate: 1500,
      rating: 4.9,
      verification_status: 'VERIFIED'
    },
    {
      id: 'srv_prov_02',
      user_id: 'usr_provider_02',
      service_type: 'soil_testing',
      service_area: 'Tamil Nadu Regional',
      hourly_rate: 800,
      rating: 4.8,
      verification_status: 'VERIFIED'
    }
  ];

  return NextResponse.json({ success: true, data: providers });
}
