import Cookies from 'js-cookie';
import { API_ENDPOINTS } from '@/config/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Función auxiliar para obtener los headers comunes
const getHeaders = () => {
  const token = Cookies.get('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Tipo para las membresías de usuario
export interface UserMembership {
  id: string;
  user_id: string;
  plan_id: string;
  community_id: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'inactive' | 'suspended' | 'expired';
  plan?: {
    id: string;
    type: string;
    fee: number;
    reservation_limit?: number | null;
  };
  community?: {
    id: string;
    name: string;
    purpose: string;
  };
}

export const membershipsApi = {
  getUserMemberships: async (userId: string): Promise<UserMembership[]> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.MEMBERSHIPS.BY_USER(userId)}`,
        {
          method: 'GET',
          headers: getHeaders(),
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token JWT inválido o faltante');
        } else if (response.status === 422) {
          throw new Error('ID de usuario no válido');
        } else {
          throw new Error(`Error al obtener membresías: ${response.status}`);
        }
      }

      const data = await response.json();
      return data.memberships || [];
    } catch (error: any) {
      console.error('Error fetching user memberships:', error);
      throw error;
    }
  },
  // Nueva función: actualizar estado de la membresía
  updateMembershipStatus: async (
    membershipId: string,
    status: 'active' | 'inactive' | 'suspended' | 'expired',
  ): Promise<UserMembership> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.MEMBERSHIPS.BASE}${membershipId}/`,
        {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify({ status }),
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token JWT inválido o faltante');
        } else if (response.status === 422) {
          throw new Error('UUID de membresía inválido');
        } else if (response.status === 500) {
          throw new Error('Error interno del servidor');
        }
        throw new Error(
          `Error actualizando membresía: ${response.status} ${response.statusText}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Error in updateMembershipStatus:', error);
      throw error;
    }
  },
  // Obtener usuarios con membresías activas en una comunidad
  getUsersByCommunity: async (communityId: string): Promise<{ users: Array<any> }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.MEMBERSHIPS.USERS_BY_COMMUNITY(communityId)}`,
        {
          method: 'GET',
          headers: getHeaders(),
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token JWT inválido o faltante');
        } else if (response.status === 422) {
          throw new Error('UUID de la comunidad inválido');
        } else if (response.status === 500) {
          throw new Error('Error interno del servidor');
        }

        throw new Error(
          `Error fetching users by community: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in getUsersByCommunity:', error);
      throw error;
    }
  },
  getMembershipByUserAndCommunity: async (userId: string, communityId: string): Promise<UserMembership> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.MEMBERSHIPS.BY_USER_AND_COMMUNITY(userId, communityId)}`,
        {
          method: 'GET',
          headers: getHeaders(),
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token JWT inválido o faltante');
        } else if (response.status === 422) {
          throw new Error('ID de usuario o comunidad no válido');
        } else if (response.status === 404) {
          throw new Error('Membresía no encontrada');
        } else {
          throw new Error(`Error al obtener membresía: ${response.status}`);
        }
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error fetching user-community membership:', error);
      throw error;
    }
  },
};
