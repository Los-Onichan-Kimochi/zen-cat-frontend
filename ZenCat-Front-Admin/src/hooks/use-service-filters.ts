import { useState, useCallback, useMemo } from 'react';
import { Service } from '@/types/service';
import { ServiceFilters } from '@/components/services/filters';

export function useServiceFilters(initialFilters: ServiceFilters = {}) {
  const [filters, setFilters] = useState<ServiceFilters>(initialFilters);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const applyFilters = useCallback((newFilters: ServiceFilters) => {
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
  const filterServices = useCallback((services: Service[]): Service[] => {
    return services.filter((service) => {
      // Filtro por nombre
      if (filters.name) {
        const serviceName = service.name.toLowerCase();
        const searchName = filters.name.toLowerCase();
        if (!serviceName.includes(searchName)) {
          return false;
        }
      }

      // Filtro por descripción
      if (filters.description) {
        const description = service.description.toLowerCase();
        const searchDescription = filters.description.toLowerCase();
        if (!description.includes(searchDescription)) {
          return false;
        }
      }

      // Filtro por tipo (virtual/presencial)
      if (filters.is_virtual !== undefined) {
        if (service.is_virtual !== filters.is_virtual) {
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
    filterServices,
  };
} 