import { CommunityService } from '@/types/community-service';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';
import { Service } from '@/types/service';

export const communityServicesApi = {

  // Get all community services with optional filters
  getCommunityServices: async (
    communityIds?: string[],
    serviceIds?: string[],
  ): Promise<CommunityService[]> => {
    const params = new URLSearchParams();

    if (serviceIds && serviceIds.length > 0) {
      params.append('serviceId', serviceIds.join(','));
    }

    if (communityIds && communityIds.length > 0) {
      params.append('communityId', communityIds.join(','));
    }
    
    const endpoint = `/community-service/?${params}`;
    const data = await apiClient.get<{
      community_services: CommunityService[];
    }>(endpoint);
    
    if (data && typeof data === 'object' && 'community_services' in data) {
      return data.community_services;
    }
    console.error(
      'Unexpected data structure from /community-service/ endpoint:',
      data,
    );
    throw new Error('Unexpected data structure from community-services API');
  },

  getCommunityServicesByCommunityId: async (
    communityId: string,
  ): Promise<CommunityService[]> => {
    // Temporary workaround: fetch all community services and filter manually
    // TODO: Fix backend to properly filter by community_id query parameter
    const data = await apiClient.get<{
      community_services: CommunityService[];
    }>(API_ENDPOINTS.COMMUNITY_SERVICES.BASE);

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

  getServicesByCommunityId: async (communityId: string): Promise<Service[]> => {
    const response = await apiClient.get<{ services: Service[] }>(
      API_ENDPOINTS.COMMUNITY_SERVICES.BY_COMMUNITY_ID(communityId),
    );

    const services = Array.isArray(response.services) ? response.services : [];
    return services;
  },
};
