const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface ServiceProfessional {
  id: string;
  service_id: string;
  professional_id: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  updated_by: string;
}

export interface CreateServiceProfessionalRequest {
  service_id: string;
  professional_id: string;
}

export interface ServiceProfessionalsResponse {
  service_professionals: ServiceProfessional[];
}

export const serviceProfessionalsApi = {
  // Get all service-professional associations with optional filters
  getServiceProfessionals: async (
    serviceIds?: string[],
    professionalIds?: string[],
  ): Promise<ServiceProfessional[]> => {
    const params = new URLSearchParams();

    if (serviceIds && serviceIds.length > 0) {
      params.append('service_ids', serviceIds.join(','));
    }
    if (professionalIds && professionalIds.length > 0) {
      params.append('professional_ids', professionalIds.join(','));
    }

    const response = await fetch(
      `${API_BASE_URL}/service-professional/?${params}`,
    );
    if (!response.ok) {
      throw new Error('Error fetching service-professional associations');
    }

    const data = await response.json();
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
    const response = await fetch(
      `${API_BASE_URL}/service-professional/${serviceId}/${professionalId}/`,
    );
    if (!response.ok) {
      throw new Error(
        `Error fetching service-professional association for service ${serviceId} and professional ${professionalId}`,
      );
    }
    return await response.json();
  },

  // Create a new service-professional association
  createServiceProfessional: async (
    request: CreateServiceProfessionalRequest,
  ): Promise<ServiceProfessional> => {
    const response = await fetch(`${API_BASE_URL}/service-professional/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error('Error creating service-professional association');
    }
    return await response.json();
  },

  // Delete a service-professional association
  deleteServiceProfessional: async (
    serviceId: string,
    professionalId: string,
  ): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}/service-professional/${serviceId}/${professionalId}/`,
      {
        method: 'DELETE',
      },
    );
    if (!response.ok) {
      throw new Error(
        `Error deleting service-professional association for service ${serviceId} and professional ${professionalId}`,
      );
    }
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
};
