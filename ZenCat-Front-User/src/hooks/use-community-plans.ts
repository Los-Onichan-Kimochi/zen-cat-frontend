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

export function useCommunityPlans() {
  const [state, setState] = useState<UseCommunityPlansState>({
    communityPlans: [],
    plans: [],
    isLoading: false,
    error: null,
  });

  /**
   * Fetches community plans for a specific community and extracts the actual plans
   * Falls back to all plans if community-specific plans are not available
   */
  const fetchCommunityPlans = useCallback(
    async (communityId: string): Promise<MembershipPlan[]> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        console.log('🎯 Fetching community plans for community:', communityId);

        let plans: MembershipPlan[] = [];
        let communityPlans: CommunityPlan[] = [];

        try {
          // First, try to get community-specific plans
          communityPlans =
            await communityPlansApi.getCommunityPlansByCommunityId(communityId);

          // Extract the actual plans from community plans
          // NOTE: This assumes the backend returns the plan relation populated
          plans = communityPlans
            .filter((cp) => cp.plan) // Only include community plans with populated plan
            .map((cp) => cp.plan as MembershipPlan)
            .filter((plan) => {
              // Temporary: exclude specific problematic plans
              const excludedIds = [
                '9f9ad18d-ba25-4f83-bfe0-7266e490c857', // 70 amount plan
                'c39b3250-e9e8-450a-a1f2-7faea528f3c2', // 1000 amount plan
              ];
              return !excludedIds.includes(plan.id);
            });

          console.log('✅ Community plans and extracted plans:', {
            communityPlans,
            extractedPlans: plans,
          });
        } catch (communityPlansError) {
          console.warn(
            '⚠️ Could not fetch community-specific plans, falling back to all plans',
          );
          console.warn('Community plans error:', communityPlansError);

          // Fallback: Get all available plans
          const allPlans = await plansApi.getAllPlans();

          // Apply the same filter to all plans
          plans = allPlans.filter((plan) => {
            const excludedIds = [
              '9f9ad18d-ba25-4f83-bfe0-7266e490c857', // 70 amount plan
              'c39b3250-e9e8-450a-a1f2-7faea528f3c2', // 1000 amount plan
            ];
            return !excludedIds.includes(plan.id);
          });

          console.log('✅ Fallback: Using filtered plans:', plans);
        }

        // If we still don't have plans, try the fallback
        if (plans.length === 0) {
          console.warn(
            '⚠️ No community-specific plans found, trying fallback to all plans...',
          );
          try {
            const allPlans = await plansApi.getAllPlans();

            // Apply the same filter
            plans = allPlans.filter((plan) => {
              const excludedIds = [
                '9f9ad18d-ba25-4f83-bfe0-7266e490c857', // 70 amount plan
                'c39b3250-e9e8-450a-a1f2-7faea528f3c2', // 1000 amount plan
              ];
              return !excludedIds.includes(plan.id);
            });

            console.log('✅ Second fallback: Got filtered plans:', plans);
          } catch (fallbackError) {
            console.error('❌ Fallback also failed:', fallbackError);
          }
        }

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
        console.error('❌ Error in fetchCommunityPlans:', error);

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
