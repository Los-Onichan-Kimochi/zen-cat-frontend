import {
  MembershipPlan,
  CreateMembershipPlanPayload,
  UpdateMembershipPlanPayload,
  BulkCreateMembershipPlanPayload,
  BulkDeleteMembershipPlanPayload
} from '@/types/membership-plan';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const membershipPlansApi = {
  
  createMembershipPlan: async (payload: CreateMembershipPlanPayload): Promise<MembershipPlan> => {
    const response = await fetch(`${API_BASE_URL}/plan/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error('Error creating membership plan');
    }
    return response.json();
  },

  bulkCreateMembershipPlans: async (payload: BulkCreateMembershipPlanPayload): Promise<MembershipPlan[]> => {
    const response = await fetch(`${API_BASE_URL}/plan/bulk-create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error('Error bulk creating membership plans');
    }
    const data = await response.json();
    return data.membership_plans || data;
  },

  getMembershipPlans: async (): Promise<MembershipPlan[]> => {
    const response = await fetch(`${API_BASE_URL}/plan/`);
    if (!response.ok) {
      throw new Error('Error fetching membership plans');
    }
    const data = await response.json();
    if (data && Array.isArray(data.plans)) {
      return data.plans;
    } else if (Array.isArray(data)) {
      return data;
    }
    console.error('Unexpected data structure from /plan/ endpoint:', data);
    throw new Error('Unexpected data structure from membership plans API for list');
  },

  getMembershipPlanById: async (id: string): Promise<MembershipPlan> => {
    const response = await fetch(`${API_BASE_URL}/plan/${id}/`);
    if (!response.ok) {
      throw new Error(`Error fetching membership plan with id ${id}`);
    }
    return response.json();
  },

  updateMembershipPlan: async (
    id: string,
    payload: UpdateMembershipPlanPayload
  ): Promise<MembershipPlan> => {
    const response = await fetch(`${API_BASE_URL}/plan/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Error updating membership plan with id ${id}`);
    }
    return response.json();
  },

  deleteMembershipPlan: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/plan/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Error deleting membership plan with id ${id}`);
    }
  },

  bulkDeleteMembershipPlans: async (payload: BulkDeleteMembershipPlanPayload): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/plan/bulk-delete/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error('Error bulk deleting membership plans');
    }
  },

};
