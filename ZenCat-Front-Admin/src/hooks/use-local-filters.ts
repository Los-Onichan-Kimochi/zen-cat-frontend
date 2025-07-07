import { useState, useCallback, useMemo } from 'react';
import { Local } from '@/types/local';
import { LocalFilters } from '@/components/locals/filters';

export function useLocalFilters(initialFilters: LocalFilters = {}) {
  const [filters, setFilters] = useState<LocalFilters>(initialFilters);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const applyFilters = useCallback((newFilters: LocalFilters) => {
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
  const filterLocals = useCallback((locals: Local[]): Local[] => {
    return locals.filter((local) => {
      // Filtro por nombre del local
      if (filters.local_name) {
        const localName = local.local_name.toLowerCase();
        const searchName = filters.local_name.toLowerCase();
        if (!localName.includes(searchName)) {
          return false;
        }
      }

      // Filtro por distrito
      if (filters.district) {
        const district = local.district.toLowerCase();
        const searchDistrict = filters.district.toLowerCase();
        if (!district.includes(searchDistrict)) {
          return false;
        }
      }

      // Filtro por provincia
      if (filters.province) {
        const province = local.province.toLowerCase();
        const searchProvince = filters.province.toLowerCase();
        if (!province.includes(searchProvince)) {
          return false;
        }
      }

      // Filtro por región
      if (filters.region) {
        const region = local.region.toLowerCase();
        const searchRegion = filters.region.toLowerCase();
        if (!region.includes(searchRegion)) {
          return false;
        }
      }

      // Filtro por capacidad mínima
      if (filters.min_capacity !== undefined) {
        if (local.capacity < filters.min_capacity) {
          return false;
        }
      }

      // Filtro por capacidad máxima
      if (filters.max_capacity !== undefined) {
        if (local.capacity > filters.max_capacity) {
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
    filterLocals,
  };
} 