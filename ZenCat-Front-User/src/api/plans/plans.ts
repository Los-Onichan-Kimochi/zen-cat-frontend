import { MembershipPlan } from '@/types/membership';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';

export interface PlansResponse {
  plans: MembershipPlan[];
}

export const plansApi = {
  /**
   * Gets all plans from the backend
   * @returns Promise<MembershipPlan[]> - All available plans
   */
  async getAllPlans(): Promise<MembershipPlan[]> {
    try {
      console.log('📋 Fetching all plans from backend...');
      console.log('📡 Using endpoint:', API_ENDPOINTS.PLANS.BASE);

      const data = await apiClient.get<PlansResponse>(API_ENDPOINTS.PLANS.BASE);

      console.log('📦 Raw plans API response:', data);

      // Handle different response structures
      let plans: MembershipPlan[] = [];

      if (data && data.plans) {
        plans = Array.isArray(data.plans) ? data.plans : [data.plans];
      } else if (Array.isArray(data)) {
        // In case the response is directly an array
        plans = data as MembershipPlan[];
      } else if (data && typeof data === 'object') {
        // Check if the response has a different structure
        console.log(
          '🔍 Unexpected plans response structure, available keys:',
          Object.keys(data),
        );
      }

      console.log('✅ Processed plans:', plans);
      console.log('📊 Number of plans found:', plans.length);

      return plans;
    } catch (error) {
      console.error('❌ Error fetching plans:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        endpoint: API_ENDPOINTS.PLANS.BASE,
      });
      throw error;
    }
  },

  /**
   * Gets a specific plan by ID
   * @param planId - The ID of the plan
   * @returns Promise<MembershipPlan> - The plan data
   */
  async getPlanById(planId: string): Promise<MembershipPlan> {
    return await apiClient.get<MembershipPlan>(
      API_ENDPOINTS.PLANS.BY_ID(planId),
    );
  },
};
