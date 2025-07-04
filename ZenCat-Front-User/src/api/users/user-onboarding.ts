import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';
import { OnboardingResponse } from '@/types/onboarding';

export const userOnboardingApi = {
  /**
   * Gets the onboarding data for a specific user
   * @param userId - The ID of the user
   * @returns Promise<OnboardingResponse> - The onboarding data
   */
  async getUserOnboarding(userId: string): Promise<OnboardingResponse> {
    try {
      console.log('📋 Fetching onboarding data for user:', userId);
      const data = await apiClient.get<OnboardingResponse>(
        API_ENDPOINTS.ONBOARDING.GET_BY_USER(userId)
      );
      console.log('✅ Got onboarding data:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching onboarding data:', error);
      throw error;
    }
  },
}; 