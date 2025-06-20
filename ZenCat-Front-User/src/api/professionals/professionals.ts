import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';

export interface Professional {
  id: string;
  name: string;
  first_last_name: string;
  second_last_name?: string;
  specialty: string;
  email: string;
  phone_number: string;
  type: string;
  image_url: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  updated_by: string;
}

export interface ProfessionalsResponse {
  professionals: Professional[];
}

export interface CreateProfessionalRequest {
  name: string;
  first_last_name: string;
  second_last_name?: string;
  specialty: string;
  email: string;
  phone_number: string;
  type: string;
  image_url?: string;
}

export interface UpdateProfessionalRequest {
  name?: string;
  first_last_name?: string;
  second_last_name?: string;
  specialty?: string;
  email?: string;
  phone_number?: string;
  type?: string;
  image_url?: string;
}

export const professionalsApi = {
  // Get all professionals with optional filters
  getProfessionals: async (
    names?: string[],
    types?: string[],
    specialties?: string[],
  ): Promise<Professional[]> => {
    const params = new URLSearchParams();

    if (names && names.length > 0) {
      params.append('names', names.join(','));
    }
    if (types && types.length > 0) {
      params.append('types', types.join(','));
    }
    if (specialties && specialties.length > 0) {
      params.append('specialties', specialties.join(','));
    }

    const endpoint = `${API_ENDPOINTS.PROFESSIONALS.BASE}?${params}`;
    const data = await apiClient.get<{ professionals: Professional[] }>(
      endpoint,
    );

    if (data && typeof data === 'object' && 'professionals' in data) {
      return data.professionals;
    }
    console.error(
      'Unexpected data structure from /professional/ endpoint:',
      data,
    );
    throw new Error('Unexpected data structure from professionals API');
  },

  // Get a specific professional by ID
  getProfessional: async (professionalId: string): Promise<Professional> => {
    return apiClient.get<Professional>(
      API_ENDPOINTS.PROFESSIONALS.BY_ID(professionalId),
    );
  },

  // Create a new professional
  createProfessional: async (
    request: CreateProfessionalRequest,
  ): Promise<Professional> => {
    return apiClient.post<Professional>(
      API_ENDPOINTS.PROFESSIONALS.BASE,
      request,
    );
  },

  // Update a professional
  updateProfessional: async (
    professionalId: string,
    request: UpdateProfessionalRequest,
  ): Promise<Professional> => {
    return apiClient.patch<Professional>(
      API_ENDPOINTS.PROFESSIONALS.BY_ID(professionalId),
      request,
    );
  },

  // Delete a professional
  deleteProfessional: async (professionalId: string): Promise<void> => {
    return apiClient.delete<void>(
      API_ENDPOINTS.PROFESSIONALS.BY_ID(professionalId),
    );
  },
};
