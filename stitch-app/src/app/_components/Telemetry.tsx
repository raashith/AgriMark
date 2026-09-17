'use client';

import { useEffect } from 'react';
import { trackScreen } from '@/lib/telemetry';

export default function Telemetry({ route }: { route: string }) {
  useEffect(() => { void trackScreen(route); }, [route]);
  return null;
}
