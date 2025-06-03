import { Professional, CreateProfessionalPayload, UpdateProfessionalPayload } from '@/types/professional';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const professionalsApi = {
  getProfessionals: async (): Promise<Professional[]> => {
    const response = await fetch(`${API_BASE_URL}/professional/`);
    if (!response.ok) {
      throw new Error('Error fetching professionals');
    }
    const data = await response.json();
    if (data && Array.isArray(data.professionals)) {
      return data.professionals;
    } else if (Array.isArray(data)) {
      return data;
    }
    console.error('Unexpected data structure from /professional/ endpoint:', data);
    throw new Error('Unexpected data structure from professionals API for list');
  },

  getProfessionalById: async (id: string): Promise<Professional> => {
    const response = await fetch(`${API_BASE_URL}/professional/${id}/`);
    if (!response.ok) {
      throw new Error(`Error fetching professional with id ${id}`);
    }
    return response.json();
  },

  createProfessional: async (payload: CreateProfessionalPayload): Promise<Professional> => {
    const response = await fetch(`${API_BASE_URL}/professional/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error('Error creating professional');
    }
    return response.json();
  },

  updateProfessional: async (id: string, payload: UpdateProfessionalPayload): Promise<Professional> => {
    const response = await fetch(`${API_BASE_URL}/professional/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Error updating professional with id ${id}`);
    }
    return response.json();
  },

  deleteProfessional: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/professional/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Error deleting professional with id ${id}`);
    }
  },

  bulkDeleteProfessionals: async (ids: string[]): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/professional/bulk-delete/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ professionals: ids }),
    });
    if (!response.ok) {
      throw new Error('Error bulk deleting professionals');
    }
  }
};

