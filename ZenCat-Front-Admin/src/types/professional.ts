export enum ProfessionalSpecialty {
  YOGA_TEACHER = 'Profesor de Yoga',
  GYM_TEACHER = 'Profesor de Gimnasio',
  DOCTOR = 'Médico',
}

// Nuevo enum para el campo 'type'
export enum ProfessionalType {
  NUTRITIONIST = 'Nutricionista',
  COACH = 'Entrenador',
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
export interface CreateProfessionalPayload {
  name: string;
  first_last_name: string;
  second_last_name: string; 
  specialty: string; // Debería ser un valor de ProfessionalSpecialty
  email: string;
  phone_number: string;
  type: string; // Debería ser un valor de ProfessionalType
  image_url: string;
}

export type UpdateProfessionalPayload = Partial<CreateProfessionalPayload>;