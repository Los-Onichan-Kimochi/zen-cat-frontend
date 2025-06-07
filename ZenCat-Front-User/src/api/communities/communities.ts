import { Community, UpdateCommunityPayload } from '@/types/community';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const communitiesApi = {
  getCommunities: async (): Promise<Community[]> => {
    const response = await fetch(`${API_BASE_URL}/community/`);
    if (!response.ok) {
      throw new Error('Error fetching professionals');
    }
    const data = await response.json();
    if (data && Array.isArray(data.communities)) {
      return data.communities;
    } else if (Array.isArray(data)) {
      return data;
    }
    console.error('Unexpected data structure from /community/ endpoint:', data);
    throw new Error('Unexpected data structure from communities API for list');
  },

  getCommunityById: async (id: string): Promise<Community> => {
    const response = await fetch(`${API_BASE_URL}/community/${id}/`);
    if (!response.ok) {
      throw new Error(`Error fetching community with id ${id}`);
    }
    return response.json();
  },

  updateCommunity: async (
    id: string,
    payload: UpdateCommunityPayload,
  ): Promise<Community> => {
    const response = await fetch(`${API_BASE_URL}/community/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Error updating community with id ${id}`);
    }
    return response.json();
  },
};
