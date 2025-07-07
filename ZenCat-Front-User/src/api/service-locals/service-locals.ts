import {
  ServiceLocal,
  CreateServiceLocalRequest,
} from '@/types/service_local';
import { apiClient } from '@/lib/api-client';
import { Local } from '@/types/local';
import { API_ENDPOINTS } from '@/config/api';

export interface ServiceLocalsResponse {
  service_locals: ServiceLocal[];
}

export const serviceLocalsApi = {
  // Get all service-local associations with optional filters
  getServiceLocals: async (
    serviceIds?: string[],
    localIds?: string[],
  ): Promise<ServiceLocal[]> => {
    // TODO: Backend not filtering correctly by query parameters, implementing manual filtering
    const data = await apiClient.get<{ service_locals: ServiceLocal[] }>(
      '/service-local/',
    );

    let allServiceLocals: ServiceLocal[] = [];
    if (data && typeof data === 'object' && 'service_locals' in data) {
      allServiceLocals = data.service_locals;
    } else {
      console.error(
        'Unexpected data structure from /service-local/ endpoint:',
        data,
      );
      throw new Error('Unexpected data structure from service-locals API');
    }

    // Manual filtering since backend query parameters don't work properly
    let filteredResults = allServiceLocals;

    if (serviceIds && serviceIds.length > 0) {
      filteredResults = filteredResults.filter((sl) =>
        serviceIds.includes(sl.service_id),
      );
    }

    if (localIds && localIds.length > 0) {
      filteredResults = filteredResults.filter((sl) =>
        localIds.includes(sl.local_id),
      );
    }

    console.log(
      `Filtered ${filteredResults.length} service-locals from ${allServiceLocals.length} total. ServiceIds: ${serviceIds}, LocalIds: ${localIds}`,
    );

    return filteredResults;
  },

  // Get a specific service-local association
  getServiceLocal: async (
    serviceId: string,
    localId: string,
  ): Promise<ServiceLocal> => {
    return apiClient.get<ServiceLocal>(
      `/service-local/${serviceId}/${localId}/`,
    );
  },

  // Create a new service-local association
  createServiceLocal: async (
    request: CreateServiceLocalRequest,
  ): Promise<ServiceLocal> => {
    return apiClient.post<ServiceLocal>('/service-local/', request);
  },

  // Delete a service-local association
  deleteServiceLocal: async (
    serviceId: string,
    localId: string,
  ): Promise<void> => {
    return apiClient.delete<void>(`/service-local/${serviceId}/${localId}/`);
  },

  // Get locals available for a specific service
  getLocalsForService: async (serviceId: string): Promise<ServiceLocal[]> => {
    return serviceLocalsApi.getServiceLocals([serviceId]);
  },

  // Get services available at a specific local
  getServicesForLocal: async (localId: string): Promise<ServiceLocal[]> => {
    return serviceLocalsApi.getServiceLocals(undefined, [localId]);
  },

  getLocalsByServiceId: async (serviceId: string): Promise<Local[]> => {
    const response = await apiClient.get<{ locals: Local[] }>(
      API_ENDPOINTS.SERVICE_LOCALS.BY_SERVICE_ID(serviceId),
    );

    const locals = Array.isArray(response.locals) ? response.locals : [];
    return locals;
  },
};
