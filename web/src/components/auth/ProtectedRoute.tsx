'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { UserRole } from '@/types';
import { Skeleton } from '@/components/ui/Skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (user?.needs_onboarding && !pathname.includes('/auth/onboarding')) {
      router.replace('/auth/onboarding');
      return;
    }

    if (allowedRoles && allowedRoles.length > 0 && user?.role) {
      if (!allowedRoles.includes(user.role)) {
        // Redirect to user's appropriate home dashboard
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
  }, [isLoading, isAuthenticated, user, allowedRoles, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <p className="text-sm font-medium text-emerald-400 animate-pulse">Verifying AgriMark authorization...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (allowedRoles && allowedRoles.length > 0 && user?.role && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
};
