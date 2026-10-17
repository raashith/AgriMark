'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { UserRole } from '@/types';
import { Skeleton } from '@/components/ui/Skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

const ProtectedRouteSkeleton: React.FC = () => (
  <section
    aria-label="Loading page content"
    aria-busy="true"
    className="mx-auto min-h-[60vh] w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
  >
    <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="w-full max-w-lg space-y-3">
        <Skeleton className="h-8 w-48 max-w-full rounded-lg sm:h-9 sm:w-64" />
        <Skeleton className="h-4 w-4/5 max-w-sm rounded-md" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 w-28 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
    </div>

    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-[#1e2d26] bg-[#101914] p-5"
        >
          <Skeleton className="mb-4 h-4 w-28 rounded-md" />
          <Skeleton className="mb-3 h-8 w-36 max-w-full rounded-lg" />
          <Skeleton className="h-3 w-2/3 rounded-md" />
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="rounded-2xl border border-[#1e2d26] bg-[#101914] p-5 sm:p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Skeleton className="h-6 w-40 max-w-[60%] rounded-md" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }, (_, index) => (
            <div key={index} className="rounded-xl border border-[#1e2d26] p-4">
              <Skeleton className="mb-4 h-28 w-full rounded-lg sm:h-36" />
              <Skeleton className="mb-3 h-5 w-3/4 rounded-md" />
              <Skeleton className="mb-2 h-4 w-1/2 rounded-md" />
              <Skeleton className="h-4 w-2/3 rounded-md" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[#1e2d26] bg-[#101914] p-5 sm:p-6">
        <Skeleton className="mb-6 h-6 w-36 rounded-md" />
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex items-center gap-3 border-b border-[#1e2d26] py-4 last:border-0">
            <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4 rounded-md" />
              <Skeleton className="h-3 w-1/2 rounded-md" />
            </div>
            <Skeleton className="h-5 w-5 shrink-0 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireAuth = false,
}) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    // Demo mode intentionally exposes the complete product surface without login.
    // Production deployments should set NEXT_PUBLIC_DEMO_MODE=false.
    if (!demoMode && !isAuthenticated && requireAuth) {
      router.replace('/auth/login');
      return;
    }

    if (isAuthenticated && user?.needs_onboarding && pathname !== '/auth/onboarding') {
      router.replace('/auth/onboarding');
      return;
    }

    if (!demoMode && allowedRoles && allowedRoles.length > 0 && isAuthenticated && user?.role) {
      if (!allowedRoles.includes(user.role)) {
        const dashboardMap: Record<UserRole, string> = {
          farmer: '/farmer/dashboard',
          buyer: '/buyer/dashboard',
          fpo: '/fpo/dashboard',
          logistics: '/logistics/deliveries',
          service_provider: '/farmer/dashboard',
          admin: '/admin/dashboard',
        };
        router.replace(dashboardMap[user.role] || '/');
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, requireAuth, router, pathname]);

  if (isLoading) {
    return <ProtectedRouteSkeleton />;
  }

  if (!demoMode && requireAuth && !isAuthenticated) return null;

  if (
    !demoMode &&
    allowedRoles &&
    allowedRoles.length > 0 &&
    isAuthenticated &&
    user?.role &&
    !allowedRoles.includes(user.role)
  ) {
    return null;
  }

  // Guests can browse public/read-only dashboards normally.
  // Role-specific mutation pages should opt into requireAuth explicitly.
  return <>{children}</>;
};
