import {
  BulkCreateServicePayload,//para carga masiva
  Service,
  CreateServicePayload,
  UpdateServicePayload,
} from '@/types/service';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const servicesApi = {
  bulkCreateServices: async (payload: BulkCreateServicePayload) : Promise<Service[]> => {
    console.log('Payload enviado a /service/bulk-create:', payload);

    const response = await fetch(`${API_BASE_URL}/service/bulk-create/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload), // enviamos como { services: [...] }
    });

    console.log('Código de respuesta:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Respuesta del servidor:', errorText);
      throw new Error('Error al cargar servicios masivamente');
    }

    return response.json();
  },

  getServices: async (): Promise<Service[]> => {
    const response = await fetch(`${API_BASE_URL}/service/`);
    if (!response.ok) {
      throw new Error('Error fetching services');
    }
    const data = await response.json();
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

  createService: async (payload: CreateServicePayload): Promise<Service> => {
    const response = await fetch(`${API_BASE_URL}/service/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error('Error creating service');
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

  deleteService: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/service/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Error deleting service with id ${id}`);
    }
  },

  bulkDeleteServices: async (ids: string[]): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/service/bulk-delete/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ services: ids }),
    });
    if (!response.ok) {
      throw new Error('Error bulk deleting services');
    }
  },
};
