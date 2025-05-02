import { Professional, ProfessionalSpecialty } from '@/types/professional';
import { dummyProfessionals } from '@/data/dummy-professionals'; // :v dummy data

// Simulate fetching professional counts
export interface ProfessionalCounts {
  [ProfessionalSpecialty.YOGA_TEACHER]: number;
  [ProfessionalSpecialty.GYM_TEACHER]: number;
  [ProfessionalSpecialty.DOCTOR]: number;
}

// TODO: Add a real API call XD
export const professionalsApi = {
  getProfessionalCounts: (): Promise<ProfessionalCounts> => {
    return new Promise((resolve) => {
      // Calculate counts dynamically from the dummy data
      const calculatedCounts: ProfessionalCounts = {
        [ProfessionalSpecialty.YOGA_TEACHER]: 0,
        [ProfessionalSpecialty.GYM_TEACHER]: 0,
        [ProfessionalSpecialty.DOCTOR]: 0,
      };

      dummyProfessionals.forEach(prof => {
        if (prof.speciality === ProfessionalSpecialty.YOGA_TEACHER) {
          calculatedCounts[ProfessionalSpecialty.YOGA_TEACHER]++;
        } else if (prof.speciality === ProfessionalSpecialty.GYM_TEACHER) {
          calculatedCounts[ProfessionalSpecialty.GYM_TEACHER]++;
        } else if (prof.speciality === ProfessionalSpecialty.DOCTOR) {
          calculatedCounts[ProfessionalSpecialty.DOCTOR]++;
        }
      });

      setTimeout(() => {
        resolve(calculatedCounts); // Resolve with calculated counts
      }, 500);
    });
  },
  
  getProfessionals: (): Promise<Professional[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(dummyProfessionals);
      }, 700); // XDXDXD
    });
  },
}; 