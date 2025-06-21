import {
  CommunityMembershipPlan,
  BulkCreateCommunityMembershipPlanPayload,
  BulkDeleteCommunityMembershipPlanPayload,
} from '@/types/community-membership-plan';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';

export const communityMembershipPlansApi = {
  bulkCreateCommunityMembershipPlans: async (
    payload: BulkCreateCommunityMembershipPlanPayload,
  ): Promise<CommunityMembershipPlan[]> => {
    const data = await apiClient.post<any>(
      API_ENDPOINTS.COMMUNITY_PLANS.BULK_CREATE,
      payload
    );
    return data.community_plans || data;
  },

  deleteCommunityMembershipPlan: async (
    communityId: string,
    planId: string,
  ): Promise<void> => {
    return apiClient.delete<void>(
      API_ENDPOINTS.COMMUNITY_PLANS.BY_IDS(communityId, planId)
    );
  },

  bulkDeleteCommunityMembershipPlans: async (
    payload: BulkDeleteCommunityMembershipPlanPayload,
  ): Promise<void> => {
    return apiClient.delete<void>(
      API_ENDPOINTS.COMMUNITY_PLANS.BULK_DELETE,
      payload
    );
  },

  getCommunityMembershipPlans: async (
    communityId?: string,
    planId?: string,
  ): Promise<CommunityMembershipPlan[]> => {
    const queryParams = new URLSearchParams();
    if (communityId) queryParams.append('communityId', communityId);
    if (planId) queryParams.append('planId', planId);

    const endpoint = `${API_ENDPOINTS.COMMUNITY_PLANS.BASE}?${queryParams.toString()}`;
    const data = await apiClient.get<any>(endpoint);

    if (data && Array.isArray(data.community_plans)) {
      return data.community_plans;
    } else if (Array.isArray(data)) {
      return data;
    }
    throw new Error('Unexpected data structure from community-plan API');
  },
};
