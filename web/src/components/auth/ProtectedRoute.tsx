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

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireAuth = false,
}) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    // Guest access is the default. Auth is only required when a route
    // explicitly opts in with requireAuth or role restrictions.
    if (!isAuthenticated && requireAuth) {
      router.replace('/auth/login');
      return;
    }

    if (isAuthenticated && user?.needs_onboarding && pathname !== '/auth/onboarding') {
      router.replace('/auth/onboarding');
      return;
    }

    if (allowedRoles && allowedRoles.length > 0 && isAuthenticated && user?.role) {
      if (!allowedRoles.includes(user.role)) {
        const dashboardMap: Record<UserRole, string> = {
          farmer: '/farmer/dashboard',
          buyer: '/buyer/marketplace',
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
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <p className="text-sm font-medium text-emerald-400 animate-pulse">Loading AgriMark...</p>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) return null;

  if (
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