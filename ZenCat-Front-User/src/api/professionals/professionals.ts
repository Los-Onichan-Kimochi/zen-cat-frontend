const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

    const response = await fetch(`${API_BASE_URL}/professional/?${params}`);
    if (!response.ok) {
      throw new Error('Error fetching professionals');
    }

    const data = await response.json();
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
    const response = await fetch(
      `${API_BASE_URL}/professional/${professionalId}/`,
    );
    if (!response.ok) {
      throw new Error(`Error fetching professional with id ${professionalId}`);
    }
    return await response.json();
  },

  // Create a new professional
  createProfessional: async (
    request: CreateProfessionalRequest,
  ): Promise<Professional> => {
    const response = await fetch(`${API_BASE_URL}/professional/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error('Error creating professional');
    }
    return await response.json();
  },

  // Update a professional
  updateProfessional: async (
    professionalId: string,
    request: UpdateProfessionalRequest,
  ): Promise<Professional> => {
    const response = await fetch(
      `${API_BASE_URL}/professional/${professionalId}/`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      },
    );
    if (!response.ok) {
      throw new Error(`Error updating professional with id ${professionalId}`);
    }
    return await response.json();
  },

  // Delete a professional
  deleteProfessional: async (professionalId: string): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}/professional/${professionalId}/`,
      {
        method: 'DELETE',
      },
    );
    if (!response.ok) {
      throw new Error(`Error deleting professional with id ${professionalId}`);
    }
  },
};
