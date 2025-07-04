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

export interface ServiceWithImage extends Service {
  image_bytes?: string;
}

// Tipos para los payloads de creación y actualización
export interface CreateServicePayload {
  name: string;
  description: string;
  image_url: string;
  is_virtual: boolean;
  image_bytes?: string;
}

export type UpdateServicePayload = Partial<CreateServicePayload>;

export type BulkCreateServicePayload = CreateServicePayload[];
//export interface BulkCreateServicePayload {
//services: CreateServicePayload[];
//}
