import { CommunityService } from '@/types/community-service';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const communityServicesApi = {
  getCommunityServicesByCommunityId: async (
    communityId: string,
  ): Promise<CommunityService[]> => {
    // Temporary workaround: fetch all community services and filter manually
    // TODO: Fix backend to properly filter by community_id query parameter
    const response = await fetch(`${API_BASE_URL}/community-service/`);
    if (!response.ok) {
      throw new Error(
        `Error fetching services for community with id: ${communityId}`,
      );
    }
    const data = await response.json();

    const allCommunityServices = Array.isArray(data.community_services)
      ? data.community_services
      : [data.community_services];

    // Filter manually by community_id
    const filteredServices = allCommunityServices.filter(
      (cs: CommunityService) => cs.community_id === communityId,
    );

    console.log(
      `Filtered ${filteredServices.length} services for community ${communityId} from ${allCommunityServices.length} total`,
    );

    return filteredServices;
  },
};
