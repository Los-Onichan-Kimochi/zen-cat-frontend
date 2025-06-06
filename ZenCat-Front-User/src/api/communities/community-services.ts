import { CommunityService } from '@/types/community-service';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const communityServicesApi = {
  getCommunityServicesByCommunityId: async (
    communityId: string,
  ): Promise<CommunityService> => {
    const response = await fetch(
      `${API_BASE_URL}/community-service/${communityId}/`,
    );
    if (!response.ok) {
      throw new Error(
        `Error fetching services for community with id: ${communityId}`,
      );
    }
    return response.json();
  },
};
