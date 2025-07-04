import { useState, useCallback } from 'react';
import { communityPlansApi } from '@/api/communities/community-plans';
import { plansApi } from '@/api/plans/plans';
import { CommunityPlan } from '@/types/community';
import { MembershipPlan } from '@/types/membership';

interface UseCommunityPlansState {
  communityPlans: CommunityPlan[];
  plans: MembershipPlan[];
  isLoading: boolean;
  error: string | null;
}

// Función para transformar un plan de la API al formato esperado por el frontend
const transformPlan = (apiPlan: any): MembershipPlan => {
  const apiType = (apiPlan.type || '').toUpperCase().trim();

  const type =
    apiType === 'MONTHLY'
      ? 'Mensual'
      : apiType === 'ANUAL'
      ? 'Anual'
      : 'Mensual'; // Fallback

  return {
    id: apiPlan.id,
    name:
      apiPlan.name || (type === 'Mensual' ? 'Plan Mensual' : 'Plan Anual'),
    type: type,
    price: apiPlan.fee || apiPlan.price || 0, // Soporte para ambos campos
    duration: type === 'Mensual' ? '/mes' : '/año',
    features: apiPlan.features || [
      'Acceso a la comunidad',
      'Reserva de espacios',
      apiPlan.reservation_limit
        ? `Límite de ${apiPlan.reservation_limit} reservas`
        : 'Reservas ilimitadas',
    ],
    reservationLimit: apiPlan.reservation_limit,
    description: apiPlan.description || '',
  };
};

export function useCommunityPlans() {
  const [state, setState] = useState<UseCommunityPlansState>({
    communityPlans: [],
    plans: [],
    isLoading: false,
    error: null,
  });

  /**
   * Fetches community plans for a specific community and extracts the actual plans
   */
  const fetchCommunityPlans = useCallback(
    async (communityId: string): Promise<MembershipPlan[]> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // 1. Get the list of plan associations for the community
        const communityPlans =
          await communityPlansApi.getCommunityPlansByCommunityId(communityId);

        // 2. Fetch the full details for each plan in parallel
        const planPromises = communityPlans.map((cp) =>
          plansApi.getPlanById(cp.plan_id),
        );

        const resolvedPlans = await Promise.all(planPromises);

        // 3. Transform the plans into the format the frontend expects
        const plans = resolvedPlans.map(transformPlan);

        setState((prev) => ({
          ...prev,
          isLoading: false,
          communityPlans,
          plans,
        }));

        return plans;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Error al obtener planes de la comunidad';

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        return [];
      }
    },
    [],
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const reset = useCallback(() => {
    setState({
      communityPlans: [],
      plans: [],
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    fetchCommunityPlans,
    clearError,
    reset,
  };
}
