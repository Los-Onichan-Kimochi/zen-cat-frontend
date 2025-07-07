import { API_ENDPOINTS } from '@/config/api';
import { apiClient } from '@/lib/api-client';
import { Professional } from '@/types/professional';
import {
  ServiceProfessional,
  CreateServiceProfessionalRequest,
} from '@/types/service_professional';

export const serviceProfessionalsApi = {
  // Get all service-professional associations with optional filters
  getServiceProfessionals: async (
    serviceIds?: string[],
    professionalIds?: string[],
  ): Promise<ServiceProfessional[]> => {
    const params = new URLSearchParams();

    if (serviceIds && serviceIds.length > 0) {
      params.append('serviceId', serviceIds.join(','));
    }
    if (professionalIds && professionalIds.length > 0) {
      params.append('professionalId', professionalIds.join(','));
    }
    const endpoint = `/service-professional/?${params}`;
    const data = await apiClient.get<{
      service_professionals: ServiceProfessional[];
    }>(endpoint);

    if (data && typeof data === 'object' && 'service_professionals' in data) {
      return data.service_professionals;
    }
    console.error(
      'Unexpected data structure from /service-professional/ endpoint:',
      data,
    );
    throw new Error('Unexpected data structure from service-professionals API');
  },

  // Get a specific service-professional association
  getServiceProfessional: async (
    serviceId: string,
    professionalId: string,
  ): Promise<ServiceProfessional> => {
    return apiClient.get<ServiceProfessional>(
      `/service-professional/${serviceId}/${professionalId}/`,
    );
  },

  // Create a new service-professional association
  createServiceProfessional: async (
    request: CreateServiceProfessionalRequest,
  ): Promise<ServiceProfessional> => {
    return apiClient.post<ServiceProfessional>(
      '/service-professional/',
      request,
    );
  },

  // Delete a service-professional association
  deleteServiceProfessional: async (
    serviceId: string,
    professionalId: string,
  ): Promise<void> => {
    return apiClient.delete<void>(
      `/service-professional/${serviceId}/${professionalId}/`,
    );
  },

  // Get professionals available for a specific service
  getProfessionalsForService: async (
    serviceId: string,
  ): Promise<ServiceProfessional[]> => {
    return serviceProfessionalsApi.getServiceProfessionals([serviceId]);
  },

  // Get services handled by a specific professional
  getServicesForProfessional: async (
    professionalId: string,
  ): Promise<ServiceProfessional[]> => {
    return serviceProfessionalsApi.getServiceProfessionals(undefined, [
      professionalId,
    ]);
  },

  getProfessionalsByServiceId: async (serviceId: string): Promise<Professional[]> => {
    const response = await apiClient.get<{ professionals: Professional[] }>(
      API_ENDPOINTS.SERVICE_PROFESSIONALS.BY_SERVICE_ID(serviceId),
    );

    const professionals = Array.isArray(response.professionals) ? response.professionals : [];
    return professionals;
  },
};
