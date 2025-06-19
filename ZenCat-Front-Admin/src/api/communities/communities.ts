import {
  BulkCreateCommunityPayload,
  BulkDeleteCommunityPayload,
  Community,
  CommunityWithImage,
  CreateCommunityPayload,
  UpdateCommunityPayload,
} from '@/types/community';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';

export const communitiesApi = {
  createCommunity: async (
    payload: CreateCommunityPayload,
  ): Promise<Community> => {
    return apiClient.post<Community>(API_ENDPOINTS.COMMUNITIES.BASE, payload);
  },

  bulkCreateCommunities: async (
    payload: BulkCreateCommunityPayload,
  ): Promise<Community[]> => {
    console.log('Creating communities:', payload);
    return apiClient.post<Community[]>(
      API_ENDPOINTS.COMMUNITIES.BULK_CREATE,
      payload,
    );
  },

  getCommunities: async (): Promise<Community[]> => {
    const data = await apiClient.get<any>(API_ENDPOINTS.COMMUNITIES.BASE);
    if (data && Array.isArray(data.communities)) {
      return data.communities;
    } else if (Array.isArray(data)) {
      return data;
    }
    console.error('Unexpected data structure from /community/ endpoint:', data);
    throw new Error('Unexpected data structure from communities API for list');
  },

  getCommunityById: async (id: string): Promise<Community> => {
    return apiClient.get<Community>(API_ENDPOINTS.COMMUNITIES.BY_ID(id));
  },

  getCommunityWithImage: async (id: string): Promise<CommunityWithImage> => {
    return apiClient.get<CommunityWithImage>(
      API_ENDPOINTS.COMMUNITIES.WITH_IMAGE(id),
    );
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

  deleteCommunity: async (id: string): Promise<void> => {
    return apiClient.delete<void>(API_ENDPOINTS.COMMUNITIES.BY_ID(id));
  },

  bulkDeleteCommunities: async (
    payload: BulkDeleteCommunityPayload,
  ): Promise<void> => {
    return apiClient.delete<void>(
      API_ENDPOINTS.COMMUNITIES.BULK_DELETE,
      payload,
    );
  },
};
