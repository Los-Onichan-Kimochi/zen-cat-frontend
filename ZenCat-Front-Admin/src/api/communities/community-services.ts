import { CommunityService , CreateCommunityServicePayload } from '@/types/community-service';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const communityServicesApi = {

  bulkCreateCommunityServices: async (communityServices: CreateCommunityServicePayload[]): Promise<CommunityService[]> => {
    console.log('Creating community services:', communityServices);
    const response = await fetch(`${API_BASE_URL}/community-service/bulk-create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ community_services: communityServices }),
    });
    if (!response.ok) {
      throw new Error('Error creating services for community');
    }
    return response.json(); 
  },

  getCommunityServicesByCommunityId: async (communityId: string): Promise<CommunityService> => {
    const response = await fetch(`${API_BASE_URL}/community-service/${communityId}/`);
    if (!response.ok) {
      throw new Error(`Error fetching services for community with id: ${communityId}`);
    }
    return response.json();
  },

  deleteCommunityService: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/community-service/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Error deleting community-service with id: ${id}`);
    }
  },

  bulkDeleteCommunityServices: async (ids: string[]): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/community-service/bulk-delete/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ communityServices: ids }),
    });
    if (!response.ok) {
      throw new Error('Error bulk deleting community-services');
    }
  }

}; 