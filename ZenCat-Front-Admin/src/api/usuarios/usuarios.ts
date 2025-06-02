import { User, CreateUserPayload, UpdateUserPayload } from "@/types/user";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Función auxiliar para obtener los headers comunes
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const usuariosApi = {
  getUsuarios: async (): Promise<User[]> => {
    try {
      console.log('Fetching usuarios from:', `${API_BASE_URL}/user/`);
      const response = await fetch(`${API_BASE_URL}/user/`, {
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', response.status, errorData);
        throw new Error(`Error fetching usuarios: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Received data:', data);

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
    } catch (error) {
      console.error('Error in getUsuarios:', error);
      throw error;
    }
  },

  getUsuarioById: async (id: string): Promise<User> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${id}/`, {
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', response.status, errorData);
        throw new Error(`Error fetching usuario with id ${id}: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error in getUsuarioById:', error);
      throw error;
    }
  },

  createUsuario: async (payload: CreateUserPayload): Promise<User> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', response.status, errorData);
        throw new Error(`Error creating usuario: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error in createUsuario:', error);
      throw error;
    }
  },

  updateUsuario: async (id: string, payload: UpdateUserPayload): Promise<User> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${id}/`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', response.status, errorData);
        throw new Error(`Error updating usuario with id ${id}: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error in updateUsuario:', error);
      throw error;
    }
  },

  deleteUsuario: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${id}/`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', response.status, errorData);
        throw new Error(`Error deleting usuario with id ${id}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error in deleteUsuario:', error);
      throw error;
    }
  },

  bulkDeleteUsuarios: async (ids: string[]): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/bulk-delete/`, {
        method: 'DELETE',
        headers: getHeaders(),
        body: JSON.stringify({ users: ids }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', response.status, errorData);
        throw new Error(`Error bulk deleting usuarios: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error in bulkDeleteUsuarios:', error);
      throw error;
    }
  }
};

