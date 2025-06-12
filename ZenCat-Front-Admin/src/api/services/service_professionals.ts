import {
  ServiceProfessional,
  CreateServiceProfessionalRequest,
  DeleteServiceProfessionalRequest,
} from '@/types/service_professional';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';

export const serviceProfessionalApi = {
  // List all associations (optionally filtered)
  fetchServiceProfessionals: async (params?: {
    serviceId?: string;
    professionalId?: string;
  }): Promise<ServiceProfessional[]> => {
    const query = new URLSearchParams();
    if (params?.serviceId) query.append('serviceId', params.serviceId);
    if (params?.professionalId)
      query.append('professionalId', params.professionalId);

    const endpoint = `${API_ENDPOINTS.SERVICE_PROFESSIONALS.BASE}?${query.toString()}`;
    const data = await apiClient.get<any>(endpoint);
    
    if (data && Array.isArray(data.service_professionals)) {
      return data.service_professionals;
    } else if (Array.isArray(data)) {
      return data;
    }
    throw new Error('Unexpected data structure from service-professional API');
  },

  // Get a specific association
  getServiceProfessional: async (
    serviceId: string,
    professionalId: string,
  ): Promise<ServiceProfessional> => {
    return apiClient.get<ServiceProfessional>(
      API_ENDPOINTS.SERVICE_PROFESSIONALS.BY_IDS(serviceId, professionalId)
    );
  },

  // Create a new association
  createServiceProfessional: async (
    payload: CreateServiceProfessionalRequest,
  ): Promise<ServiceProfessional> => {
    return apiClient.post<ServiceProfessional>(
      API_ENDPOINTS.SERVICE_PROFESSIONALS.BASE,
      payload
    );
  },

  // Bulk create
  bulkCreateServiceProfessionals: async (payload: {
    service_professionals: CreateServiceProfessionalRequest[];
  }): Promise<ServiceProfessional[]> => {
    const data = await apiClient.post<any>(
      API_ENDPOINTS.SERVICE_PROFESSIONALS.BULK,
      payload
    );
    return data.service_professionals;
  },

  // Delete one
  deleteServiceProfessional: async (
    serviceId: string,
    professionalId: string,
  ): Promise<void> => {
    return apiClient.delete<void>(
      API_ENDPOINTS.SERVICE_PROFESSIONALS.BY_IDS(serviceId, professionalId)
    );
  },

  // Bulk delete
  bulkDeleteServiceProfessionals: async (payload: {
    service_professionals: DeleteServiceProfessionalRequest[];
  }): Promise<void> => {
    return apiClient.delete<void>(
      API_ENDPOINTS.SERVICE_PROFESSIONALS.BULK,
      payload
    );
  },
};
