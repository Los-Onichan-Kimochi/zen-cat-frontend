export enum ServiceType {
  PRESENCIAL_SERVICE = 'No',
  VIRTUAL_SERVICE = 'Sí',
}

export interface Service {
    id: string;
    name: string;
    description: string;
    image_url: string;
    is_virtual: boolean; // Este campo usará ServiceType para la UI, pero se envía como boolean
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
