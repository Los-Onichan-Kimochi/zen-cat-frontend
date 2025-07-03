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
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.MEMBERSHIPS.BY_USER(userId)}`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token JWT inválido o faltante');
        } else if (response.status === 422) {
          throw new Error('UUID del usuario inválido');
        } else if (response.status === 500) {
          throw new Error('Error interno del servidor');
        }
        
        const errorData = await response.json().catch(() => null);
        throw new Error(
          `Error fetching user memberships: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      console.log('Raw user memberships data:', data);

      // El API puede retornar una lista vacía si no hay membresías
      if (Array.isArray(data)) {
        return data;
      } else if (data && Array.isArray(data.memberships)) {
        return data.memberships;
      } else {
        // Si no hay membresías, retornar array vacío
        return [];
      }
    } catch (error) {
      console.error('Error in getUserMemberships:', error);
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
}; 