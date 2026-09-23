'use client';

import React, { useEffect } from 'react';
import { recordScreenView } from '@/lib/telemetry';
import { useAuth } from '@/lib/auth';
import { AgrimarkLanding } from '@/components/landing/AgrimarkLanding';

export default function HomePage() {
  const { role } = useAuth();

  useEffect(() => {
    void recordScreenView('public_landing_page', role || 'guest');
  }, [role]);

  return <AgrimarkLanding />;
}
