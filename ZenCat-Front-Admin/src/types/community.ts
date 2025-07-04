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
  image_bytes?: string;
}

export interface UpdateCommunityPayload {
  name?: string;
  purpose?: string;
  image_url?: string;
  image_bytes?: string;
}

export interface CommunityWithImage extends Community {
  image_bytes?: string;
}

export interface BulkCreateCommunityPayload {
  communities: CreateCommunityPayload[];
}

export interface BulkDeleteCommunityPayload {
  communities: string[]; // array of communities IDs
}
