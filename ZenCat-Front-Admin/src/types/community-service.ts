export interface CommunityService {
  id: string;
  community_id: string;
  service_id: string;
} 

// Tipos para los payloads de creación y actualización
export interface CreateCommunityServicePayload {
  community_id: string;
  service_id: string;
}

export type BulkCreateCommunityServicePayload = CreateCommunityServicePayload[];