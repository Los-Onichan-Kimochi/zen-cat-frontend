import { useState, useEffect, useCallback } from 'react';
import { communitiesApi } from '@/api/communities/communities';
import { Community } from '@/types/community';

interface UseCommunitiesState {
  communities: Community[];
  isLoading: boolean;
  error: string | null;
}

export function useCommunities() {
  const [state, setState] = useState<UseCommunitiesState>({
    communities: [],
    isLoading: false,
    error: null,
  });

  const fetchCommunities = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('🏘️ Fetching communities from backend...');
      const communities = await communitiesApi.getCommunities();

      console.log('✅ Communities fetched successfully:', communities);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        communities,
      }));

      return communities;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al obtener comunidades';
      console.error('❌ Error fetching communities:', error);

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      return [];
    }
  }, []);

  const getCommunityById = useCallback(
    async (id: string): Promise<Community | null> => {
      try {
        console.log('🔍 Fetching community by ID:', id);
        const community = await communitiesApi.getCommunityById(id);
        console.log('✅ Community fetched:', community);
        return community;
      } catch (error) {
        console.error('❌ Error fetching community by ID:', error);
        return null;
      }
    },
    [],
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Auto-fetch communities on mount
  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  return {
    ...state,
    fetchCommunities,
    getCommunityById,
    clearError,
  };
}
