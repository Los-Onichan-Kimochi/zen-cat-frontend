import {
  ServiceLocal,
  CreateServiceLocalRequest,
  DeleteServiceLocalRequest,
} from '@/types/service_local';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';

export const serviceLocalApi = {
  // List all associations (optionally filtered)
  fetchServiceLocals: async (params?: {
    serviceId?: string;
    localId?: string;
  }): Promise<ServiceLocal[]> => {
    const query = new URLSearchParams();
    if (params?.serviceId) query.append('serviceId', params.serviceId);
    if (params?.localId) query.append('localId', params.localId);

    const endpoint = `${API_ENDPOINTS.SERVICE_LOCALS.BASE}?${query.toString()}`;
    const data = await apiClient.get<any>(endpoint);

    if (data && Array.isArray(data.service_locals)) {
      return data.service_locals;
    } else if (Array.isArray(data)) {
      return data;
    }
    throw new Error('Unexpected data structure from service-local API');
  },

  // Get a specific association
  getServiceLocal: async (
    serviceId: string,
    localId: string,
  ): Promise<ServiceLocal> => {
    return apiClient.get<ServiceLocal>(
      API_ENDPOINTS.SERVICE_LOCALS.BY_IDS(serviceId, localId),
    );
  },

  // Create a new association
  createServiceLocal: async (
    payload: CreateServiceLocalRequest,
  ): Promise<ServiceLocal> => {
    return apiClient.post<ServiceLocal>(
      API_ENDPOINTS.SERVICE_LOCALS.BASE,
      payload,
    );
  },

  // Bulk create
  bulkCreateServiceLocals: async (payload: {
    service_locals: CreateServiceLocalRequest[];
  }): Promise<ServiceLocal[]> => {
    const data = await apiClient.post<any>(
      API_ENDPOINTS.SERVICE_LOCALS.BULK,
      payload,
    );
    return data.service_locals;
  },

  // Delete one
  deleteServiceLocal: async (
    serviceId: string,
    localId: string,
  ): Promise<void> => {
    return apiClient.delete<void>(
      API_ENDPOINTS.SERVICE_LOCALS.BY_IDS(serviceId, localId),
    );
  },

  // Bulk delete
  bulkDeleteServiceLocals: async (payload: {
    service_locals: DeleteServiceLocalRequest[];
  }): Promise<void> => {
    return apiClient.delete<void>(API_ENDPOINTS.SERVICE_LOCALS.BULK, payload);
  },
};
