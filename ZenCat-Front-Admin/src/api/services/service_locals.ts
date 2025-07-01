import {
  ServiceLocal,
  CreateServiceLocalRequest,
  DeleteServiceLocalRequest,
} from '@/types/service_local';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const serviceLocalApi = {
  // List all associations (optionally filtered)
  fetchServiceLocals: async (
    params?: { serviceId?: string; localId?: string }
  ): Promise<ServiceLocal[]> => {
    const query = new URLSearchParams();
    if (params?.serviceId) query.append('serviceId', params.serviceId);
    if (params?.localId) query.append('localId', params.localId);

    const response = await fetch(
      `${API_BASE_URL}/service-local/?${query.toString()}`
    );
    if (!response.ok) throw new Error('Error fetching service-locals');
    const data = await response.json();
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
    const response = await fetch(
      `${API_BASE_URL}/service-local/${serviceId}/${localId}/`,
    );
    if (!response.ok) throw new Error('Error fetching service-local');
    return response.json();
  },

  // Create a new association
  createServiceLocal: async (
    payload: CreateServiceLocalRequest,
  ): Promise<ServiceLocal> => {
    const response = await fetch(`${API_BASE_URL}/service-local/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Error creating service-local');
    return response.json();
  },

  // Bulk create
  bulkCreateServiceLocals: async (payload: {
    service_locals: CreateServiceLocalRequest[];
  }): Promise<ServiceLocal[]> => {
    const response = await fetch(`${API_BASE_URL}/service-local/bulk/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok)
      throw new Error('Error bulk creating service-locals');
    const data = await response.json();
    return data.service_locals;
  },

  // Delete one
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
    if (!response.ok) throw new Error('Error deleting service-local');
  },

  // Bulk delete
  bulkDeleteServiceLocals: async (payload: {
    service_locals: DeleteServiceLocalRequest[];
  }): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/service-local/bulk/`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok)
      throw new Error('Error bulk deleting service-locals');
  },
};