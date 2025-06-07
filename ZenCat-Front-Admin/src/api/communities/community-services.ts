import {
  CommunityService,
  CreateCommunityServicePayload,
} from '@/types/community-service';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const communityServicesApi = {
  bulkCreateCommunityServices: async (
    communityServices: CreateCommunityServicePayload[],
  ): Promise<CommunityService[]> => {

    const response = await fetch(
      `${API_BASE_URL}/community-service/bulk-create/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ community_services: communityServices }),
      },
    );
    if (!response.ok) {
      throw new Error('Error creating services for community');
    }
    return response.json();
  },

   deleteCommunityService: async (
    communityId: string,
    serviceId: string,
  ): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}/community-service/${communityId}/${serviceId}/`,
      {
        method: 'DELETE',
      },
    );
    if (!response.ok) throw new Error('Error deleting community-service');
  },

  bulkDeleteCommunityServices: async (ids: string[]): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}/community-service/bulk-delete/`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ communityServices: ids }),
      },
    );
    if (!response.ok) {
      throw new Error('Error bulk deleting community-services');
    }
  },

  getCommunityServices: async (communityId?: string, serviceId?: string): Promise<CommunityService[]> => {
    const queryParams = new URLSearchParams();

    if (communityId) queryParams.append("communityId", communityId);
    if (serviceId) queryParams.append("serviceId", serviceId);

    const response = await fetch(`${API_BASE_URL}/community-service/?${queryParams.toString()}`);
    if (!response.ok) throw new Error('Error fetching community-services');
    const data = await response.json();
    
    if (data && Array.isArray(data.community_services)) {
      return data.community_services;
    } else if (Array.isArray(data)) {
      return data;
    }
    throw new Error('Unexpected data structure from community-service API');
  }

};
