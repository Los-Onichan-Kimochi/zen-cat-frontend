export interface Community {
  id: string;
  name: string;
  purpose: string;
  image_url: string;
  number_subscriptions: number;
} 

// Tipos para los payloads de creación y actualización
export interface CreateCommunityPayload {
  name: string;
  purpose: string;
  image_url: string;
}

export type UpdateCommunityPayload = Partial<CreateCommunityPayload>;

export type BulkCreateCommunityPayload = CreateCommunityPayload[];