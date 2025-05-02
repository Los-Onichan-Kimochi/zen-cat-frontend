export enum ProfessionalSpecialty {
  YOGA_TEACHER = 'Profesor de Yoga',
  GYM_TEACHER = 'Profesor de Gimnasio',
  DOCTOR = 'Médico',
}

export interface Professional {
    id: string;
    name: string;
    firstLastName: string;
    secondLastName: string;
    speciality: ProfessionalSpecialty;
    email: string;
    phone: string;
    address: string;
    profilePicture: string;
  } 