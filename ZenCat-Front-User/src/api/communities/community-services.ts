import { CommunityService } from '@/types/community-service';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const communityServicesApi = {
  getCommunityServicesByCommunityId: async (
    communityId: string,
  ): Promise<CommunityService[]> => {
    const response = await fetch(
      `${API_BASE_URL}/community-service/${communityId}/`,
    );
    if (!response.ok) {
      console.log(response);
      throw new Error(
        `Error fetching services for community with id: ${communityId}`,
      );
    }
    const data = await response.json();
    console.log(data);
    return Array.isArray(data.services) ? data.services : [data.services];
  },
};
