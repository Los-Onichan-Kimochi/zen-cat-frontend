import { Community, UpdateCommunityPayload } from '@/types/community';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';

export const communitiesApi = {
  getCommunities: async (): Promise<Community[]> => {
    const data = await apiClient.get<{ communities: Community[] }>(
      API_ENDPOINTS.COMMUNITIES.BASE,
    );
    if (data && Array.isArray(data.communities)) {
      return data.communities;
    } else if (Array.isArray(data)) {
      return data;
    }
    throw new Error('Unexpected data structure from communities API for list');
  },

  getCommunityById: async (id: string): Promise<Community> => {
    return apiClient.get<Community>(API_ENDPOINTS.COMMUNITIES.BY_ID(id));
  },

  updateCommunity: async (
    id: string,
    payload: UpdateCommunityPayload,
  ): Promise<Community> => {
    return apiClient.patch<Community>(
      API_ENDPOINTS.COMMUNITIES.BY_ID(id),
      payload,
    );
  },
};
