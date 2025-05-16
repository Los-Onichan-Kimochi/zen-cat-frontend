export enum ProfessionalSpecialty {
  YOGA_TEACHER = 'Profesor de Yoga',
  GYM_TEACHER = 'Profesor de Gimnasio',
  DOCTOR = 'Médico',
}

export interface Professional {
    id: string;
    name: string;
    first_last_name: string;
    second_last_name?: string | null;
    specialty: string;
    email: string;
    phone_number: string;
    type: string;
    image_url: string;
} 

// Tipos para los payloads xd
export interface CreateProfessionalPayload {
  name: string;
  first_last_name: string;
  second_last_name: string;
  specialty: string;
  email: string;
  phone_number: string;
  type: string;
  image_url: string;
}

export type UpdateProfessionalPayload = Partial<CreateProfessionalPayload>;