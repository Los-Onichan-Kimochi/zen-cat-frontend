import { ProfessionalSpecialty } from '@/types/professional';

// Simulate fetching professional counts
export interface ProfessionalCounts {
  [ProfessionalSpecialty.YOGA_TEACHER]: number;
  [ProfessionalSpecialty.GYM_TEACHER]: number;
  [ProfessionalSpecialty.DOCTOR]: number;
}
const dummyCounts: ProfessionalCounts = {
  [ProfessionalSpecialty.YOGA_TEACHER]: 134,
  [ProfessionalSpecialty.GYM_TEACHER]: 250,
  [ProfessionalSpecialty.DOCTOR]: 60,
};

export const professionalsApi = {
  getProfessionalCounts: (): Promise<ProfessionalCounts> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(dummyCounts);
      }, 500);
    });
  },
}; 