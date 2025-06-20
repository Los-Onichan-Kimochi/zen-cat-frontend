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

export interface BulkCreateCommunityServicePayload {
  community_services: CreateCommunityServicePayload[];
}

export interface BulkDeleteCommunityServicePayload {
  community_services: string[];
}
