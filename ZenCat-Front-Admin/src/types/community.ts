export interface Community {
  id: string;
  name: string;
  purpose: string;
  image_url: string;
  number_subscriptions: number;
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
