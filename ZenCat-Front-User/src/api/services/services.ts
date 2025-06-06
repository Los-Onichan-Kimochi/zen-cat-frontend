import { Service, UpdateServicePayload } from '@/types/service';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const servicesApi = {
  getServices: async (): Promise<Service[]> => {
    const response = await fetch(`${API_BASE_URL}/service/`);
    if (!response.ok) {
      console.log(response);
      throw new Error('Error fetching services');
    }
    const data = await response.json();
    console.log(data);
    if (data && Array.isArray(data.services)) {
      return data.services;
    } else if (Array.isArray(data)) {
      return data;
    }
    console.error('Unexpected data structure from /service/ endpoint:', data);
    throw new Error('Unexpected data structure from services API for list');
  },

  getServiceById: async (id: string): Promise<Service> => {
    const response = await fetch(`${API_BASE_URL}/service/${id}/`);
    if (!response.ok) {
      throw new Error(`Error fetching service with id ${id}`);
    }
    return response.json();
  },

  updateService: async (
    id: string,
    payload: UpdateServicePayload,
  ): Promise<Service> => {
    const response = await fetch(`${API_BASE_URL}/service/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Error updating service with id ${id}`);
    }
    return response.json();
  },
};
