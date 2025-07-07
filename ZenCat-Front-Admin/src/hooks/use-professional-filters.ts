import { useState, useCallback, useMemo } from 'react';
import { Professional } from '@/types/professional';
import { ProfessionalFilters } from '@/components/professionals/filters';

export function useProfessionalFilters(initialFilters: ProfessionalFilters = {}) {
  const [filters, setFilters] = useState<ProfessionalFilters>(initialFilters);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const applyFilters = useCallback((newFilters: ProfessionalFilters) => {
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(
      ([key, value]) =>
        key !== 'page' &&
        key !== 'limit' &&
        value !== undefined &&
        value !== '' &&
        value !== null,
    );
  }, [filters]);

  // Función para filtrar los datos
  const filterProfessionals = useCallback((professionals: Professional[]): Professional[] => {
    return professionals.filter((professional) => {
      // Filtro por nombre
      if (filters.name) {
        const fullName = `${professional.name} ${professional.first_last_name} ${professional.second_last_name || ''}`.toLowerCase();
        const searchName = filters.name.toLowerCase();
        if (!fullName.includes(searchName)) {
          return false;
        }
      }

      // Filtro por email
      if (filters.email) {
        const email = professional.email.toLowerCase();
        const searchEmail = filters.email.toLowerCase();
        if (!email.includes(searchEmail)) {
          return false;
        }
      }

      // Filtro por teléfono
      if (filters.phone_number) {
        const phone = professional.phone_number.toLowerCase();
        const searchPhone = filters.phone_number.toLowerCase();
        if (!phone.includes(searchPhone)) {
          return false;
        }
      }

      // Filtro por especialidad
      if (filters.specialty) {
        if (professional.specialty !== filters.specialty) {
          return false;
        }
      }

      // Filtro por tipo
      if (filters.type) {
        if (professional.type !== filters.type) {
          return false;
        }
      }

      return true;
    });
  }, [filters]);

  const activeFiltersCount = useMemo(() => {
    return Object.entries(filters).filter(
      ([key, value]) =>
        key !== 'page' &&
        key !== 'limit' &&
        value !== undefined &&
        value !== '' &&
        value !== null,
    ).length;
  }, [filters]);

  return {
    filters,
    isModalOpen,
    hasActiveFilters,
    activeFiltersCount,
    applyFilters,
    clearFilters,
    openModal,
    closeModal,
    filterProfessionals,
  };
} 