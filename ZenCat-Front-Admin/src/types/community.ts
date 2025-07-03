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
  //image_bytes?: number[]; // Array of bytes to send to backend
}

export interface UpdateCommunityPayload {
  name?: string;
  purpose?: string;
  image_url?: string;
  //image_bytes?: number[]; // Array of bytes to send to backend
}

export interface BulkCreateCommunityPayload {
  communities: CreateCommunityPayload[];
}

export interface BulkDeleteCommunityPayload {
  communities: string[]; // array of communities IDs
}
