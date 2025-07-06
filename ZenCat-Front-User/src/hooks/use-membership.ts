import { useState, useCallback } from 'react';
import { membershipsApi } from '@/api/memberships/memberships';
import {
  Membership,
  MembershipsResponse,
  CreateMembershipRequest,
  MembershipPlan,
  MembershipState,
} from '@/types/membership';

interface UseMembershipState {
  isLoading: boolean;
  error: string | null;
  membership: Membership | null;
  memberships: Membership[];
}

export function useMembership() {
  const [state, setState] = useState<UseMembershipState>({
    isLoading: false,
    error: null,
    membership: null,
    memberships: [],
  });

  /**
   * Creates a membership for a user based on their selected plan and community
   */
  const createMembership = useCallback(
    async (
      userId: string,
      plan: MembershipPlan,
      communityId: string,
      customDescription?: string,
    ): Promise<Membership | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // Calculate start and end dates
        const startDate = new Date();
        const endDate = new Date();

        // Add duration based on plan type (assume 1 month for now, you can make this dynamic)
        endDate.setMonth(endDate.getMonth() + 1);

        // Create membership request
        const membershipData: CreateMembershipRequest = {
          description: customDescription || `${plan.name} - ${plan.type}`,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: MembershipState.ACTIVE,
          community_id: communityId,
          plan_id: plan.id,
        };

        const response = await membershipsApi.createMembershipForUser(
          userId,
          membershipData,
        );

        setState((prev) => ({
          ...prev,
          isLoading: false,
          membership: response,
        }));

        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Error al crear membresía';

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        return null;
      }
    },
    [],
  );

  /**
   * Gets memberships for a specific user
   */
  const getUserMemberships = useCallback(
    async (userId: string): Promise<Membership[]> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await membershipsApi.getMembershipsByUser(userId);

        setState((prev) => ({
          ...prev,
          isLoading: false,
          memberships: response.memberships,
        }));

        return response.memberships;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Error al obtener membresías';

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

  /**
   * Gets a specific membership by ID
   */
  const getMembershipById = useCallback(
    async (membershipId: string): Promise<Membership | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response =
          await membershipsApi.getMembershipById(membershipId);

        setState((prev) => ({
          ...prev,
          isLoading: false,
          membership: response,
        }));

        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Error al obtener membresía';

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        return null;
      }
    },
    [],
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      membership: null,
      memberships: [],
    });
  }, []);

  return {
    ...state,
    createMembership,
    getUserMemberships,
    getMembershipById,
    clearError,
    reset,
  };
}
