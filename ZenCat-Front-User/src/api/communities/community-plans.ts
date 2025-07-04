import { CommunityPlan } from '@/types/community';
import { MembershipPlan } from '@/types/membership';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';

export interface CommunityPlansResponse {
  community_plans: CommunityPlan[];
}

export interface CommunityPlanWithPlan extends CommunityPlan {
  plan: MembershipPlan;
}

export const communityPlansApi = {
  /**
   * Gets all community plans for a specific community
   * @param communityId - The ID of the community
   * @returns Promise<CommunityPlan[]> - Community plans
   */
  async getCommunityPlansByCommunityId(
    communityId: string,
  ): Promise<CommunityPlan[]> {
    try {
      console.log('🎯 Fetching community plans for community:', communityId);
      console.log(
        '📡 Using endpoint:',
        API_ENDPOINTS.COMMUNITY_PLANS.BY_COMMUNITY_ID(communityId),
      );

      const data = await apiClient.get<CommunityPlansResponse>(
        API_ENDPOINTS.COMMUNITY_PLANS.BY_COMMUNITY_ID(communityId),
      );

      console.log('📦 Raw API response:', data);

      // Handle different response structures
      let communityPlans: CommunityPlan[] = [];

      if (data && data.community_plans) {
        communityPlans = Array.isArray(data.community_plans)
          ? data.community_plans
          : [data.community_plans];
      } else if (Array.isArray(data)) {
        // In case the response is directly an array
        communityPlans = data as CommunityPlan[];
      } else if (data && typeof data === 'object') {
        // Check if the response has a different structure
        console.log(
          '🔍 Unexpected response structure, available keys:',
          Object.keys(data),
        );
      }

      console.log('✅ Processed community plans:', communityPlans);
      console.log('📊 Number of community plans found:', communityPlans.length);

      return communityPlans;
    } catch (error) {
      console.error('❌ Error fetching community plans:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        communityId,
        endpoint: API_ENDPOINTS.COMMUNITY_PLANS.BY_COMMUNITY_ID(communityId),
      });
      throw error;
    }
  },

  /**
   * Gets all community plans
   * @returns Promise<CommunityPlan[]> - All community plans
   */
  async getAllCommunityPlans(): Promise<CommunityPlan[]> {
    try {
      const data = await apiClient.get<CommunityPlansResponse>(
        API_ENDPOINTS.COMMUNITY_PLANS.BASE,
      );

      const communityPlans = Array.isArray(data.community_plans)
        ? data.community_plans
        : [data.community_plans];

      return communityPlans;
    } catch (error) {
      console.error('❌ Error fetching all community plans:', error);
      throw error;
    }
  },

  /**
   * Gets a specific community plan by ID
   * @param id - The ID of the community plan
   * @returns Promise<CommunityPlan> - The community plan
   */
  async getCommunityPlanById(id: string): Promise<CommunityPlan> {
    return await apiClient.get<CommunityPlan>(
      API_ENDPOINTS.COMMUNITY_PLANS.BY_ID(id),
    );
  },
};
