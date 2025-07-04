export interface Community {
  id: string;
  name: string;
  purpose: string;
  image_url: string;
  number_subscriptions: number;
}

export interface CommunityService {
  id: string;
  community_id: string;
  service_id: string;
  // Optional populated relations
  community?: Community;
  service?: any; // Define Service type if needed
}

export interface CommunityPlan {
  id: string;
  community_id: string;
  plan_id: string;
  // Optional populated relations
  community?: Community;
  plan?: import('@/types/membership').MembershipPlan;
}

export interface CreateCommunityPayload {
  name: string;
  purpose: string;
  image_url: string;
}

export type UpdateCommunityPayload = Partial<CreateCommunityPayload>;

export interface BulkCreateCommunityPayload {
  communities: CreateCommunityPayload[];
}

export interface BulkDeleteCommunityPayload {
  communities: string[]; // array of communities IDs
}
