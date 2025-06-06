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

  deleteCommunityMembershipPlan: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/community-plan/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Error deleting community-membership-plan with id ${id}`);
    }
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
  }

}; 