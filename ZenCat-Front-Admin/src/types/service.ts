export interface Service {
  id: string;
  name: string;
  description: string;
  image_url: string;
  is_virtual: boolean;
} 

// Tipos para los payloads de creación y actualización
export interface CreateServicePayload {
  name: string;
  description: string;
  image_url: string;
  is_virtual: boolean;
}

export type UpdateServicePayload = Partial<CreateServicePayload>;

export type BulkCreateServicePayload = CreateServicePayload[];