import { NextResponse } from 'next/server';
import { generateEarlyWarningAlert } from '@/lib/early-warning-system';
import { computeFoodSecurityIndicators } from '@/lib/food-security-indicators';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get('region') || 'Salem District';

  const alert = await generateEarlyWarningAlert(region);
  const indicators = await computeFoodSecurityIndicators(region);

  return NextResponse.json({
    success: true,
    data: {
      early_warning: alert,
      food_security_indicators: indicators
    }
  });
}
