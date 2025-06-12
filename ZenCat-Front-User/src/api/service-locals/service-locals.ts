const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface ServiceLocal {
  id: string;
  service_id: string;
  local_id: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  updated_by: string;
}

export interface CreateServiceLocalRequest {
  service_id: string;
  local_id: string;
}

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
    const response = await fetch(`${API_BASE_URL}/service-local/`);
    if (!response.ok) {
      throw new Error('Error fetching service-local associations');
    }

    const data = await response.json();
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
    const response = await fetch(
      `${API_BASE_URL}/service-local/${serviceId}/${localId}/`,
    );
    if (!response.ok) {
      throw new Error(
        `Error fetching service-local association for service ${serviceId} and local ${localId}`,
      );
    }
    return await response.json();
  },

  // Create a new service-local association
  createServiceLocal: async (
    request: CreateServiceLocalRequest,
  ): Promise<ServiceLocal> => {
    const response = await fetch(`${API_BASE_URL}/service-local/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error('Error creating service-local association');
    }
    return await response.json();
  },

  // Delete a service-local association
  deleteServiceLocal: async (
    serviceId: string,
    localId: string,
  ): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}/service-local/${serviceId}/${localId}/`,
      {
        method: 'DELETE',
      },
    );
    if (!response.ok) {
      throw new Error(
        `Error deleting service-local association for service ${serviceId} and local ${localId}`,
      );
    }
  },

  // Get locals available for a specific service
  getLocalsForService: async (serviceId: string): Promise<ServiceLocal[]> => {
    return serviceLocalsApi.getServiceLocals([serviceId]);
  },

  // Get services available at a specific local
  getServicesForLocal: async (localId: string): Promise<ServiceLocal[]> => {
    return serviceLocalsApi.getServiceLocals(undefined, [localId]);
  },
};
