import {
  MembershipPlan,
  CreateMembershipPlanPayload,
  UpdateMembershipPlanPayload,
  BulkCreateMembershipPlanPayload,
  BulkDeleteMembershipPlanPayload,
} from '@/types/membership-plan';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';

export const membershipPlansApi = {
  createMembershipPlan: async (
    payload: CreateMembershipPlanPayload,
  ): Promise<MembershipPlan> => {
    return apiClient.post<MembershipPlan>(API_ENDPOINTS.PLANS.BASE, payload);
  },

  bulkCreateMembershipPlans: async (
    payload: BulkCreateMembershipPlanPayload,
  ): Promise<MembershipPlan[]> => {
    const data = await apiClient.post<any>(
      API_ENDPOINTS.PLANS.BULK_CREATE,
      payload,
    );
    return data.membership_plans || data;
  },

  getMembershipPlans: async (): Promise<MembershipPlan[]> => {
    const data = await apiClient.get<any>(API_ENDPOINTS.PLANS.BASE);
    if (data && Array.isArray(data.plans)) {
      return data.plans;
    } else if (Array.isArray(data)) {
      return data;
    }
    console.error('Unexpected data structure from /plan/ endpoint:', data);
    throw new Error(
      'Unexpected data structure from membership plans API for list',
    );
  },

  getMembershipPlanById: async (id: string): Promise<MembershipPlan> => {
    return apiClient.get<MembershipPlan>(API_ENDPOINTS.PLANS.BY_ID(id));
  },

  updateMembershipPlan: async (
    id: string,
    payload: UpdateMembershipPlanPayload,
  ): Promise<MembershipPlan> => {
    return apiClient.patch<MembershipPlan>(
      API_ENDPOINTS.PLANS.BY_ID(id),
      payload,
    );
  },

  deleteMembershipPlan: async (id: string): Promise<void> => {
    return apiClient.delete(API_ENDPOINTS.PLANS.BY_ID(id));
  },

  bulkDeleteMembershipPlans: async (
    payload: BulkDeleteMembershipPlanPayload,
  ): Promise<void> => {
    return apiClient.delete(API_ENDPOINTS.PLANS.BULK_DELETE, payload);
  },
};
