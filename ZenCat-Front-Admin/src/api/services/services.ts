import {
  Service,
  CreateServicePayload,
  UpdateServicePayload,
} from '@/types/service';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';

export const servicesApi = {
  getServices: async (): Promise<Service[]> => {
    const data = await apiClient.get<{ services: Service[] }>(API_ENDPOINTS.SERVICES.BASE);
    if (data && Array.isArray(data.services)) {
      return data.services;
    } else if (Array.isArray(data)) {
      return data as Service[];
    }
    console.error('Unexpected data structure from /service/ endpoint:', data);
    throw new Error('Unexpected data structure from services API for list');
  },

  getServiceById: async (id: string): Promise<Service> => {
    return apiClient.get<Service>(API_ENDPOINTS.SERVICES.BY_ID(id));
  },

  createService: async (payload: CreateServicePayload): Promise<Service> => {
    return apiClient.post<Service>(API_ENDPOINTS.SERVICES.BASE, payload);
  },

  updateService: async (
    id: string,
    payload: UpdateServicePayload,
  ): Promise<Service> => {
    return apiClient.patch<Service>(API_ENDPOINTS.SERVICES.BY_ID(id), payload);
  },

  deleteService: async (id: string): Promise<void> => {
    return apiClient.delete(API_ENDPOINTS.SERVICES.BY_ID(id));
  },

  bulkDeleteServices: async (ids: string[]): Promise<void> => {
    return apiClient.delete(API_ENDPOINTS.SERVICES.BULK_DELETE, { services: ids });
  },
};
