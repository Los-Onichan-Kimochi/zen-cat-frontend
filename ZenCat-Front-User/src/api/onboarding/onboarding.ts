import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';
import { CreateOnboardingRequest, OnboardingResponse, UpdateOnboardingRequest } from '@/types/onboarding';

export const onboardingService = {
  /**
   * Gets onboarding data for a specific user (to check if exists)
   * @param userId - The ID of the user to get onboarding for
   * @returns Promise<OnboardingResponse | null> - The onboarding data or null if not exists
   */
  async getOnboardingForUser(
    userId: string,
  ): Promise<OnboardingResponse | null> {
    try {
      const response = await apiClient.get<OnboardingResponse>(
        API_ENDPOINTS.ONBOARDING.GET_BY_USER(userId),
      );
      return response;
    } catch (error) {
      // User doesn't have onboarding yet, which is expected for new users
      return null;
    }
  },

  /**
   * Creates onboarding data for a specific user
   * @param userId - The ID of the user to create onboarding for
   * @param onboardingData - The onboarding data to create
   * @returns Promise<OnboardingResponse> - The created onboarding data
   */
  async createOnboardingForUser(
    userId: string,
    onboardingData: CreateOnboardingRequest,
  ): Promise<OnboardingResponse> {
    try {
      const response = await apiClient.post<OnboardingResponse>(
        API_ENDPOINTS.ONBOARDING.CREATE_FOR_USER(userId),
        onboardingData,
      );

      return response;
    } catch (error) {
      console.error('Error creating onboarding for user:', error);
      throw error;
    }
  },

  /**
   * Updates onboarding data for a specific user
   * @param userId - The ID of the user to update onboarding for
   * @param onboardingData - The onboarding data to update
   * @returns Promise<OnboardingResponse> - The updated onboarding data
   */
  async updateOnboardingForUser(
    userId: string,
    onboardingData: Partial<UpdateOnboardingRequest>
  ): Promise<OnboardingResponse> {
    try {
      // Ensure we include the updated_by field
      const dataWithUpdatedBy = {
        ...onboardingData,
        updated_by: userId, // Always include who's making the update
      };

      const response = await apiClient.patch<OnboardingResponse>(
        API_ENDPOINTS.ONBOARDING.UPDATE_FOR_USER(userId),
        dataWithUpdatedBy
      );

      return response;
    } catch (error) {
      console.error('Error updating onboarding for user:', error);
      throw error;
    }
  }


};
