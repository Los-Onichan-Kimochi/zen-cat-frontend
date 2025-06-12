import { CommunityService } from '@/types/community-service';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';

export const communityServicesApi = {
  getCommunityServicesByCommunityId: async (
    communityId: string,
  ): Promise<CommunityService[]> => {
    // Temporary workaround: fetch all community services and filter manually
    // TODO: Fix backend to properly filter by community_id query parameter
    const data = await apiClient.get<{ community_services: CommunityService[] }>(
      API_ENDPOINTS.COMMUNITY_SERVICES.BASE,
    );

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
