import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';
import { Community } from '@/components/communities/CommunityCard';
import { MembershipState } from '@/types/membership';
import { UpdateUserRequest, User } from '@/types/user';

// ========================
// TIPOS DE DATOS
// ========================

export interface UserOnboarding {
  id: string;
  document_type: 'DNI' | 'FOREIGNER_CARD' | 'PASSPORT';
  document_number: string;
  phone_number: string;
  birth_date: string | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
  city: string;
  postal_code: string;
  district: string;
  address: string;
}

export interface MembershipPlan {
  id: string;
  type: 'MONTHLY' | 'ANNUAL';
  fee: number;
  reservation_limit: number;
}

export interface CommunityData {
  id: string;
  name: string;
  purpose: string;
  image_url: string;
  number_subscriptions: number;
}

export interface Membership {
  id: string;
  description: string;
  start_date: string;
  end_date: string;
  status: MembershipState;
  reservations_used: number;
  community: CommunityData;
  plan: MembershipPlan;
}

export interface UserWithMemberships {
  id: string;
  email: string;
  name: string;
  first_last_name: string;
  second_last_name: string | null;
  password: string;
  image_url: string;
  rol: 'ADMINISTRATOR' | 'USER' | 'CLIENT';
  onboarding: UserOnboarding;
  memberships: Membership[];
}

// ========================
// SERVICIOS DE API
// ========================

export const userCommunitiesService = {
  /**
   * Get user by ID with memberships (admin only)
   */
  async getUserById(userId: string): Promise<UserWithMemberships> {
    const response = await apiClient.get<UserWithMemberships>(
      API_ENDPOINTS.USERS.BY_ID(userId),
    );
    return response;
  },

  /**
   * Get current user profile with memberships
   */
  async getCurrentUser(): Promise<UserWithMemberships> {
    // First get the user basic info
    const userResponse = await apiClient.get<UserWithMemberships>(
      API_ENDPOINTS.AUTH.ME,
    );

    // Then get the user's memberships separately
    const membershipsResponse = await apiClient.get<{
      memberships: Membership[];
    }>(API_ENDPOINTS.MEMBERSHIPS.BY_USER(userResponse.id));

    // Combine the data
    return {
      ...userResponse,
      memberships: membershipsResponse.memberships || [],
    };
  },

  /**
   * Update user profile
   */
  async updateUser(
    userId: string,
    userData: Partial<UpdateUserRequest>,
  ): Promise<User> {
    try {
      // Ensure we include the updated_by field
      const dataWithUpdatedBy = {
        ...userData,
        updated_by: userId, // Always include who's making the update
      };

      const response = await apiClient.patch<User>(
        API_ENDPOINTS.USERS.BY_ID(userId),
        dataWithUpdatedBy,
      );

      return response;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },
};

// ========================
// UTILIDADES DE TRANSFORMACIÓN
// ========================

/**
 * Map API membership status to frontend status
 */
function mapMembershipStatus(
  apiStatus: MembershipState,
): 'active' | 'suspended' | 'expired' | 'cancelled' {
  const statusMap = {
    [MembershipState.ACTIVE]: 'active' as const,
    [MembershipState.SUSPENDED]: 'suspended' as const,
    [MembershipState.EXPIRED]: 'expired' as const,
    [MembershipState.CANCELLED]: 'cancelled' as const, // Tratamos canceladas como expiradas para el frontend
  };

  return statusMap[apiStatus];
}

/**
 * Transform API membership data to frontend format
 * Shows both active and suspended memberships, prioritizing active ones
 */
export function transformMembershipsToFrontend(
  memberships: Membership[],
): Community[] {
  if (!memberships || memberships.length === 0) {
    return [];
  }

  const communityMap = new Map<string, Community>();

  memberships.forEach((membership) => {
    const communityId = membership.community.id;
    const transformedCommunity = {
      id: communityId,
      name: membership.community.name,
      image: membership.community.image_url,
      type: membership.community.purpose,
      status: mapMembershipStatus(membership.status),
      membershipId: membership.id,
      startDate: membership.start_date,
      endDate: membership.end_date,
      planType: membership.plan.type,
      fee: membership.plan.fee,
      reservationLimit: membership.plan.reservation_limit,
      reservationsUsed: membership.reservations_used,
    };

    // Include active and suspended memberships only
    if (transformedCommunity.status === 'active' || transformedCommunity.status === 'suspended') {
      const existingCommunity = communityMap.get(communityId);
      
      if (!existingCommunity) {
        // No existing community, add this one
        communityMap.set(communityId, transformedCommunity);
      } else if (transformedCommunity.status === 'active' && existingCommunity.status === 'suspended') {
        // Replace suspended with active (prioritize active)
        communityMap.set(communityId, transformedCommunity);
      }
      // If existing is active and current is suspended, keep the active one (do nothing)
    }
  });

  return Array.from(communityMap.values());
}

/**
 * Get status display text in Spanish
 */
export function getStatusDisplayText(
  status: 'active' | 'suspended' | 'expired' | 'cancelled',
): string {
  const statusText = {
    active: 'Membresía activa',
    suspended: 'Membresía suspendida',
    expired: 'Membresía vencida',
    cancelled: 'Membresía cancelada',
  };

  return statusText[status];
}

// ========================
// HOOK PERSONALIZADO
// ========================

export function useUserCommunities(userId?: string) {
  const [user, setUser] = useState<UserWithMemberships | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Always use getCurrentUser for regular users
    // Only use getUserById if specifically needed for admin functionality
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔄 Fetching user communities data...');

        // Always use /me/ endpoint for user's own data
        const userData = await userCommunitiesService.getCurrentUser();

        console.log('✅ User data fetched successfully:', userData);

        setUser(userData);
        setMemberships(userData.memberships || []);

        const transformedCommunities = transformMembershipsToFrontend(
          userData.memberships || [],
        );
        setCommunities(transformedCommunities);

        console.log('✅ Communities transformed:', transformedCommunities);
      } catch (err) {
        console.error('❌ Error fetching user communities:', err);
        setError(
          `Error del API: ${err instanceof Error ? err.message : 'Error desconocido'}`,
        );
        setCommunities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]); // Keep userId in dependency array for potential future use

  const refreshUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Refreshing user data...');

      // Always use getCurrentUser for refresh
      const userData = await userCommunitiesService.getCurrentUser();

      setUser(userData);
      setMemberships(userData.memberships || []);
      setCommunities(
        transformMembershipsToFrontend(userData.memberships || []),
      );

      console.log('✅ User data refreshed successfully');
    } catch (err) {
      console.error('❌ Error refreshing user data:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Error al actualizar los datos del usuario',
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    memberships,
    communities,
    loading,
    error,
    refreshUserData,
  };
}
