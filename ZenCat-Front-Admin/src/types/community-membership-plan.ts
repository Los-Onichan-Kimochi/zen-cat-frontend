export interface CommunityMembershipPlan {
  id: string;
  community_id: string;
  plan_id: string;
}

export interface CreateCommunityMembershipPlanPayload {
  community_id: string;
  plan_id: string;
}

export interface BulkCreateCommunityMembershipPlanPayload {
  community_plans: CreateCommunityMembershipPlanPayload[];
}

export interface DeleteCommunityMembershipPlanPayload {
  community_id: string;
  plan_id: string;
}

export interface BulkDeleteCommunityMembershipPlanPayload {
  community_plans: DeleteCommunityMembershipPlanPayload[];
}
