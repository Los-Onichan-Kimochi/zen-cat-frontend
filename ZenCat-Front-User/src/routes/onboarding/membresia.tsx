import { createFileRoute } from '@tanstack/react-router';
import { MembershipOnboarding } from '@/components/ui/membership/MembershipOnboarding';
import { MembershipOnboardingProvider } from '@/context/MembershipOnboardingContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useCommunities } from '@/hooks/use-communities';
import { useCommunityPlans } from '@/hooks/use-community-plans';
import { useEffect, useState } from 'react';
import { MembershipPlan, Community as MembershipCommunity } from '@/types/membership';
import { Community as APICommunity } from '@/types/community';

export const Route = createFileRoute('/onboarding/membresia')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      communityId: (search.communityId as string) || undefined,
    }
  },
  component: OnboardingMembresiaComponent,
});

function OnboardingMembresiaComponent() {
  const { communityId } = Route.useSearch();
  const {
    communities,
    isLoading: communitiesLoading,
    error: communitiesError,
  } = useCommunities();
  const {
    plans,
    isLoading: plansLoading,
    error: plansError,
    fetchCommunityPlans,
  } = useCommunityPlans();

  const [selectedCommunity, setSelectedCommunity] = useState<APICommunity | null>(
    null,
  );
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize with specified community or first community and fetch its plans
  useEffect(() => {
    if (
      !communitiesLoading &&
      communities &&
      communities.length > 0 &&
      !isInitialized
    ) {
      let targetCommunity: APICommunity | undefined;
      
      if (communityId) {
        // Buscar la comunidad específica solicitada
        targetCommunity = communities.find(c => c.id === communityId);
        if (!targetCommunity) {
          console.warn(`🚨 Community with ID ${communityId} not found, using first available`);
        }
      }
      
      // Si no se encontró la comunidad específica o no se proporcionó, usar la primera
      if (!targetCommunity) {
        targetCommunity = communities[0];
      }

      setSelectedCommunity(targetCommunity);

      console.log('🏘️ Available communities:', communities);
      console.log('🎯 Selected community:', targetCommunity);
      console.log('🔍 Requested community ID:', communityId);

      // Fetch plans for the selected community
      fetchCommunityPlans(targetCommunity.id);
      setIsInitialized(true);
    }
  }, [communities, communitiesLoading, isInitialized, communityId]); // REMOVIDO fetchCommunityPlans para evitar loops

  // Convert API Community to Membership Community format
  const convertToMembershipCommunity = (apiCommunity: APICommunity): MembershipCommunity => {
    return {
      id: apiCommunity.id,
      name: apiCommunity.name,
      description: apiCommunity.purpose, // Map purpose to description
      image: apiCommunity.image_url,
      membershipPlans: plans || [], // Use the fetched plans
    };
  };

  // Loading state
  if (communitiesLoading || plansLoading || !isInitialized) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">
              {communitiesLoading
                ? 'Cargando comunidades...'
                : 'Cargando planes de la comunidad...'}
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Error state
  if (communitiesError || plansError) {
    const errorMessage = communitiesError || plansError;
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
            >
              Reintentar
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // No communities found
  if (!communities || communities.length === 0) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              No se encontraron comunidades disponibles.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
            >
              Recargar
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // No plans found for the community
  if (!plans || plans.length === 0) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              No se encontraron planes disponibles para la comunidad "
              {selectedCommunity?.name}".
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
            >
              Recargar
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!selectedCommunity) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">
              Error: No se pudo seleccionar una comunidad.
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  console.log('🎯 Final render with:', {
    selectedCommunity,
    plans: plans.length,
    plansData: plans,
  });

  const membershipCommunity = convertToMembershipCommunity(selectedCommunity);

  return (
    <ProtectedRoute>
      <MembershipOnboardingProvider>
        <MembershipOnboarding community={membershipCommunity} plans={plans} />
      </MembershipOnboardingProvider>
    </ProtectedRoute>
  );
}
