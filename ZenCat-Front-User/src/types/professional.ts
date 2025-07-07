export enum ProfessionalSpecialty {
  YOGA_TEACHER = 'Profesor de Yoga',
  GYM_TEACHER = 'Profesor de Gimnasio',
  DOCTOR = 'Médico',
}

// Nuevo enum para el campo 'type'
export enum ProfessionalType {
  MEDIC = 'MEDIC',
  GYM_TRAINER = 'GYM_TRAINER',
  YOGA_TRAINER = 'YOGA_TRAINER',
}

export interface Professional {
  id: string;
  name: string;
  first_last_name: string;
  second_last_name?: string | null;
  specialty: string; // Este campo usará ProfessionalSpecialty para la UI, pero se envía como string
  email: string;
  phone_number: string;
  type: string; // Este campo usará ProfessionalType para la UI, pero se envía como string
  image_url: string;
}

// Tipos para los payloads de creación y actualización
export interface CreateProfessionalRequest {
  name: string;
  first_last_name: string;
  second_last_name: string;
  specialty: string; // Debería ser un valor de ProfessionalSpecialty
  email: string;
  phone_number: string;
  type: string; // Debería ser un valor de ProfessionalType
  image_url: string;
  image_bytes?: string;
}

export type UpdateProfessionalRequest = Partial<CreateProfessionalRequest>;

//carga masiva;BulkCreateCommunityPayload
export interface BulkCreateProfessionalPayload {
  professionals: CreateProfessionalRequest[];
}

export interface BulkDeleteProfessionalPayload {
  professionals: string[]; // array of professional IDs
}

export interface ProfessionalWithImage extends Professional {
  image_bytes?: string;
}
