import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/context/AuthContext';

interface UseAuthRedirectOptions {
  redirectTo?: string;
  requireAuth?: boolean;
  onRedirect?: () => void;
}

export function useAuthRedirect({
  redirectTo = '/login',
  requireAuth = true,
  onRedirect,
}: UseAuthRedirectOptions = {}) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      console.log('useAuthRedirect: Redirecting to:', redirectTo);
      onRedirect?.();
      navigate({ to: redirectTo });
    }
  }, [
    isAuthenticated,
    isLoading,
    requireAuth,
    redirectTo,
    navigate,
    onRedirect,
  ]);

  return {
    isAuthenticated,
    isLoading,
    shouldRender: !requireAuth || isAuthenticated,
  };
}
