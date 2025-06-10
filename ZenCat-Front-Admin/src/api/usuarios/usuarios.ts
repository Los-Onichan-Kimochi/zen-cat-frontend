import { User, CreateUserPayload, UpdateUserPayload } from '@/types/user';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';

export const usuariosApi = {
  getUsuarios: async (): Promise<User[]> => {
    const data = await apiClient.get<any>(API_ENDPOINTS.USERS.BASE);
    
    // Intentar diferentes estructuras de respuesta
    if (data && Array.isArray(data.users)) {
      return data.users;
    } else if (data && Array.isArray(data.usuarios)) {
      return data.usuarios;
    } else if (Array.isArray(data)) {
      return data;
    }

    console.error('Unexpected data structure from /user/ endpoint:', data);
    throw new Error('Unexpected data structure from usuarios API for list');
  },

  getUsuarioById: async (id: string): Promise<User> => {
    return apiClient.get<User>(API_ENDPOINTS.USERS.BY_ID(id));
  },

  createUsuario: async (payload: CreateUserPayload): Promise<User> => {
    return apiClient.post<User>(API_ENDPOINTS.USERS.BASE, payload);
  },

  updateUsuario: async (
    id: string,
    payload: UpdateUserPayload,
  ): Promise<User> => {
    return apiClient.patch<User>(API_ENDPOINTS.USERS.BY_ID(id), payload);
  },

  deleteUsuario: async (id: string): Promise<void> => {
    return apiClient.delete(API_ENDPOINTS.USERS.BY_ID(id));
  },

  bulkDeleteUsuarios: async (ids: string[]): Promise<void> => {
    return apiClient.delete(API_ENDPOINTS.USERS.BULK_DELETE, { users: ids });
  },
};
