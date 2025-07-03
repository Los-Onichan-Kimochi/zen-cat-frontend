import {
  CommunityService,
  BulkCreateCommunityServicePayload,
  BulkDeleteCommunityServicePayload,
} from '@/types/community-service';
import { Service } from '@/types/service';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';

export const communityServicesApi = {
  bulkCreateCommunityServices: async (
    payload: BulkCreateCommunityServicePayload,
  ): Promise<CommunityService[]> => {
    const data = await apiClient.post<any>(
      API_ENDPOINTS.COMMUNITY_SERVICES.BULK_CREATE,
      payload,
    );
    return data.community_services || data;
  },

  deleteCommunityService: async (
    communityId: string,
    serviceId: string,
  ): Promise<void> => {
    return apiClient.delete<void>(
      API_ENDPOINTS.COMMUNITY_SERVICES.BY_IDS(communityId, serviceId),
    );
  },

  bulkDeleteCommunityServices: async (
    payload: BulkDeleteCommunityServicePayload,
  ): Promise<void> => {
    return apiClient.delete<void>(
      API_ENDPOINTS.COMMUNITY_PLANS.BULK_DELETE,
      payload,
    );
  },

  getCommunityServices: async (
    communityId?: string,
    serviceId?: string,
  ): Promise<CommunityService[]> => {
    const queryParams = new URLSearchParams();
    if (communityId) queryParams.append('communityId', communityId);
    if (serviceId) queryParams.append('serviceId', serviceId);

    const endpoint = `${API_ENDPOINTS.COMMUNITY_SERVICES.BASE}?${queryParams.toString()}`;
    const data = await apiClient.get<any>(endpoint);

    if (data && Array.isArray(data.community_services)) {
      return data.community_services;
    } else if (Array.isArray(data)) {
      return data;
    }
    throw new Error('Unexpected data structure from community-service API');
  },

  getServicesByCommunityId: async (communityId: string): Promise<Service[]> => {
    const endpoint = API_ENDPOINTS.COMMUNITY_SERVICES.BY_COMMUNITY_ID(communityId);
    const data = await apiClient.get<any>(endpoint);

    if (data && Array.isArray(data.services)) {
      return data.services;
    } else if (Array.isArray(data)) {
      return data;
    }
    throw new Error('Unexpected data structure from services by community ID API');
  },
};
