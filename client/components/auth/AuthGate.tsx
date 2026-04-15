'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

interface AuthGateProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function AuthGate({ children, requireAdmin = false }: AuthGateProps) {
  const { user, isAuthenticated, isReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;

    if (!isAuthenticated) {
      router.replace('/auth');
      return;
    }

    if (requireAdmin && !user?.isAdmin) {
      router.replace('/');
    }
  }, [isAuthenticated, isReady, requireAdmin, router, user?.isAdmin]);

  if (!isReady) {
    return <div className="animate-pulse h-48 rounded-lg bg-muted" />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requireAdmin && !user?.isAdmin) {
    return null;
  }

  return <>{children}</>;
}
