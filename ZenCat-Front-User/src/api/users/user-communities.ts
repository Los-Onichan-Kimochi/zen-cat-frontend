import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';
import { Community } from '@/components/communities/CommunityCard';

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
    status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
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
     * Get user by ID with memberships
     */
    async getUserById(userId: string): Promise<UserWithMemberships> {
        const response = await apiClient.get<UserWithMemberships>(
            API_ENDPOINTS.USERS.BY_ID(userId)
        );
        return response;
    },

    /**
     * Get current user profile with memberships
     */
    async getCurrentUser(): Promise<UserWithMemberships> {
        const response = await apiClient.get<UserWithMemberships>(
            API_ENDPOINTS.AUTH.ME
        );
        return response;
    },
};

// ========================
// UTILIDADES DE TRANSFORMACIÓN
// ========================

/**
 * Map API membership status to frontend status
 */
function mapMembershipStatus(apiStatus: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED'): 'active' | 'suspended' | 'expired' {
    const statusMap = {
        'ACTIVE': 'active' as const,
        'SUSPENDED': 'suspended' as const,
        'EXPIRED': 'expired' as const,
    };

    return statusMap[apiStatus];
}

/**
 * Transform API membership data to frontend format
 */
export function transformMembershipsToFrontend(memberships: Membership[]): Community[] {
    if (!memberships || memberships.length === 0) {
        return [];
    }

    return memberships.map((membership) => {
        return {
            id: membership.community.id,
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
        };
    });
}

/**
 * Get status display text in Spanish
 */
export function getStatusDisplayText(status: 'active' | 'suspended' | 'expired'): string {
    const statusText = {
        active: 'Membresía activa',
        suspended: 'Membresía suspendida',
        expired: 'Membresía vencida',
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
        if (!userId) {
            setLoading(false);
            setError('No se proporcionó ID de usuario');
            return;
        }

        const fetchUserData = async () => {
            try {
                setLoading(true);
                setError(null);

                const userData = await userCommunitiesService.getUserById(userId);

                setUser(userData);
                setMemberships(userData.memberships || []);

                const transformedCommunities = transformMembershipsToFrontend(userData.memberships || []);
                setCommunities(transformedCommunities);
            } catch (err) {
                setError(`Error del API: ${err instanceof Error ? err.message : 'Error desconocido'}`);
                setCommunities([]);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId]);

    const refreshUserData = async () => {
        try {
            setLoading(true);
            setError(null);

            let userData: UserWithMemberships;

            if (userId) {
                userData = await userCommunitiesService.getUserById(userId);
            } else {
                userData = await userCommunitiesService.getCurrentUser();
            }

            setUser(userData);
            setMemberships(userData.memberships || []);
            setCommunities(transformMembershipsToFrontend(userData.memberships || []));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al actualizar los datos del usuario');
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
