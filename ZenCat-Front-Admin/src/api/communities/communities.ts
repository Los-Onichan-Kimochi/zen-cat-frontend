import { Community , CreateCommunityPayload, UpdateCommunityPayload } from '@/types/community';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const communitiesApi = {

  createCommunity: async (payload: CreateCommunityPayload): Promise<Community> => {
    const response = await fetch(`${API_BASE_URL}/community/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error('Error creating community');
    }
    return response.json(); 
  },

  bulkCreateCommunities: async (communities: CreateCommunityPayload[]): Promise<Community[]> => {
    const response = await fetch(`${API_BASE_URL}/community/bulk-create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ communities }),
    });
    if (!response.ok) {
      throw new Error('Error creating community');
    }
    return response.json(); 
  },

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

  updateCommunity: async (id: string, payload: UpdateCommunityPayload): Promise<Community> => {
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

  deleteCommunity: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/community/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Error deleting community with id ${id}`);
    }
  },

  bulkDeleteCommunities: async (ids: string[]): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/community/bulk-delete/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ communities: ids }),
    });
    if (!response.ok) {
      throw new Error('Error bulk deleting communities');
    }
  }

}; 