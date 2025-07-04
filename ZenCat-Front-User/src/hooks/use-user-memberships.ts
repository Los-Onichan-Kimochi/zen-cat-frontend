import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Membership } from '@/types/membership';
import { membershipService } from '@/api/membership/membership';

interface UseUserMembershipsState {
  memberships: Membership[];
  isLoading: boolean;
  error: string | null;
}

export function useUserMemberships() {
  const { user } = useAuth();
  const [state, setState] = useState<UseUserMembershipsState>({
    memberships: [],
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    const fetchMemberships = async () => {
      if (!user?.id) return;

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const data = await membershipService.getMembershipsByUserId(user.id);
        setState((prev) => ({
          ...prev,
          memberships: data,
          isLoading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : 'Error desconocido',
          isLoading: false,
        }));
      }
    };

    fetchMemberships();
  }, [user?.id]);

  return state;
} 