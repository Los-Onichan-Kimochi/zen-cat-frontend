import {
  BulkCreateProfessionalPayload,
  Professional,
  CreateProfessionalPayload,
  UpdateProfessionalPayload,
  BulkDeleteProfessionalPayload,
  ProfessionalWithImage,
} from '@/types/professional';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';

export const professionalsApi = {
  getProfessionals: async (): Promise<Professional[]> => {
    const data = await apiClient.get<any>(API_ENDPOINTS.PROFESSIONALS.BASE);
    if (data && Array.isArray(data.professionals)) {
      return data.professionals;
    } else if (Array.isArray(data)) {
      return data;
    }
    console.error(
      'Unexpected data structure from /professional/ endpoint:',
      data,
    );
    throw new Error(
      'Unexpected data structure from professionals API for list',
    );
  },

  getProfessionalById: async (id: string): Promise<Professional> => {
    return apiClient.get<Professional>(API_ENDPOINTS.PROFESSIONALS.BY_ID(id));
  },

  getProfessionalWithImage: async (
    id: string,
  ): Promise<ProfessionalWithImage> => {
    return apiClient.get<ProfessionalWithImage>(
      API_ENDPOINTS.PROFESSIONALS.WITH_IMAGE(id),
    );
  },

  createProfessional: async (
    payload: CreateProfessionalPayload,
  ): Promise<Professional> => {
    return apiClient.post<Professional>(
      API_ENDPOINTS.PROFESSIONALS.BASE,
      payload,
    );
  },

  updateProfessional: async (
    id: string,
    payload: UpdateProfessionalPayload,
  ): Promise<Professional> => {
    return apiClient.patch<Professional>(
      API_ENDPOINTS.PROFESSIONALS.BY_ID(id),
      payload,
    );
  },

  deleteProfessional: async (id: string): Promise<void> => {
    return apiClient.delete(API_ENDPOINTS.PROFESSIONALS.BY_ID(id));
  },

  bulkDeleteProfessionals: async (
    payload: BulkDeleteProfessionalPayload,
  ): Promise<void> => {
    return apiClient.delete(API_ENDPOINTS.PROFESSIONALS.BULK_DELETE, payload);
  },

  bulkCreateProfessionals: async (
    payload: BulkCreateProfessionalPayload,
  ): Promise<Professional[]> => {
    const data = await apiClient.post<any>(
      API_ENDPOINTS.PROFESSIONALS.BULK_CREATE,
      payload,
    );
    return data.professionals || data;
  },
};
