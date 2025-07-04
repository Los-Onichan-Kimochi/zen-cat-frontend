import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { OnboardingResponse } from '@/types/onboarding';
import { userOnboardingApi } from '@/api/users/user-onboarding';

interface UseUserOnboardingState {
  onboardingData: OnboardingResponse | null;
  isLoading: boolean;
  error: string | null;
}

export function useUserOnboarding() {
  const { user } = useAuth();
  const [state, setState] = useState<UseUserOnboardingState>({
    onboardingData: null,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    const fetchOnboardingData = async () => {
      if (!user?.id) return;

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const data = await userOnboardingApi.getUserOnboarding(user.id);
        setState(prev => ({
          ...prev,
          onboardingData: data,
          isLoading: false,
        }));
      } catch (error: any) {
        // Si es 404, significa que el usuario todavía no tiene onboarding → no es un error
        const errorMsg =
          error instanceof Error ? error.message : 'Error desconocido';

        if (errorMsg.includes('status: 404')) {
          // No hay datos de onboarding, dejar onboardingData en null y sin error
          setState(prev => ({ ...prev, isLoading: false, error: null }));
        } else {
          setState(prev => ({
            ...prev,
            error: errorMsg,
            isLoading: false,
          }));
        }
      }
    };

    fetchOnboardingData();
  }, [user?.id]);

  return state;
} 