import { CommunityMembershipPlan , BulkCreateCommunityMembershipPlanPayload, BulkDeleteCommunityMembershipPlanPayload } from '@/types/community-membership-plan';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const communityMembershipPlansApi = {

  bulkCreateCommunityMembershipPlans: async (payload: BulkCreateCommunityMembershipPlanPayload): Promise<CommunityMembershipPlan[]> => {
    console.log('Creating community membership plans:', payload);
    const response = await fetch(`${API_BASE_URL}/community-plan/bulk-create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    console.log('Error response:', response);
    if (!response.ok) {
      console.log('Error response:', response);
      throw new Error('Error asociating membership plans with communities');
    }
    return response.json(); 
  },

  deleteCommunityMembershipPlan: async (
    communityId: string,
    planId: string,
  ): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}/community-plan/${communityId}/${planId}/`,
      {
        method: 'DELETE',
      },
    );
    if (!response.ok) throw new Error('Error deleting community-plan');
  },

  bulkDeleteCommunityMembershipPlans: async (payload: BulkDeleteCommunityMembershipPlanPayload): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/community-plan/bulk-delete/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error('Error bulk deleting community-membership-plans');
    }
  },

  getCommunityMembershipPlans: async (communityId?: string, planId?: string): Promise<CommunityMembershipPlan[]> => {
    const queryParams = new URLSearchParams();

    if (communityId) queryParams.append("communityId", communityId);
    if (planId) queryParams.append("planId", planId);

    const response = await fetch(`${API_BASE_URL}/community-plan/?${queryParams.toString()}`);

    if (!response.ok) throw new Error('Error fetching community-membership-plans');
    const data = await response.json();
    
    if (data && Array.isArray(data.community_plans)) {
      return data.community_plans;
    } else if (Array.isArray(data)) {
      return data;
    }
    throw new Error('Unexpected data structure from community-plan API');
  }

}; 