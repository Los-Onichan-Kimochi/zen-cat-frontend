import { ServiceProfessional, CreateServiceProfessionalRequest, DeleteServiceProfessionalRequest } from '@/types/service_professional';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const serviceProfessionalApi = {
  // List all associations (optionally filtered)
  getServiceProfessionals: async (): Promise<ServiceProfessional[]> => {
    const response = await fetch(`${API_BASE_URL}/service-professional/`);
    if (!response.ok) throw new Error('Error fetching service-professionals');
    const data = await response.json();
    if (data && Array.isArray(data.service_professionals)) {
      return data.service_professionals;
    } else if (Array.isArray(data)) {
      return data;
    }
    throw new Error('Unexpected data structure from service-professional API');
  },

  // Get a specific association
  getServiceProfessional: async (serviceId: string, professionalId: string): Promise<ServiceProfessional> => {
    const response = await fetch(`${API_BASE_URL}/service-professional/${serviceId}/${professionalId}/`);
    if (!response.ok) throw new Error('Error fetching service-professional');
    return response.json();
  },

  // Create a new association
  createServiceProfessional: async (payload: CreateServiceProfessionalRequest): Promise<ServiceProfessional> => {
    const response = await fetch(`${API_BASE_URL}/service-professional/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Error creating service-professional');
    return response.json();
  },

  // Bulk create
  bulkCreateServiceProfessionals: async (payload: { service_professionals: CreateServiceProfessionalRequest[] }): Promise<ServiceProfessional[]> => {
    const response = await fetch(`${API_BASE_URL}/service-professional/bulk/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Error bulk creating service-professionals');
    const data = await response.json();
    return data.service_professionals;
  },

  // Delete one
  deleteServiceProfessional: async (serviceId: string, professionalId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/service-professional/${serviceId}/${professionalId}/`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error deleting service-professional');
  },

  // Bulk delete
  bulkDeleteServiceProfessionals: async (payload: { service_professionals: DeleteServiceProfessionalRequest[] }): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/service-professional/bulk/`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Error bulk deleting service-professionals');
  },
};